import { Injectable } from '@nestjs/common';
import { CreateV1Dto } from './dto/create-v1.dto';
import { UpdateV1Dto } from './dto/update-v1.dto';

@Injectable()
export class V1Service {
  create(createV1Dto: CreateV1Dto) {
    return 'This action adds a new v1';
  }

  findAll() {
    return `This action returns all v1`;
  }

  findOne(id: number) {
    return `This action returns a #${id} v1`;
  }

  update(id: number, updateV1Dto: UpdateV1Dto) {
    return `This action updates a #${id} v1`;
  }

  remove(id: number) {
    return `This action removes a #${id} v1`;
  }
}
