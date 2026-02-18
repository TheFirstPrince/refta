import { IsOptional, IsString } from 'class-validator';

export class CreateTenderDto {
  @IsString()
  tenderNo!: string;

  @IsString()
  companyId!: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateTenderDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
