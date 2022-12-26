import { Controller, Body, Post, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { RasppiService } from './rasppi.service';
import { RasppiDto } from './dto/rasppi.dto';

@Controller('v1/rasppi')
export class RasppiController {
  constructor(private readonly rasppiService: RasppiService) {}

  // ラズパイ登録
  @Post()
  create(@Body() RasppiDto: RasppiDto, @Res() res: Response) {
    this.rasppiService.create(RasppiDto).then((resHttpStatus) => {
      res.status(resHttpStatus).send();
    });
  }

  // ラズパイ解除
  @Delete()
  remove(@Body() RasppiDto: RasppiDto, @Res() res: Response) {
    this.rasppiService.remove(RasppiDto).then((resHttpStatus) => {
      res.status(resHttpStatus).send();
    });
  }
}
