import { IsEnum } from 'class-validator';
import { BusStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(BusStatus)
  status!: BusStatus; // required
}
