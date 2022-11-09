import { Injectable } from '@nestjs/common';
import { AccountDto } from './dto/account.dto';
import { Account } from './entities/account.entity';
import { auth, db, fs } from '../../FirebaseInit';

@Injectable()
export class AccountService {
  // 受け取ったidTokenのチェック
  verifyToken(idToken: string): Account {
    let Account: Account;
    auth
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        console.log('verifyIdToken: ' + decodedToken.uid);
        Account.is_user = true;
        Account.uid = decodedToken.uid;
      })
      .catch((error) => {
        console.log(error);
        Account.is_user = false;
      });
    return Account;
  }

  // PostメソッドでUserDBの作成を受付場合
  create(AccountDto: AccountDto) {
    const Account: Account = this.verifyToken(AccountDto.idToken);
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
    const uid = this.verifyToken(AccountDto.idToken);
    return 'uid: ' + uid;
  }
}
