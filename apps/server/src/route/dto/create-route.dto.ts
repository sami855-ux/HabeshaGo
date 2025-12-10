import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateRouteDto {
  @IsString()
  name!: string;

  @IsString()
  origin!: string;

  @IsString()
  destination!: string;

  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @IsOptional()
  @IsNumber()
  estimatedTimeMin?: number;

  @IsOptional()
  @IsArray()
  midPoints?: object[]; // array of { name, lat, lng }

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
