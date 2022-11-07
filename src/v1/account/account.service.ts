import { Injectable } from '@nestjs/common';
import { AccountDto } from './dto/account.dto';
import { auth, db, fs } from '../../FirebaseInit';

@Injectable()
export class AccountService {
  verifyToken(idToken: string): any {
    let uid;
    auth
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        uid = decodedToken.uid;
        console.log(uid);
      })
      .catch((error) => {
        console.log(error);
        uid = 'false';
      });
    return uid;
  }
  create(AccountDto: AccountDto) {
    const uid = this.verifyToken(AccountDto.idToken);
    const res = 'uid: ' + uid;
    return res;
  }
  remove(AccountDto: AccountDto) {
    const uid = this.verifyToken(AccountDto.idToken);
    return 'uid: ' + uid;
  }
}
