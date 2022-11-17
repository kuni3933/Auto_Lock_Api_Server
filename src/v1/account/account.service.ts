import { Injectable, HttpStatus } from '@nestjs/common';
import { AccountDto } from './dto/account.dto';
import { fs, verifyIdToken } from '../../FirebaseInit';

@Injectable()
export class AccountService {
  //*--------------------------------------------
  //* PostメソッドでUserDBの作成をする場合
  //*--------------------------------------------
  // 作成済み    => resHttpStatus 200
  // 作成に成功  => resHttpStatus 201
  // 作成に失敗  => resHttpStatus 500
  // Tokenエラー => resHttpStatus 401
  async create(AccountDto: AccountDto) {
    // return用Httpステータスコード
    let resHttpStatus: number;
    // uidチェックの結果
    const uid: string = await verifyIdToken(AccountDto.Token).then((uid) => {
      return uid;
    });

    //* uidが登録された正規のuidだった場合
    if (uid != undefined) {
      resHttpStatus = HttpStatus.CREATED;
      let isFirestoreDbExists: boolean = undefined;
      const refFirestoreDb = fs.collection('User');

      //* FirestoreDatabaseにUsers/uidがあるか存在確認
      // 結果true/falseをisFirestoreDbExistsに格納
      await refFirestoreDb
        .doc(uid)
        .get()
        .then((doc) => {
          if (doc.exists) isFirestoreDbExists = true;
        })
        .catch((error) => {
          console.log('Error: refFirestoreDb.doc(uid).get()');
          console.error(error);
          resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        })
        .finally(() => {
          console.log('isFirestoreDbExists: ' + isFirestoreDbExists);
        });
      //*/

      //* FirestoreDbにユーザーデータが無かった場合
      if (
        isFirestoreDbExists != true &&
        resHttpStatus != HttpStatus.INTERNAL_SERVER_ERROR
      ) {
        const pushData = { RaspPiSerialNumber: [], UserName: null };
        await refFirestoreDb
          .doc(uid)
          .set(pushData)
          .catch((err) => {
            console.log('Error: refFirestoreDb.doc(uid).set(pushData)');
            console.log(err);
            resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          });
      }
      //* 作成済みだった場合
      else if (
        isFirestoreDbExists == true &&
        resHttpStatus != HttpStatus.INTERNAL_SERVER_ERROR
      ) {
        resHttpStatus = HttpStatus.OK;
      }
    } else {
      resHttpStatus = HttpStatus.UNAUTHORIZED;
    }

    console.log('\n');
    return resHttpStatus;
  }

  //*--------------------------------------------
  //* DELETEメソッドでUserデータを削除する場合
  //*--------------------------------------------
  // 削除済み    => resHttpStatus 200
  // 削除に成功  => resHttpStatus 204
  // 削除に失敗  => resHttpStatus 500
  // Tokenエラー => resHttpStatus 401
  async remove(AccountDto: AccountDto) {
    // return用Httpステータスコード
    let resHttpStatus: number;
    // uidチェックの結果
    const uid: string = await verifyIdToken(AccountDto.Token).then((uid) => {
      return uid;
    });

    //* uidが登録された正規のuidだった場合
    if (uid != undefined) {
      resHttpStatus = HttpStatus.NO_CONTENT;
      let isFirestoreDbExists: boolean = undefined;
      const refFirestoreDb = fs.collection('User');

      //* FirestoreDatabaseにUsers/uidがあるか存在確認
      // 結果true/falseをisFirestoreDbExistsに格納
      await refFirestoreDb
        .doc(uid)
        .get()
        .then((doc) => {
          if (doc.exists) isFirestoreDbExists = true;
        })
        .catch((error) => {
          console.log('Error: refFirestoreDb.doc(uid).get()');
          console.error(error);
          resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        })
        .finally(() => {
          console.log('isFirestoreDbExists: ' + isFirestoreDbExists);
        });
      //*/

      //* FirestoreDbにユーザーデータが有った場合
      if (
        isFirestoreDbExists == true &&
        resHttpStatus != HttpStatus.INTERNAL_SERVER_ERROR
      ) {
        await refFirestoreDb
          .doc(uid)
          .delete()
          .catch((err) => {
            console.log('Error: refFirestoreDb.doc(uid).delete()');
            console.log(err);
            resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          });
      }
      //* 削除済みだった場合
      else if (
        isFirestoreDbExists != true &&
        resHttpStatus != HttpStatus.INTERNAL_SERVER_ERROR
      ) {
        resHttpStatus = HttpStatus.OK;
      }
    } else {
      resHttpStatus = HttpStatus.UNAUTHORIZED;
    }

    console.log('\n');
    return resHttpStatus;
  }
}
