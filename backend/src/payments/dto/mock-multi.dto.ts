import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class MockMultiDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  count?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(['paid', 'pending'], { each: true })
  statuses?: ('paid' | 'pending')[];
}
