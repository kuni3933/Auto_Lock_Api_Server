import { Injectable, HttpStatus } from '@nestjs/common';
import { RasppiDto } from './dto/rasppi.dto';
import { auth, db, fs, FieldValue } from '../../FirebaseInit';

@Injectable()
export class RasppiService {
  //* メンバ
  // RealtimeDatabaseRef
  refRealtimeDb = db.ref('RaspPi');
  // FirestoreRef
  refFirestoreDbRasppi = fs.collection('RaspPi');
  // FirestoreRefUser
  refFirestoreDbUser = fs.collection('User');

  //*--------------------------------------------
  //* Postメソッドでラズパイの登録をする場合
  //*--------------------------------------------
  // 登録済み    => resHttpStatus 200(HttpStatus.OK)
  // 登録に成功  => resHttpStatus 201(HttpStatus.Created)
  // 登録に失敗  => resHttpStatus 500(HttpStatus.INTERNAL_SERVER_ERROR)
  // Token/x509証明書エラー => resHttpStatus 401(HttpStatus.UNAUTHORIZED)
  async create(RasppiDto: RasppiDto) {
    // resArray
    const resArray = {
      resHttpStatus: (Number = undefined), // return用Httpステータスコード
      customIdToken: (String = undefined), // return用customIdToken;
    };

    // uidチェックの結果
    const uid: string = await auth
      .verifyIdToken(RasppiDto.Token)
      .then((decodedToken) => {
        return decodedToken.uid;
      })
      .catch((error) => {
        console.log('---------- Error ----------\nverifyIdToken:');
        console.log(error);
        return undefined;
      });

    // x509のチェック
    const RaspPiSerialNumber: string = await this.refRealtimeDb
      .child(RasppiDto.x509)
      .child('Owner')
      .get()
      .then((snapshot) => {
        const Owner = snapshot.val();
        console.log(`Owner: ${Owner}`);
        return { RaspPiSerialNumber: RasppiDto.x509, Owner: Owner };
      })
      .catch((error) => {
        console.log(`---------- Error ----------\n${error}`);
        return undefined;
      });

    //* uid/RaspPiSerialNumberが登録された正規の値 && Owner == "" だった場合
    if (
      uid != undefined &&
      RaspPiSerialNumber != undefined &&
      RaspPiSerialNumber['Owner'] == ''
    ) {
      resArray['resHttpStatus'] = HttpStatus.CREATED;

      Promise.all([
        // RealtimeDatabaseのRaspPi/ナンバー/Ownerにuidを登録
        this.refRealtimeDb
          .child(RaspPiSerialNumber)
          .child('Owner')
          .set(uid)
          .catch((error) => {
            console.log(`---------- Error ----------\n${error}`);
            resArray['resHttpStatus'] = HttpStatus.INTERNAL_SERVER_ERROR;
          }),
        // Firestoreの'RaspPi/シリアルナンバー/Owner'にuidを追加して'PlaceName'をシリアルナンバーで初期化
        this.refFirestoreDbRasppi
          .doc(RaspPiSerialNumber)
          .update({
            Owner: uid,
            PlaceName: RaspPiSerialNumber,
          })
          .catch((error) => {
            console.log(`---------- Error ----------\n${error}`);
            resArray['resHttpStatus'] = HttpStatus.INTERNAL_SERVER_ERROR;
          }),
        // Firestoreの'User/uid/RaspPiSerialNumber'にシリアルナンバーを追加
        this.refFirestoreDbUser
          .doc(uid)
          .update({
            RaspPiSerialNumber: FieldValue.arrayUnion(RaspPiSerialNumber),
          })
          .catch((error) => {
            console.log(`---------- Error ----------\n${error}`);
            resArray['resHttpStatus'] = HttpStatus.INTERNAL_SERVER_ERROR;
          }),
      ]);
    }

    //* uid/RaspPiSerialNumberが登録された正規の値 && Owner != "" だった場合
    if (
      uid != undefined &&
      RaspPiSerialNumber != undefined &&
      RaspPiSerialNumber['Owner'] != ''
    ) {
      resArray['resHttpStatus'] = HttpStatus.OK;
    }

    //* uid/RaspPiSerialNumberが登録されていない値 だった場合
    if (uid == undefined || RaspPiSerialNumber == undefined) {
      resArray['resHttpStatus'] = HttpStatus.UNAUTHORIZED;
    }

    //* 最終確認として、resHttpStatusが500(エラーが出ていた)場合
    if (resArray['resHttpStatus'] == HttpStatus.INTERNAL_SERVER_ERROR) {
      // 全て初期化
      Promise.all([
        // RealtimeDatabaseのRaspPi/ナンバー/Ownerを空にセット
        this.refRealtimeDb
          .child(RaspPiSerialNumber)
          .child('Owner')
          .set('')
          .catch((error) => {
            console.log(`---------- Error ----------\n${error}`);
          }),
        // Firestoreの'RaspPi/シリアルナンバー/Owner','PlaceName'を空にセット
        this.refFirestoreDbRasppi
          .doc(RaspPiSerialNumber)
          .update({
            Owner: '',
            PlaceName: '',
          })
          .catch((error) => {
            console.log(`---------- Error ----------\n${error}`);
          }),
        // Firestoreの'User/uid/RaspPiSerialNumber'を空にセット
        this.refFirestoreDbUser
          .doc(uid)
          .update({
            RaspPiSerialNumber: FieldValue.arrayRemove(RaspPiSerialNumber),
          })
          .catch((error) => {
            console.log(`---------- Error ----------\n${error}`);
          }),
      ]);
    }

    console.log(`resArray: ${resArray}\n`);
    return JSON.stringify(resArray);
  }

  //*--------------------------------------------
  //* DELETEメソッドでUserデータを削除する場合
  //*--------------------------------------------
  // 削除済み    => resHttpStatus 200
  // 削除に成功  => resHttpStatus 204
  // 削除に失敗  => resHttpStatus 500
  // Tokenエラー => resHttpStatus 401
  async remove(RasppiDto: RasppiDto) {}
}
