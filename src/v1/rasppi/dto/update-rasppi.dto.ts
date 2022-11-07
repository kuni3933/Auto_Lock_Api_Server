import { PartialType } from '@nestjs/mapped-types';
import { CreateRasppiDto } from './create-rasppi.dto';

export class UpdateRasppiDto extends PartialType(CreateRasppiDto) {}
