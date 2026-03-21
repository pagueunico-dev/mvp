import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class ConsolidatePaymentsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  accountIds: string[];
}
