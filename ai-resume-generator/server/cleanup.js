import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin with service account
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const auth = admin.auth();
const firestore = admin.firestore();

async function deleteAllAuthUsers(nextPageToken) {
  try {
    const listUsersResult = await auth.listUsers(100, nextPageToken);
    const deletePromises = listUsersResult.users.map(user => auth.deleteUser(user.uid));
    
    await Promise.all(deletePromises);
    console.log(`Successfully deleted ${deletePromises.length} users`);
    
    if (listUsersResult.pageToken) {
      await deleteAllAuthUsers(listUsersResult.pageToken);
    }
  } catch (error) {
    console.error('Error deleting users:', error);
    throw error;
  }
}

async function deleteAllFirestoreData() {
  try {
    const collections = await firestore.listCollections();
    const deletePromises = collections.map(collection => {
      return deleteCollection(collection);
    });
    
    await Promise.all(deletePromises);
    console.log('Successfully deleted all Firestore collections');
  } catch (error) {
    console.error('Error deleting Firestore data:', error);
    throw error;
  }
}

async function deleteCollection(collectionRef, batchSize = 100) {
  const query = collectionRef.limit(batchSize);
  const snapshot = await query.get();
  
  if (snapshot.size === 0) {
    return;
  }
  
  const batch = firestore.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  
  // Recursively delete the next batch
  await deleteCollection(collectionRef, batchSize);
}

async function cleanup() {
  try {
    console.log('Starting cleanup process...');
    
    console.log('Deleting all Firebase Auth users...');
    await deleteAllAuthUsers();
    
    console.log('Deleting all Firestore data...');
    await deleteAllFirestoreData();
    
    console.log('Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanup();
