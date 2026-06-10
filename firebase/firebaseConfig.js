// /firebase/firebaseConfig.js

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,

  collection,
  collectionGroup,

  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,

  getDoc,
  getDocs,

  doc,

  query,
  where,
  orderBy,
  limit,
  startAfter,

  serverTimestamp,
  Timestamp,

  increment,
  arrayUnion,
  arrayRemove,

  writeBatch,
  runTransaction,

  onSnapshot,

  enableNetwork,
  disableNetwork,

  connectFirestoreEmulator

} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject

} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator

} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-functions.js";

import {
  getMessaging,
  getToken,
  onMessage

} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging.js";

import {
  getAnalytics,
  isSupported

} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";



/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};



/* =========================
   APP INIT
========================= */

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);



/* =========================
   FIRESTORE INIT
========================= */

const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,

  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});



/* =========================
   AUTH
========================= */

const auth = getAuth(app);



/* =========================
   STORAGE
========================= */

const storage = getStorage(app);



/* =========================
   FUNCTIONS
========================= */

const functions = getFunctions(app);



/* =========================
   MESSAGING
========================= */

let messaging = null;

try {
  messaging = getMessaging(app);
}
catch (error) {
  console.warn("Firebase Messaging non supporté :", error);
}



/* =========================
   ANALYTICS
========================= */

let analytics = null;

(async () => {
  try {
    const supported = await isSupported();

    if (supported) {
      analytics = getAnalytics(app);
    }
  }
  catch (error) {
    console.warn("Firebase Analytics non supporté :", error);
  }
})();



/* =========================
   EMULATORS (DEV ONLY)
========================= */

// Exemple futur :
// if (location.hostname === "localhost") {
//   connectFirestoreEmulator(db, "127.0.0.1", 8080);
//   connectFunctionsEmulator(functions, "127.0.0.1", 5001);
// }



/* =========================
   NETWORK HELPERS
========================= */

async function goOffline() {
  try {
    await disableNetwork(db);
  }
  catch (error) {
    console.error("Erreur offline :", error);
  }
}

async function goOnline() {
  try {
    await enableNetwork(db);
  }
  catch (error) {
    console.error("Erreur online :", error);
  }
}



/* =========================
   EXPORTS
========================= */
export {
  /* CORE */
  app,
  db,
  auth,
  storage,
  functions,
  messaging,
  analytics,

  /* FIRESTORE */
  collection,
  collectionGroup,

  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,

  getDoc,
  getDocs,

  doc,

  query,
  where,
  orderBy,
  limit,
  startAfter,

  serverTimestamp,
  Timestamp,

  increment,
  arrayUnion,
  arrayRemove,

  writeBatch,
  runTransaction,

  onSnapshot,

  /* STORAGE */
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  /* FUNCTIONS */
  httpsCallable,
  /* MESSAGING */
  getToken,
  onMessage,
  /* NETWORK */
  goOffline,
  goOnline
};