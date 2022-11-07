import { Controller, Post, Body, Delete } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountDto } from './dto/account.dto';

@Controller('v1/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() AccountDto: AccountDto) {
    return this.accountService.create(AccountDto);
  }

  @Delete()
  remove(@Body() AccountDto: AccountDto) {
    return this.accountService.remove(AccountDto);
  }
}
