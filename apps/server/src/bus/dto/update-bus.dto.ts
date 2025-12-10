import { PartialType } from '@nestjs/mapped-types';
import { CreateBusDto } from './create-bus.dto';
import { IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';
import { BusStatus } from '@prisma/client';

export class UpdateBusDto extends PartialType(CreateBusDto) {
  @IsOptional()
  @IsString()
  currentStop?: string;

  @IsOptional()
  @IsString()
  nextDestination?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(BusStatus)
  status?: BusStatus;

  @IsOptional()
  driverId?: number | null; // nullable for updates
}
