import { IsInt, IsOptional } from 'class-validator';

export class AssignDriverDto {
  @IsOptional()
  @IsInt()
  driverId?: number | null; // null to unassign
}
