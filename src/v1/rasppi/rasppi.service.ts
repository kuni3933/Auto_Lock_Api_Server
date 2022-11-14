import { Injectable } from '@nestjs/common';
import { AccountDto } from './dto/account.dto';
import { RasppiDto } from './dto/rasppi.dto';

@Injectable()
export class RasppiService {
  create(AccountDto: AccountDto, RasppiDto: RasppiDto) {
    return 'This action adds a new rasppi';
  }
  remove(AccountDto: AccountDto, RasppiDto: RasppiDto) {
    return 'This action adds a new rasppi';
  }
}
