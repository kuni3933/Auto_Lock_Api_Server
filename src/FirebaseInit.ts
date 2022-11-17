import * as dotenv from 'dotenv';
import { App, initializeApp, cert } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Database, getDatabase } from 'firebase-admin/database';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

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

// 受け取ったidTokenをチェックする関数
async function verifyIdToken(idToken: string): Promise<string> {
  // return用変数
  // uid: string;
  let uid: string = undefined;

  await auth
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      uid = decodedToken.uid;
    })
    .catch((err) => {
      console.log('Error: verifyIdToken');
      console.log(err);
    })
    .finally(() => {
      console.log(`uid: ${uid}`);
    });
  return uid;
}

export { app, auth, db, fs, verifyIdToken };
