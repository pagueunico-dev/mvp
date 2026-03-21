import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ConsolidatePaymentsDto } from './dto/consolidate.dto';
import { MockMultiDto } from './dto/mock-multi.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /** Resposta JSON fixa para testes (regras/mocks). */
  @Get('mock')
  mock() {
    return this.payments.mockResponse();
  }

  @Get()
  list(@Query('userId', ParseUUIDPipe) userId: string) {
    return this.payments.findByUser(userId);
  }

  @Post('consolidate')
  consolidate(@Body() dto: ConsolidatePaymentsDto) {
    return this.payments.consolidate(dto);
  }

  /** Gera N pagamentos mock (opcional: painel / URL separada). */
  @Post('mock-multi')
  mockMulti(@Body() dto: MockMultiDto) {
    return this.payments.createMockMulti(dto);
  }

  @Post(':id/simulate-pay')
  simulatePay(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.payments.simulatePay(id, userId);
  }
}
