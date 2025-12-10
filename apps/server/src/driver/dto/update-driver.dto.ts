import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  licenseNo?: string;

  @IsInt()
  @IsOptional()
  experience?: number;
}
