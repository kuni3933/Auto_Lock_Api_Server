import { Injectable, HttpStatus } from '@nestjs/common';
import { AccountDto } from './dto/account.dto';
import { auth, refFirestoreDbUser } from '../../FirebaseInit';

@Injectable()
export class AccountService {
  //*--------------------------------------------
  //* PostメソッドでUserDBの作成をする場合
  //*--------------------------------------------
  // 作成済み    => resHttpStatus 200(HttpStatus.OK)
  // 作成に成功  => resHttpStatus 201(HttpStatus.CREATED)
  // 作成に失敗  => resHttpStatus 500(HttpStatus.INTERNAL_SERVER_ERROR)
  // Tokenエラー => resHttpStatus 401(HttpStatus.UNAUTHORIZED)
  async create(AccountDto: AccountDto) {
    // return用Httpステータスコード
    let resHttpStatus: number = undefined;
    // uidチェックの結果
    const uid: string = await auth
      .verifyIdToken(AccountDto.Token)
      .then((decodedToken) => {
        return decodedToken.uid;
      })
      .catch((err) => {
        console.log('Error: auth.verifyIdToken(AccountDto.Token)');
        console.log(err);
        // トークンエラーの場合はステータスコード401を代入
        resHttpStatus = HttpStatus.UNAUTHORIZED;
        return undefined;
      });

    //* uidが登録された正規のuidだった場合
    if (uid != undefined) {
      //* FirestoreDatabaseにUsers/uidがあるか存在確認
      await refFirestoreDbUser
        .doc(uid)
        .get()
        .then((doc) => {
          console.log(`doc.exists: ${doc.exists}`);
          if (doc.exists) {
            // 作成済み の場合はステータスコード200を代入
            resHttpStatus = HttpStatus.OK;
          }
          // 未作成 の場合はステータスコード201を代入
          else {
            resHttpStatus = HttpStatus.CREATED;
          }
        })
        .catch((err) => {
          console.log('Error: refFirestoreDbUser.doc(uid).get()');
          console.error(err);
          resHttpStatus = HttpStatus.CREATED; // エラーの場合は未作成なのでステータスコード201を代入
        });
    }
    //*/

    //* uidが登録された正規のuid && FirestoreDbにユーザーデータが無かった場合
    if (uid != undefined && resHttpStatus == HttpStatus.CREATED) {
      const pushData = { RaspPiSerialNumber: [], UserName: '', imageURL: '' };
      await refFirestoreDbUser
        .doc(uid)
        .set(pushData)
        .catch((err) => {
          console.log('Error: refFirestoreDbUser.doc(uid).set(pushData)');
          console.log(err);
          // エラーが発生した場合はステータスコード401を代入
          resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        });
    }
    //*/

    //* return
    console.log(`resHttpStatus: ${resHttpStatus}\n`);
    return resHttpStatus;
  }

  //*--------------------------------------------
  //* DELETEメソッドでUserデータを削除する場合
  //*--------------------------------------------
  // 削除済み    => resHttpStatus 200(HttpStatus.OK)
  // 削除に成功  => resHttpStatus 204(HttpStatus.NO_CONTENT)
  // 削除に失敗  => resHttpStatus 500(HttpStatus.INTERNAL_SERVER_ERROR)
  // Tokenエラー => resHttpStatus 401(HttpStatus.UNAUTHORIZED)
  async remove(AccountDto: AccountDto) {
    // return用Httpステータスコード
    let resHttpStatus: number;
    // uidチェックの結果
    const uid: string = await auth
      .verifyIdToken(AccountDto.Token)
      .then((decodedToken) => {
        return decodedToken.uid;
      })
      .catch((err) => {
        console.log('Error: auth.verifyIdToken(AccountDto.Token)');
        console.log(err);
        // トークンエラーの場合はステータスコード401を代入
        resHttpStatus = HttpStatus.UNAUTHORIZED;
        return undefined;
      });

    //* uidが登録された正規のuidだった場合
    if (uid != undefined) {
      //* FirestoreDatabaseにUsers/uidがあるか存在確認
      await refFirestoreDbUser
        .doc(uid)
        .get()
        .then((doc) => {
          console.log(`doc.exists: ${doc.exists}`);
          // データが存在 の場合はステータスコード204を代入
          if (doc.exists) {
            resHttpStatus = HttpStatus.NO_CONTENT;
          }
          // データが無かった の場合はステータスコード200を代入
          else {
            resHttpStatus = HttpStatus.OK;
          }
        })
        .catch((err) => {
          console.log('Error: refFirestoreDbUser.doc(uid).get()');
          console.error(err);
          // 存在していなかった場合はステータスコード200を代入
          resHttpStatus = HttpStatus.OK;
        });
    }
    //*/

    //* FirestoreDbにユーザーデータが有った場合
    if (uid != undefined && resHttpStatus == HttpStatus.NO_CONTENT) {
      await refFirestoreDbUser
        .doc(uid)
        .delete()
        .catch((err) => {
          console.log('Error: refFirestoreDbUser.doc(uid).delete()');
          console.log(err);
          // エラーが発生した場合はステータスコード401を代入
          resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        });
    }
    //*/

    //* return
    console.log(`resHttpStatus: ${resHttpStatus}\n`);
    return resHttpStatus;
  }
}
