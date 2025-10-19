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
  orderBy,
} from '@react-native-firebase/firestore';

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from '@react-native-firebase/storage';

import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

export const firestore = getFirestore();

/**
 * Get single document with merged ID
 * @param {string} collectionName
 * @param {string} documentId
 * @returns {Promise<{ id: string, ...data } | null>}
 */
export const getDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(firestore, collectionName, documentId);
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

    const document = snapshot.docs[0];
    return { id: document.id, ...document.data() };
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
    let ref = collection(firestore, collectionName);

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
    const docRef = doc(firestore, collectionName, documentId);
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
    const docRef = doc(firestore, collectionName, documentId);
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
    const docRef = doc(firestore, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Firestore deleteDocument error:', error);
    throw error;
  }
};

export const batchWrite = async operations => {
  const batch = writeBatch(firestore);
  operations.forEach(({ type, collection, id, data }) => {
    const docRef = doc(firestore, collection, id);
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
    const colRef = collection(firestore, collectionName);
    const q = query(colRef, ...conditions.map(cond => where(...cond)));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return 0;

    const batch = writeBatch(firestore);
    snapshot.forEach(document => batch.delete(document.ref));
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
  let ref = collection(firestore, collectionName);

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

  return snapshot.docs.map(document => {
    const data = document.data();

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

/**
 * Updates the 'convenor' field for multiple documents in a collection.
 * @param {string} collectionName - Firestore collection name
 * @param {Array<{ id: string }>} docs - Array of documents (each must have an `id`)
 * @param {'taw' | 'admin'} convenorValue - The new convenor value
 */
export const updateConvenorBatch = async (
  collectionName,
  docs,
  convenorValue,
) => {
  try {
    const batch = writeBatch(firestore);

    for (const item of docs) {
      if (!item.id) continue;
      const docRef = doc(firestore, collectionName, item.id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        batch.update(docRef, { convenor: convenorValue });
      } else {
        console.warn(`⚠️ Skipping missing doc: ${item.id}`);
      }
    }

    await batch.commit();
    console.log('✅ Batch update completed');
  } catch (error) {
    console.log(error);
  }
};

/**
 * Safely updates a specific field for multiple documents in a Firestore collection.
 * It only updates existing documents (skips missing ones).
 *
 * @param {string} collectionName - Firestore collection name
 * @param {Array<{ id: string }>} docs - Array of objects (each must have an `id`)
 * @param {string} key - The field name to update
 * @param {any} value - The new value to set for the field
 */
export const safeBatchUpdateField = async (
  collectionName,
  docs,
  key,
  value,
) => {
  try {
    if (!collectionName || typeof collectionName !== 'string') {
      throw new Error('❌ Invalid collection name.');
    }
    if (!Array.isArray(docs) || docs.length === 0) {
      throw new Error('❌ docs must be a non-empty array.');
    }
    if (!key || typeof key !== 'string') {
      throw new Error('❌ key must be a valid field name string.');
    }

    const batch = writeBatch(firestore);
    const validDocs = [];

    for (const item of docs) {
      if (!item.id) {
        console.warn('⚠️ Skipping item without id:', item);
        continue;
      }

      const docRef = doc(firestore, collectionName, item.id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        batch.update(docRef, { [key]: value });
        validDocs.push(item.id);
      } else {
        console.warn(`⚠️ Skipping missing document: ${item.id}`);
      }
    }

    if (validDocs.length > 0) {
      await batch.commit();
      console.log(
        `✅ Updated ${validDocs.length} documents: set "${key}" =`,
        value,
      );
    } else {
      console.warn('⚠️ No valid documents found to update.');
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Upload local file (file:// or content:// via fileCopyUri) to Firebase Storage
 */
const resolveFilePath = async (uri, name) => {
  if (uri.startsWith('content://')) {
    // Copy content URI into app's cache dir
    const destPath = `${RNFS.CachesDirectoryPath}/${Date.now()}_${name}`;
    try {
      await RNFS.copyFile(uri, destPath);
      return destPath;
    } catch (err) {
      console.warn('⚠️ RNFS.copyFile failed, fallback to blob fetch', err);
      // Fallback: try fetching content URI as blob and writing manually
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await RNFS.writeFile(destPath, buffer.toString('base64'), 'base64');
      return destPath;
    }
  } else if (uri.startsWith('file://')) {
    return uri.replace('file://', '');
  } else {
    throw new Error(`Unsupported URI format: ${uri}`);
  }
};

/**
 * Upload file to Firebase Storage (modular API)
 * @param {Object} file - The file object returned from DocumentPicker
 * @param {string} fileName - The Name of the file to be uploaded
 * @param {string} folderPath - Folder path in Firebase Storage (e.g., "uploads/")
 * @param {function(number):void} onProgress - Optional callback for upload progress (0–100)
 * @returns {Promise<string>} downloadURL
 */

/**
 * Upload file (content:// or file://) to Firebase Storage (modular API)
 */
export const uploadFileToStorage = async (
  file,
  fileName,
  folderPath = 'uploads',
  onProgress,
) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `${folderPath}/${fileName}`);

    // ✅ Resolve safe file path
    const safePath = await resolveFilePath(file, fileName);

    // ✅ Read as base64 and convert to Buffer
    const base64Data = await RNFS.readFile(safePath, 'base64');
    const blob = Buffer.from(base64Data, 'base64');

    // ✅ Upload to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {
          if (onProgress) {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        error => {
          console.error('❌ Upload failed:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('✅ Uploaded:', downloadURL);
          resolve(downloadURL);
        },
      );
    });
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from Firebase Storage
 * @param {string} storagePath - Path to the file in Firebase Storage (e.g., "uploads/169234234_file.pdf")
 */
export const deleteFileFromStorage = async storagePath => {
  console.log(storagePath);
  try {
    const storage = getStorage();
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
    console.log('✅ File deleted successfully:', storagePath);
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
};
