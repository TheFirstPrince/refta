import { SlotStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateSlotDto {
  @IsString()
  tenderId!: string;

  @IsString()
  assigneeId!: string;

  @IsDateString()
  date!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @IsInt()
  @Min(5)
  @Max(480)
  durationMin!: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;
}

export class UpdateSlotDto {
  @IsOptional()
  @IsString()
  tenderId?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(480)
  durationMin?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;
}

export class CheckConflictDto {
  @IsString()
  assigneeId!: string;

  @IsDateString()
  date!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @IsInt()
  @Min(5)
  @Max(480)
  durationMin!: number;

  @IsOptional()
  @IsString()
  excludeSlotId?: string;
}
