import { Controller, Body, Headers, Post, Delete } from '@nestjs/common';
import { RasppiService } from './rasppi.service';
import { AccountDto } from './dto/account.dto';
import { RasppiDto } from './dto/rasppi.dto';

@Controller('v1/rasppi')
export class RasppiController {
  constructor(private readonly rasppiService: RasppiService) {}

  // ラズパイ登録
  @Post()
  create(@Headers() AccountDto: AccountDto, @Body() RasppiDto: RasppiDto) {
    return this.rasppiService.create(AccountDto, RasppiDto);
  }

  // ラズパイ解除
  @Delete()
  remove(@Headers() AccountDto: AccountDto, @Body() RasppiDto: RasppiDto) {
    return this.rasppiService.remove(AccountDto, RasppiDto);
  }
}
