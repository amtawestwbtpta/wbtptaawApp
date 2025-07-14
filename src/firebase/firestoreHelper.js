// firestoreHelper.js
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  limit,
} from '@react-native-firebase/firestore';

const db = getFirestore();

/**
 * Get single document with merged ID
 * @param {string} collectionName
 * @param {string} documentId
 * @returns {Promise<{ id: string, ...data } | null>}
 */
export const getDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Firestore getDocument error:', error);
    throw error;
  }
};

// Add to firestoreHelper.js
/**
 * Get document by unique field value
 * @param {string} collectionName
 * @param {string} field
 * @param {any} value
 * @returns {Promise<{ id: string, ...data } | null>}
 */
export const getDocumentByField = async (collectionName, field, value) => {
  try {
    const q = query(
      collection(getFirestore(), collectionName),
      where(field, '==', value),
      limit(1),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error(
      `Firestore getDocumentByField error (${collectionName}/${field}/${value}):`,
      error,
    );
    throw error;
  }
};

/**
 * Get entire collection with merged IDs
 * @param {string} collectionName
 * @param {Array} conditions - Optional query conditions [['field', 'operator', value]]
 * @returns {Promise<Array<{ id: string, ...data }>>}
 */
export const getCollection = async (collectionName, conditions = []) => {
  try {
    let ref = collection(db, collectionName);

    // Apply query conditions if provided
    if (conditions.length > 0) {
      const queryConditions = conditions.map(cond => where(...cond));
      ref = query(ref, ...queryConditions);
    }

    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Firestore getCollection error:', error);
    throw error;
  }
};

/**
 * Create or overwrite document
 * @param {string} collectionName
 * @param {string} documentId
 * @param {Object} data
 */
export const setDocument = async (collectionName, documentId, data) => {
  console.log(collectionName, documentId, data);
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, data);
  } catch (error) {
    console.error('Firestore setDocument error:', error);
    throw error;
  }
};

/**
 * Update existing document
 * @param {string} collectionName
 * @param {string} documentId
 * @param {Object} updates
 */
export const updateDocument = async (collectionName, documentId, updates) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Firestore updateDocument error:', error);
    throw error;
  }
};

/**
 * Delete document
 * @param {string} collectionName
 * @param {string} documentId
 */
export const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Firestore deleteDocument error:', error);
    throw error;
  }
};

export const batchWrite = async operations => {
  const batch = writeBatch(db);
  operations.forEach(({ type, collection, id, data }) => {
    const docRef = doc(db, collection, id);
    if (type === 'delete') batch.delete(docRef);
    if (type === 'update') batch.update(docRef, data);
    if (type === 'set') batch.set(docRef, data);
  });
  await batch.commit();
};

/**
 * Delete all documents matching a query
 * @param {string} collectionName
 * @param {Array} conditions - [['field', 'operator', value], ...]
 * @returns {Promise<number>} - Count of deleted documents
 */
export const deleteMatchingDocuments = async (collectionName, conditions) => {
  try {
    const db = getFirestore();
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...conditions.map(cond => where(...cond)));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return 0;

    const batch = writeBatch(db);
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    return snapshot.size;
  } catch (error) {
    console.error(`deleteMatchingDocuments error (${collectionName}):`, error);
    throw error;
  }
};

export const queryDocuments = async (
  collectionName,
  conditions = [],
  sortOptions = null,
  convertTimestamps = false,
) => {
  let ref = collection(db, collectionName);

  // Apply query conditions
  if (conditions.length > 0) {
    const queryConditions = conditions.map(cond => where(...cond));
    ref = query(ref, ...queryConditions);
  }

  // Apply sorting
  if (sortOptions) {
    ref = query(
      ref,
      orderBy(sortOptions.field, sortOptions.direction || 'asc'),
    );
  }

  const snapshot = await getDocs(ref);

  return snapshot.docs.map(doc => {
    const data = doc.data();

    // Convert Timestamps to Dates
    if (convertTimestamps) {
      Object.keys(data).forEach(key => {
        if (data[key] && typeof data[key].toDate === 'function') {
          data[key] = data[key].toDate();
        }
      });
    }

    return { id: doc.id, ...data };
  });
};
export const deleteMessagesInChat = async chatId => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const batchSize = 500; // Firestore batch limit

  try {
    const querySnapshot = await getDocs(messagesRef);

    if (querySnapshot.empty) return;

    // Process in chunks of 500
    for (let i = 0; i < querySnapshot.docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = querySnapshot.docs.slice(i, i + batchSize);

      chunk.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(
        `Deleted ${chunk.length} messages (batch ${i / batchSize + 1})`,
      );
    }

    console.log(
      `Total ${querySnapshot.size} messages deleted from chat ${chatId}`,
    );
  } catch (error) {
    console.error(`Error deleting messages in chat ${chatId}:`, error);
    throw error;
  }
};

export const delChats = async user => {
  const otherMembers = members.filter(el => el.empid !== user.empid);

  // Generate all unique chat collection names
  const chatCollections = [
    ...otherMembers.map(el => `${user.empid}-${el.empid}`),
    ...otherMembers.map(el => `${el.empid}-${user.empid}`),
  ];

  // Use Set to remove duplicates
  const uniqueChats = [...new Set(chatCollections)];

  console.log(`Deleting chats for user ${user.empid}:`, uniqueChats);

  // Delete messages in all relevant chat collections
  await Promise.all(uniqueChats.map(chatId => deleteMessagesInChat(chatId)));

  console.log(`All chats deleted for user ${user.empid}`);
};
