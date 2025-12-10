import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  userId!: string; // Must exist in User table

  @IsString()
  licenseNo!: string;

  @IsInt()
  @IsOptional()
  experience?: number;
}
