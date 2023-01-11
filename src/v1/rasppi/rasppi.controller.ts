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
    console.log('----- ~/v1/rasppi:[POST] -----');
    this.rasppiService.create(RasppiDto).then((resArray) => {
      res.status(resArray.httpStatus).json(resArray.jsonArray).send();
    });
  }

  // ラズパイ解除
  @Delete()
  remove(@Body() RasppiDto: RasppiDto, @Res() res: Response) {
    console.log('----- ~/v1/rasppi:[DELETE] -----');
    this.rasppiService.remove(RasppiDto).then((resHttpStatus) => {
      res.status(resHttpStatus).send();
    });
  }
}
