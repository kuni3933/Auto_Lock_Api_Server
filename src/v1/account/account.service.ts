import { Injectable, HttpStatus } from '@nestjs/common';
import { AccountDto } from './dto/account.dto';
import { auth, refFirestoreDbUser } from '../../FirebaseInit';

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
    let resHttpStatus: number = undefined;
    // uidチェックの結果
    const uid: string = await auth
      .verifyIdToken(AccountDto.Token)
      .then((decodedToken) => {
        return decodedToken.uid;
      })
      .catch((error) => {
        console.log('---------- Error ----------\nverifyIdToken:');
        console.log(error);
        return undefined;
      });
    // FirestoreDatabaseにUsers/uidがあるか存在確認
    if (uid != undefined) {
      await refFirestoreDbUser
        .doc(uid)
        .get()
        .then(() => {
          // 読み取れた場合は作成済みなのでステータスコード200を代入
          resHttpStatus = HttpStatus.OK;
        })
        .catch((error) => {
          console.log('Error: refFirestoreDbUser.doc(uid).get()');
          console.error(error);
          resHttpStatus = HttpStatus.CREATED; // エラーの場合は未作成なのでステータスコード201を代入
        });
    }

    //* uidが登録された正規のuid && FirestoreDbにユーザーデータが無かった場合
    if (uid != undefined && resHttpStatus == 201) {
      const pushData = { RaspPiSerialNumber: [], UserName: null, imageURL: '' };
      await refFirestoreDbUser
        .doc(uid)
        .set(pushData)
        .catch((err) => {
          console.log('Error: refFirestoreDbUser.doc(uid).set(pushData)');
          console.log(err);
          resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        });
    }

    console.log(`resHttpStatus: ${resHttpStatus}\n`);
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
    const uid: string = await auth
      .verifyIdToken(AccountDto.Token)
      .then((decodedToken) => {
        return decodedToken.uid;
      })
      .catch((error) => {
        console.log('---------- Error ----------\nverifyIdToken:');
        console.log(error);
        return undefined;
      });

    //* uidが登録された正規のuidだった場合
    if (uid != undefined) {
      resHttpStatus = HttpStatus.NO_CONTENT;
      let isFirestoreDbExists: boolean = undefined;

      //* FirestoreDatabaseにUsers/uidがあるか存在確認
      // 結果true/falseをisFirestoreDbExistsに格納
      await refFirestoreDbUser
        .doc(uid)
        .get()
        .then((doc) => {
          if (doc.exists) isFirestoreDbExists = true;
        })
        .catch((error) => {
          console.log('Error: refFirestoreDbUser.doc(uid).get()');
          console.error(error);
          resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        })
        .finally(() => {
          console.log(`isFirestoreDbExists: ${isFirestoreDbExists}`);
        });
      //*/

      //* FirestoreDbにユーザーデータが有った場合
      if (
        isFirestoreDbExists == true &&
        resHttpStatus != HttpStatus.INTERNAL_SERVER_ERROR
      ) {
        await refFirestoreDbUser
          .doc(uid)
          .delete()
          .catch((err) => {
            console.log('Error: refFirestoreDbUser.doc(uid).delete()');
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

    console.log(`resHttpStatus: ${resHttpStatus}\n`);
    return resHttpStatus;
  }
}
