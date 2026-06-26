// /firebase/auth.js

import { auth } from "./firebaseConfig.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
  db,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "./firebaseConfig.js";

import {
  isString,
  isEmail,
  isPhone
} from "../utils/validators.js";

import {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone
} from "../utils/sanitizer.js";

const googleProvider = new GoogleAuthProvider();

const COL_USERS = "users";
const COL_ADMINS = "admins";
const USER_STATUS_ACTIVE = "active";

let currentUser = null;
let currentUserData = null;

/* =========================
   LOAD USER SESSION DATA
========================= */
async function loadUserSessionData(user) {
  const userRef = doc(db, COL_USERS, user.uid);
  const adminRef = doc(db, COL_ADMINS, user.uid);

  let userSnap = null;
  let adminSnap = null;

  try {
    userSnap = await getDoc(userRef);
  } catch (error) {
    console.error("USER PROFILE READ ERROR:", error);
  }

  try {
    adminSnap = await getDoc(adminRef);
  } catch (error) {
    console.error("ADMIN PROFILE READ ERROR:", error);
  }

  if (!userSnap?.exists() && !adminSnap?.exists()) {
    return null;
  }

  const data = userSnap?.exists()
    ? { ...userSnap.data() }
    : {
        uid: user.uid,
        fullName: user.displayName || "",
        email: user.email || "",
        phone: "",
        role: "user",
        status: USER_STATUS_ACTIVE
      };

  if (adminSnap?.exists()) {
    const adminData = adminSnap.data();

    if (adminData.active === false) {
      return null;
    }

    if (adminData.role) {
      data.role = adminData.role;
    }

    if (adminData.status) {
      data.status = adminData.status;
    } else if (adminData.active === true || adminData.active === undefined) {
      data.status = USER_STATUS_ACTIVE;
    }
  }

  if (data.status !== USER_STATUS_ACTIVE) {
    return null;
  }

  return data;
}

/* =========================
   CREATE ACCOUNT (EMAIL)
========================= */
async function registerUser({ fullName, email, password, phone }) {
  const cleanName = sanitizeText(fullName);
  const cleanEmail = sanitizeEmail(email);
  const cleanPhone = sanitizePhone(phone);

  if (!isString(cleanName) || !isEmail(cleanEmail) || !isPhone(cleanPhone)) {
    throw new Error("INVALID_USER_DATA");
  }

  if (typeof password !== "string" || password.length < 8) {
    throw new Error("INVALID_PASSWORD");
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = cred.user;

  const userData = {
    uid: user.uid,
    fullName: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    role: "user",
    status: USER_STATUS_ACTIVE,
    emailVerified: false,
    phoneVerified: false,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, COL_USERS, user.uid), userData);

  await updateProfile(user, {
    displayName: cleanName
  });

  return user;
}

/* =========================
   LOGIN EMAIL
========================= */
async function loginUser(email, password) {
  const cleanEmail = sanitizeEmail(email);

  if (!isEmail(cleanEmail) || typeof password !== "string" || !password) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return cred.user;
}

/* =========================
   GOOGLE LOGIN
========================= */
async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  const user = cred.user;

  const ref = doc(db, COL_USERS, user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const adminSnap = await getDoc(doc(db, COL_ADMINS, user.uid));

    if (!adminSnap.exists()) {
      const fullName = sanitizeText(user.displayName || "User");
      const cleanEmail = sanitizeEmail(user.email || "");

      await setDoc(ref, {
        uid: user.uid,
        fullName,
        email: cleanEmail,
        phone: "",
        role: "user",
        status: USER_STATUS_ACTIVE,
        emailVerified: user.emailVerified || false,
        phoneVerified: false,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }

  return user;
}

/* =========================
   LOGOUT
========================= */
async function logoutUser() {
  await signOut(auth);
}

/* =========================
   RESET PASSWORD
========================= */
async function resetPassword(email) {
  const cleanEmail = sanitizeEmail(email);

  if (!isEmail(cleanEmail)) {
    throw new Error("INVALID_EMAIL");
  }

  return await sendPasswordResetEmail(auth, cleanEmail);
}

/* =========================
   SESSION SYSTEM (CORE)
========================= */
const authCallbacks = new Set();
let authStateUnsubscribe = null;

async function buildSession(user) {
  if (!user) {
    currentUser = null;
    currentUserData = null;
    return null;
  }

  const data = await loadUserSessionData(user);

  if (!data) {
    await signOut(auth);
    currentUser = null;
    currentUserData = null;
    return null;
  }

  currentUser = user;
  currentUserData = data;

  return {
    auth: user,
    data
  };
}

function notifyAuthCallbacks(session) {
  authCallbacks.forEach((callback) => {
    callback(session);
  });
}

function listenAuth(callback) {
  if (typeof callback !== "function") {
    return () => {};
  }

  authCallbacks.add(callback);

  if (!authStateUnsubscribe) {
    authStateUnsubscribe = onAuthStateChanged(auth, async (user) => {
      const session = await buildSession(user);
      notifyAuthCallbacks(session);
    });
  } else if (currentUser && currentUserData) {
    callback({
      auth: currentUser,
      data: currentUserData
    });
  } else if (!auth.currentUser) {
    callback(null);
  }

  return () => {
    authCallbacks.delete(callback);
  };
}

/* =========================
   ROLE SYSTEM
========================= */
function hasRole(roles = []) {
  if (!currentUserData) return false;
  if (roles.length === 0) return true;
  return roles.includes(currentUserData.role);
}

/* =========================
   GETTERS
========================= */
function getCurrentUser() {
  return currentUser;
}

function getCurrentUserData() {
  return currentUserData;
}

/* =========================
   EXPORT
========================= */
export {
  auth,

  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  resetPassword,

  listenAuth,

  hasRole,
  getCurrentUser,
  getCurrentUserData
};
