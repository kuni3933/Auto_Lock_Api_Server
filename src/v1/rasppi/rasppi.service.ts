import { Injectable, HttpStatus } from '@nestjs/common';
import { RasppiDto } from './dto/rasppi.dto';
import {
  auth,
  FieldValue,
  refFirestoreDbRasppi,
  refFirestoreDbUser,
  refRealtimeDbRasppi,
} from '../../FirebaseInit';

@Injectable()
export class RasppiService {
  //*--------------------------------------------
  //* Postメソッドでラズパイのオーナー登録をする場合
  //*--------------------------------------------
  // 登録済み    => resHttpStatus 200(HttpStatus.OK)
  // 登録に成功  => resHttpStatus 201(HttpStatus.CREATED)
  // 登録に失敗  => resHttpStatus 500(HttpStatus.INTERNAL_SERVER_ERROR)
  // Token/x509証明書エラー => resHttpStatus 401(HttpStatus.UNAUTHORIZED)
  async create(RasppiDto: RasppiDto) {
    // resArray
    const resArray: {
      httpStatus: number; // return用Httpステータスコード
      jsonArray: { customToken: string; ownerUid: string }; // return用json;
    } = {
      httpStatus: undefined,
      jsonArray: { customToken: null, ownerUid: null },
    };

    // uidチェックの結果
    const uid: string = await auth
      .verifyIdToken(RasppiDto.Token)
      .then((decodedToken) => {
        return decodedToken.uid;
      })
      .catch((err) => {
        console.log('Error: auth.verifyIdToken(RasppiDto.Token)');
        console.log(err);
        resArray.httpStatus = HttpStatus.UNAUTHORIZED;
        return undefined;
      });

    // x509のチェック
    const RaspPiSerialNumber: string = await refRealtimeDbRasppi
      .child(RasppiDto.x509)
      .child('Owner')
      .get()
      .then((snapshot) => {
        const Owner = snapshot.val();
        console.log(
          `RaspPiSerialNumber: ${RasppiDto.x509}`,
          `\nsnapshot.exists():${snapshot.exists()}`,
          `\nOwner: ${Owner}`,
        );
        // uidが正規の値・シリアルナンバーが正規の値・Ownerが未登録 の場合はステータスコードに201を代入
        if (uid != undefined && snapshot.exists() && Owner == '') {
          resArray.httpStatus = HttpStatus.CREATED;
        }
        // uidが正規の値・シリアルナンバーが正規の値・Ownerが登録済み の場合はステータスコードに200を代入
        else if (uid != undefined && snapshot.exists() && Owner != '') {
          resArray.httpStatus = HttpStatus.OK;
        }
        // それ以外の場合はステータスコードに401を代入
        else {
          resArray.httpStatus = HttpStatus.UNAUTHORIZED;
        }
        return RasppiDto.x509;
      })
      .catch((err) => {
        console.log(
          "Error: refRealtimeDbRasppi.child(RasppiDto.x509).child('Owner').get()",
        );
        console.log(err);
        resArray.httpStatus = HttpStatus.UNAUTHORIZED;
        return undefined;
      });

    //* uid/RaspPiSerialNumberが登録された正規の値 && Owner == '' だった場合
    if (
      uid != undefined &&
      RaspPiSerialNumber != undefined &&
      resArray.httpStatus == HttpStatus.CREATED
    ) {
      Promise.all([
        // RealtimeDatabaseの "RaspPi/ナンバー/Owner" にuidを登録
        refRealtimeDbRasppi
          .child(RaspPiSerialNumber)
          .child('Owner')
          .set(uid)
          .catch((err) => {
            console.log(
              "Error: refRealtimeDbRasppi.child(RaspPiSerialNumber).child('Owner').set(uid)",
            );
            console.log(err);
            resArray.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          }),
        // Firestoreの "RaspPi/シリアルナンバー/Owner" にuidを追加・"PlaceName" をシリアルナンバーで初期化
        refFirestoreDbRasppi
          .doc(RaspPiSerialNumber)
          .update({
            Owner: uid,
            PlaceName: RaspPiSerialNumber,
          })
          .catch((err) => {
            console.log(
              'Error: refFirestoreDbRasppi.doc(RaspPiSerialNumber).update({Owner: uid,PlaceName: RaspPiSerialNumber,})',
            );
            console.log(err);
            resArray.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          }),
        // Firestoreの  "User/uid/RaspPiSerialNumber" にシリアルナンバーを追加
        refFirestoreDbUser
          .doc(uid)
          .update({
            RaspPiSerialNumber: FieldValue.arrayUnion(RaspPiSerialNumber),
          })
          .catch((err) => {
            console.log(
              'Error: refFirestoreDbUser.doc(uid).update({RaspPiSerialNumber: FieldValue.arrayUnion(RaspPiSerialNumber),})',
            );
            console.log(err);
            resArray.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          }),
      ]);
    }

    //* 正常に登録された場合
    if (uid != undefined && resArray.httpStatus == HttpStatus.CREATED) {
      // カスタムトークンを生成してresArray.jsonに格納
      await auth
        .createCustomToken(uid)
        .then((customToken) => {
          resArray.jsonArray = { customToken: customToken, ownerUid: uid };
        })
        .catch((err) => {
          console.log('Error: auth.createCustomToken(uid)');
          console.log(err);
          // カスタムトークンを正常に生成できなかった場合はステータスコードに500を代入
          resArray.jsonArray = { customToken: null, ownerUid: null };
          resArray.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        });
    }

    //* 最終確認として、resHttpStatusが500(エラーが出ていた)場合
    if (resArray.httpStatus == HttpStatus.INTERNAL_SERVER_ERROR) {
      // 全て初期化
      Promise.all([
        // RealtimeDatabaseのRaspPi/ナンバー/Ownerを空にセット
        refRealtimeDbRasppi
          .child(RaspPiSerialNumber)
          .child('Owner')
          .set('')
          .catch((err) => {
            console.log(
              "Error: refRealtimeDbRasppi.child(RaspPiSerialNumber).child('Owner').set('')",
            );
            console.log(err);
          }),
        // Firestoreの'RaspPi/シリアルナンバー/Owner','PlaceName'を空にセット
        refFirestoreDbRasppi
          .doc(RaspPiSerialNumber)
          .update({
            Owner: '',
            PlaceName: '',
          })
          .catch((err) => {
            console.log(
              "Error: refFirestoreDbRasppi.doc(RaspPiSerialNumber).update({Owner: '',PlaceName: '',})",
            );
            console.log(err);
          }),
        // Firestoreの'User/uid/RaspPiSerialNumber'を空にセット
        refFirestoreDbUser
          .doc(uid)
          .update({
            RaspPiSerialNumber: FieldValue.arrayRemove(RaspPiSerialNumber),
          })
          .catch((err) => {
            console.log(
              'Error: refFirestoreDbUser.doc(uid).update({RaspPiSerialNumber: FieldValue.arrayRemove(RaspPiSerialNumber),})',
            );
            console.log(err);
          }),
      ]);
    }

    console.log(
      `resArray.httpStatus: ${resArray.httpStatus}`,
      `\nresArray.jsonArray: ${JSON.stringify(resArray.jsonArray)}\n`,
    );
    return resArray;
  }

