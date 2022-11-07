import { Injectable } from '@nestjs/common';
import { CreateRasppiDto } from './dto/create-rasppi.dto';
import { UpdateRasppiDto } from './dto/update-rasppi.dto';

@Injectable()
export class RasppiService {
  create(createRasppiDto: CreateRasppiDto) {
    return 'This action adds a new rasppi';
  }

  findAll() {
    return `This action returns all rasppi`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rasppi`;
  }

  update(id: number, updateRasppiDto: UpdateRasppiDto) {
    return `This action updates a #${id} rasppi`;
  }

  remove(id: number) {
    return `This action removes a #${id} rasppi`;
  }
}
