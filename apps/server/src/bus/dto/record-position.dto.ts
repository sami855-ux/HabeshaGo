import { IsNumber, IsOptional } from 'class-validator';

export class RecordPositionDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  timestamp?: string; // ISO
}
