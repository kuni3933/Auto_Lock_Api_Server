import { Controller, Body, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { TokenService } from './token.service';
import { TokenDto } from './dto/token.dto';

@Controller('v1/token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  // ラズパイ登録
  @Post()
  create(@Body() TokenDto: TokenDto, @Res() res: Response) {
    console.log('----- ~/v1/rasppi:[POST] -----');
    this.tokenService.create(TokenDto).then((resArray) => {
      res.status(resArray.httpStatus).json(resArray.jsonArray).send();
    });
  }
}
