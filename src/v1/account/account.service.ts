import { Injectable } from '@nestjs/common';
import { AccountDto } from './dto/account.dto';
import { auth, db, fs, verifyIdToken } from '../../FirebaseInit';

@Injectable()
export class AccountService {
  // PostメソッドでUserDBの作成を受付場合
  create(AccountDto: AccountDto) {
    verifyIdToken(AccountDto.Token).then((uidObj) => {
      console.log(uidObj);
    });
    /*
    const ref = db.ref('/User/' + uidObj.uid);
    ref
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
//*/
  }

  remove(AccountDto: AccountDto) {
    const uid = verifyIdToken(AccountDto.Token);
    return 'uid: ' + uid;
  }
}
