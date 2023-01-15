import { Module } from '@nestjs/common';
import { V1Service } from './v1.service';
import { V1Controller } from './v1.controller';
import { RasppiModule } from './rasppi/rasppi.module';
import { AccountModule } from './account/account.module';
import { TokenModule } from './token/token.module';

@Module({
  controllers: [V1Controller],
  providers: [V1Service],
  imports: [RasppiModule, AccountModule, TokenModule],
})
export class V1Module {}
