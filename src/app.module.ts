import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { RasppiModule } from './rasppi/rasppi.module';

@Module({
  imports: [AccountModule, RasppiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
