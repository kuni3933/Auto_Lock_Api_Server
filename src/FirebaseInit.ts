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

// 受け取ったidTokenのチェック
async function verifyIdToken(idToken: string): Promise<object> {
  // return用Object uidObjのtype
  type uidObjType = {
    isUser: boolean;
    uid?: string;
  };
  const uidObj: uidObjType = { isUser: undefined };

  await auth
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      uidObj.isUser = true;
      uidObj.uid = decodedToken.uid;
    })
    .catch((err) => {
      uidObj.isUser = false;
      console.log('Error:');
      console.log(err);
      console.log('\n');
    });
  return uidObj;
}

export { app, auth, db, fs, verifyIdToken };
