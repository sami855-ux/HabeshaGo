import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';
import { BusStatus } from '@prisma/client';

export class CreateBusDto {
  @IsString({ message: 'Bus number must be a string' })
  busNumber!: string;

  @IsInt()
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity!: number;

  // Optional: override default status (default is ACTIVE)
  @IsOptional()
  @IsEnum(BusStatus, { message: 'Invalid bus status' })
  status?: BusStatus;

  // Optional relations
  @IsOptional()
  @IsInt()
  driverId!: number;

  @IsOptional()
  @IsInt()
  routeId!: number;

  @IsOptional()
  @IsString()
  currentStop?: string;

  @IsOptional()
  @IsString()
  nextDestination?: string;

  // Default is true → only allow explicit false
  @IsOptional()
  @IsBoolean()
  isActive!: boolean;
}
