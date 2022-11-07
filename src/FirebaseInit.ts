import * as dotenv from 'dotenv';
import { App, applicationDefault, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Database, getDatabase } from 'firebase-admin/database';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

dotenv.config({
  path: '~/ghq/github.com/kuni3933/Auto_Lock_Api_Server/src/.env',
});

const databaseURL: string = process.env.FIREBASE_MYAPP_CREDENTIALS;

const app: App = initializeApp({
  credential: applicationDefault(),
  databaseURL: databaseURL,
});
const auth: Auth = getAuth(app);
const db: Database = getDatabase(app);
const fs: Firestore = getFirestore(app);
export { app, auth, db, fs };
