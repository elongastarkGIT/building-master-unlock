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
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

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

  const [userSnap, adminSnap] = await Promise.all([
    getDoc(userRef),
    getDoc(adminRef)
  ]);

  if (!userSnap.exists() && !adminSnap.exists()) {
    return null;
  }

  const data = userSnap.exists()
    ? { ...userSnap.data() }
    : {
        uid: user.uid,
        fullName: user.displayName || "",
        email: user.email || "",
        phone: "",
        role: "user",
        status: USER_STATUS_ACTIVE
      };

  if (adminSnap.exists()) {
    const adminData = adminSnap.data();

    if (adminData.role) {
      data.role = adminData.role;
    }

    if (adminData.status) {
      data.status = adminData.status;
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
function listenAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {

    if (!user) {
      currentUser = null;
      currentUserData = null;
      callback(null);
      return;
    }

    const data = await loadUserSessionData(user);

    if (!data) {
      await signOut(auth);
      currentUser = null;
      currentUserData = null;
      callback(null);
      return;
    }

    currentUser = user;
    currentUserData = data;

    callback({
      auth: user,
      data
    });
  });
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
