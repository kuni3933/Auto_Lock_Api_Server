import { PartialType } from '@nestjs/mapped-types';
import { CreateV1Dto } from './create-v1.dto';

export class UpdateV1Dto extends PartialType(CreateV1Dto) {}
