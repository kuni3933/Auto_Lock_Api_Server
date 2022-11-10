import { Injectable } from '@nestjs/common';
import { AccountDto } from './dto/account.dto';
import { auth, db, fs } from '../../FirebaseInit';

@Injectable()
export class AccountService {
  // 受け取ったidTokenのチェック
  verifyToken(idToken: string): any {
    //res用type
    auth
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        console.log('verifyIdToken: ' + decodedToken.uid);
        const Account: Account = {
          isUser: true,
          uid: decodedToken.uid,
        };
        return Account;
      })
      .catch((error) => {
        console.log(error);
        const Account: Account = {
          isUser: false,
        };
        return Account;
      });
  }

  // PostメソッドでUserDBの作成を受付場合
  create(AccountDto: AccountDto) {
    const Account: Account = this.verifyToken(AccountDto.Token);
    let res: string = null;

    if (Account.is_user == true) {
      res = 'uid: ' + Account.uid;
    } else {
      res = 'uid: ' + Account.is_user;
    }
    console.log(res);
    return res;
  }

  remove(AccountDto: AccountDto) {
    const uid = this.verifyToken(AccountDto.Token);
    return 'uid: ' + uid;
  }
}
