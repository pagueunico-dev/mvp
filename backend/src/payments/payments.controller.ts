import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { ConsolidatePaymentsDto } from './dto/consolidate.dto';
import { MockMultiDto } from './dto/mock-multi.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Public()
  @Get('mock')
  mock() {
    return this.payments.mockResponse();
  }

  @Get()
  list(@Request() req: { user: User }) {
    return this.payments.findByUser(req.user.id);
  }

  @Post('consolidate')
  consolidate(
    @Request() req: { user: User },
    @Body() dto: ConsolidatePaymentsDto,
  ) {
    return this.payments.consolidate(dto, req.user.id);
  }

  @Post('mock-multi')
  mockMulti(@Request() req: { user: User }, @Body() dto: MockMultiDto) {
    return this.payments.createMockMulti(dto, req.user.id);
  }

  @Post(':id/simulate-pay')
  simulatePay(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: User },
  ) {
    return this.payments.simulatePay(id, req.user.id);
  }
}
