import { Controller, Body, Post, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { AccountService } from './account.service';
import { AccountDto } from './dto/account.dto';

@Controller('v1/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // 認証済みUserのFirestoreDbを初期作成
  @Post()
  create(@Body() AccountDto: AccountDto, @Res() res: Response) {
    this.accountService.create(AccountDto).then((resHttpStatus) => {
      res.status(resHttpStatus).send();
    });
  }

  // 認証済みUserのFirestoreDbを削除
  @Delete()
  remove(@Body() AccountDto: AccountDto, @Res() res: Response) {
    this.accountService.remove(AccountDto).then((resHttpStatus) => {
      res.status(resHttpStatus).send();
    });
  }
}
