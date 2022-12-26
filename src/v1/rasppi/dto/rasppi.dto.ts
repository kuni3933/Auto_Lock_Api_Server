import { IsNotEmpty, IsString } from 'class-validator';

export class RasppiDto {
  @IsNotEmpty()
  @IsString()
  Token: string;

  @IsNotEmpty()
  @IsString()
  x509: string;
}
