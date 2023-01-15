import { Injectable, HttpStatus } from '@nestjs/common';
import { TokenDto } from './dto/token.dto';
import { auth } from '../../FirebaseInit';

@Injectable()
export class TokenService {
  //*--------------------------------------------
  //* Postメソッドでカスタムトークンの生成をする場合
  //*--------------------------------------------
  // 成功    => resHttpStatus 200(HttpStatus.OK)
  // 失敗  => resHttpStatus 500(HttpStatus.INTERNAL_SERVER_ERROR)
  // idToken/エラー => resHttpStatus 401(HttpStatus.UNAUTHORIZED)
  async create(TokenDto: TokenDto) {
    // resArray
    const resArray: {
      httpStatus: number; // return用Httpステータスコード
      jsonArray: { customToken: string }; // return用json;
    } = {
      httpStatus: undefined,
      jsonArray: { customToken: null },
    };

    // uidチェックの結果
    const uid: string = await auth
      .verifyIdToken(TokenDto.Token)
      .then((decodedToken) => {
        resArray.httpStatus = HttpStatus.OK;
        return decodedToken.uid;
      })
      .catch((err) => {
        console.log('Error: auth.verifyIdToken(TokenDto.Token)');
        console.log(err);
        resArray.httpStatus = HttpStatus.UNAUTHORIZED;
        return undefined;
      });

    //* 正常にidTokenのCheckがされた場合
    if (uid != undefined && resArray.httpStatus == HttpStatus.OK) {
      // カスタムトークンを生成してresArray.jsonに格納
      await auth
        .createCustomToken(uid)
        .then((customToken) => {
          resArray.jsonArray = { customToken: customToken };
        })
        .catch((err) => {
          console.log('Error: auth.createCustomToken(uid)');
          console.log(err);
          // カスタムトークンを正常に生成できなかった場合はステータスコードに500を代入
          resArray.jsonArray = { customToken: null };
          resArray.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        });
    }
    console.log(
      `resArray.httpStatus: ${resArray.httpStatus}`,
      `\nresArray.jsonArray: ${JSON.stringify(resArray.jsonArray)}\n`,
    );
    return resArray;
  }
}