  //*--------------------------------------------
  //* DELETEメソッドでラズパイのオーナー登録解除をする場合
  //*--------------------------------------------
  // 解除済み    => resHttpStatus 200(HttpStatus.OK)
  // 解除に成功  => resHttpStatus 204(HttpStatus.NO_CONTENT)
  // 解除に失敗  => resHttpStatus 500(HttpStatus.INTERNAL_SERVER_ERROR)
  // Token/x509証明書エラー => resHttpStatus 401(HttpStatus.UNAUTHORIZED)
  async remove(RasppiDto: RasppiDto) {
    // resArray
    let resHttpStatus: number = undefined; // return用Httpステータスコード

    // uidチェックの結果
    const uid: string = await auth
      .verifyIdToken(RasppiDto.Token)
      .then((decodedToken) => {
        return decodedToken.uid;
      })
      .catch((err) => {
        console.log('Error: auth.verifyIdToken(RasppiDto.Token)');
        console.log(err);
        resHttpStatus = HttpStatus.UNAUTHORIZED;
        return undefined;
      });

    // x509のチェック
    const RaspPiSerialNumber: string = await refRealtimeDbRasppi
      .child(RasppiDto.x509)
      .child('Owner')
      .get()
      .then((snapshot) => {
        const Owner = snapshot.val();
        console.log(
          `RaspPiSerialNumber: ${RasppiDto.x509}`,
          `\nsnapshot.exists():${snapshot.exists()}`,
          `\nOwner: ${Owner}`,
        );
        // uidが正規の値・シリアルナンバーが正規の値・Ownerが削除済み の場合はステータスコードに200を代入
        if (uid != undefined && snapshot.exists() && Owner == '') {
          resHttpStatus = HttpStatus.OK;
        }
        // uidが正規の値・シリアルナンバーが正規の値・Ownerがuidと同値 の場合はステータスコードに204を代入
        else if (uid != undefined && snapshot.exists() && Owner == uid) {
          resHttpStatus = HttpStatus.NO_CONTENT;
        }
        // それ以外の場合はステータスコードに401を代入
        else {
          resHttpStatus = HttpStatus.UNAUTHORIZED;
        }
        return RasppiDto.x509;
      })
      .catch((err) => {
        console.log(
          "Error: refRealtimeDbRasppi.child(RasppiDto.x509).child('Owner').get()",
        );
        console.log(err);
        resHttpStatus = HttpStatus.UNAUTHORIZED;
        return undefined;
      });

    //* uid/RaspPiSerialNumberが登録された正規の値 && Owner == uid だった場合
    if (
      uid != undefined &&
      RaspPiSerialNumber != undefined &&
      resHttpStatus == HttpStatus.NO_CONTENT
    ) {
      Promise.all([
        // RealtimeDatabaseの "RaspPi/ナンバー/Owner" を''で初期化
        refRealtimeDbRasppi
          .child(RaspPiSerialNumber)
          .child('Owner')
          .set('')
          .catch((err) => {
            console.log(
              "Error: refRealtimeDbRasppi.child(RaspPiSerialNumber).child('Owner').set('')",
            );
            console.log(err);
            resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          }),
        // Firestoreの "RaspPi/シリアルナンバー/Owner" を''で初期化・"RaspPi/シリアルナンバー/PlaceName" をシリアルナンバーで初期化
        refFirestoreDbRasppi
          .doc(RaspPiSerialNumber)
          .update({
            Owner: '',
            PlaceName: RaspPiSerialNumber,
          })
          .catch((err) => {
            console.log(
              "Error: refFirestoreDbRasppi.doc(RaspPiSerialNumber).update({Owner: '',PlaceName: RaspPiSerialNumber,})",
            );
            console.log(err);
            resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          }),
        // Firestoreの "User/uid/RaspPiSerialNumber" からシリアルナンバーを削除
        refFirestoreDbUser
          .doc(uid)
          .update({
            RaspPiSerialNumber: FieldValue.arrayRemove(RaspPiSerialNumber),
          })
          .catch((err) => {
            console.log(
              'Error: refFirestoreDbUser.doc(uid).update({RaspPiSerialNumber: FieldValue.arrayUnion(RaspPiSerialNumber),})',
            );
            console.log(err);
            resHttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          }),
      ]);
    }

    console.log(`resHttpStatus: ${resHttpStatus}\n`);
    return resHttpStatus;
  }
}
