import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateBusDto {
  @IsString()
  busNumber!: string; // required

  @IsInt()
  @Min(1)
  capacity!: number; // required

  @IsOptional()
  @IsInt()
  routeId?: number;

  @IsOptional()
  @IsInt()
  driverId?: number | null; // nullable
}
