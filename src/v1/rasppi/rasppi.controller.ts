import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RasppiService } from './rasppi.service';
import { CreateRasppiDto } from './dto/create-rasppi.dto';
import { UpdateRasppiDto } from './dto/update-rasppi.dto';

@Controller('v1/rasppi')
export class RasppiController {
  constructor(private readonly rasppiService: RasppiService) {}

  @Post()
  create(@Body() createRasppiDto: CreateRasppiDto) {
    return this.rasppiService.create(createRasppiDto);
  }

  @Get()
  findAll() {
    return this.rasppiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rasppiService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRasppiDto: UpdateRasppiDto) {
    return this.rasppiService.update(+id, updateRasppiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rasppiService.remove(+id);
  }
}
