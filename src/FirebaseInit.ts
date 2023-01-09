import * as dotenv from 'dotenv';
import { App, initializeApp, cert } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Database, getDatabase, Reference } from 'firebase-admin/database';
import {
  CollectionReference,
  Firestore,
  FieldValue,
  getFirestore,
} from 'firebase-admin/firestore';

dotenv.config();
const databaseURL: string = process.env.FIREBASE_MYAPP_CREDENTIALS;

const app: App = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_project_id,
    privateKey: process.env.FIREBASE_private_key,
    clientEmail: process.env.FIREBASE_client_email,
  }),
  databaseURL: databaseURL,
});

const auth: Auth = getAuth(app);
const db: Database = getDatabase(app);
const fs: Firestore = getFirestore(app);
// RealtimeDatabaseRef
const refRealtimeDbRasppi: Reference = db.ref('RaspPi');
// FirestoreRef
const refFirestoreDbRasppi: CollectionReference = fs.collection('RaspPi');
// FirestoreRefUser
const refFirestoreDbUser: CollectionReference = fs.collection('User');

export {
  app,
  auth,
  db,
  fs,
  FieldValue,
  refFirestoreDbRasppi,
  refFirestoreDbUser,
  refRealtimeDbRasppi,
};
