import { Controller, Body, Post, Delete } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountDto } from './dto/account.dto';

@Controller('v1/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // 認証済みUserのDBを初期作成
  @Post()
  create(@Body() AccountDto: AccountDto) {
    return this.accountService.create(AccountDto);
  }

  // 認証済みUserのDBを削除
  @Delete()
  remove(@Body() AccountDto: AccountDto) {
    return this.accountService.remove(AccountDto);
  }
}
