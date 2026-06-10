// /firebase/firestore.js

import {
  db,

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

  onSnapshot

} from "./firebaseConfig.js";



/* =========================
   COLLECTION REF
========================= */
function col(collectionName) {
  return collection(db, collectionName);
}



/* =========================
   DOCUMENT REF
========================= */
function docRef(collectionName, docId) {
  return doc(db, collectionName, docId);
}



/* =========================
   CREATE DOCUMENT
========================= */
async function createDocument(collectionName, data = {}) {

  return await addDoc(
    col(collectionName),
    {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  );

}



/* =========================
   SET DOCUMENT
========================= */
async function setDocument(collectionName, docId, data = {}) {

  return await setDoc(
    docRef(collectionName, docId),
    {
      ...data,
      updatedAt: serverTimestamp()
    },
    {
      merge: true
    }
  );

}



/* =========================
   UPDATE DOCUMENT
========================= */
async function updateDocument(collectionName, docId, data = {}) {

  return await updateDoc(
    docRef(collectionName, docId),
    {
      ...data,
      updatedAt: serverTimestamp()
    }
  );

}



/* =========================
   DELETE DOCUMENT
========================= */
async function deleteDocument(collectionName, docId) {

  return await deleteDoc(
    docRef(collectionName, docId)
  );

}



/* =========================
   GET DOCUMENT
========================= */
async function getDocument(collectionName, docId) {

  const snap = await getDoc(
    docRef(collectionName, docId)
  );

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data()
  };

}



/* =========================
   GET COLLECTION
========================= */
async function getCollection(collectionName) {

  const snap = await getDocs(
    col(collectionName)
  );

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data()
  }));

}



/* =========================
   QUERY DOCUMENTS
========================= */
async function queryDocuments({
  collectionName,
  filters = [],
  sortField = null,
  sortDirection = "desc",
  limitCount = 20,
  lastDoc = null
}) {

  const constraints = [];

  filters.forEach((filter) => {
    constraints.push(
      where(
        filter.field,
        filter.operator,
        filter.value
      )
    );
  });

  if (sortField) {
    constraints.push(
      orderBy(sortField, sortDirection)
    );
  }

  constraints.push(
    limit(limitCount)
  );

  if (lastDoc) {
    constraints.push(
      startAfter(lastDoc)
    );
  }

  const q = query(
    col(collectionName),
    ...constraints
  );

  const snap = await getDocs(q);

  return {
    documents: snap.docs.map((item) => ({
      id: item.id,
      ...item.data()
    })),
    lastVisible: snap.docs[snap.docs.length - 1] || null
  };

}



/* =========================
   REALTIME LISTENER
========================= */
function listenCollection(
  collectionName,
  callback
) {

  return onSnapshot(
    col(collectionName),
    (snap) => {

      const data = snap.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      callback(data);

    }
  );

}



/* =========================
   REALTIME DOCUMENT
========================= */
function listenDocument(
  collectionName,
  docId,
  callback
) {

  return onSnapshot(
    docRef(collectionName, docId),
    (snap) => {

      if (!snap.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snap.id,
        ...snap.data()
      });

    }
  );

}



/* =========================
   INCREMENT FIELD
========================= */
async function incrementField(
  collectionName,
  docId,
  field,
  value = 1
) {

  return await updateDoc(
    docRef(collectionName, docId),
    {
      [field]: increment(value),
      updatedAt: serverTimestamp()
    }
  );

}



/* =========================
   ARRAY UNION
========================= */
async function addToArray(
  collectionName,
  docId,
  field,
  value
) {

  return await updateDoc(
    docRef(collectionName, docId),
    {
      [field]: arrayUnion(value),
      updatedAt: serverTimestamp()
    }
  );

}



/* =========================
   ARRAY REMOVE
========================= */
async function removeFromArray(
  collectionName,
  docId,
  field,
  value
) {

  return await updateDoc(
    docRef(collectionName, docId),
    {
      [field]: arrayRemove(value),
      updatedAt: serverTimestamp()
    }
  );

}



/* =========================
   BATCH WRITER
========================= */
function createBatch() {
  return writeBatch(db);
}



/* =========================
   TRANSACTION
========================= */
async function transaction(handler) {
  return await runTransaction(db, handler);
}



/* =========================
   EXPORTS
========================= */
export {

  db,

  Timestamp,
  serverTimestamp,

  collectionGroup,

  col,
  docRef,

  createDocument,
  setDocument,
  updateDocument,
  deleteDocument,

  getDocument,
  getCollection,

  queryDocuments,

  listenCollection,
  listenDocument,

  incrementField,

  addToArray,
  removeFromArray,

  createBatch,
  transaction
};