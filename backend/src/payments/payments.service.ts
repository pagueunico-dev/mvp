import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { ConsolidatePaymentsDto } from './dto/consolidate.dto';
import { MockMultiDto } from './dto/mock-multi.dto';
import { Payment } from './entities/payment.entity';

function fakeBoletoLine(total: string): string {
  return `34191.79001 01043.510047 91020.150008 ${total.replace('.', '')} 00000`;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
    private readonly accounts: AccountsService,
  ) {}

  mockResponse() {
    return {
      provider: 'mock',
      status: 'pending',
      message: 'Pagamento simulado — use POST /payments/consolidate para boleto único.',
    };
  }

  findByUser(userId: string): Promise<Payment[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
    });
  }

  async consolidate(dto: ConsolidatePaymentsDto): Promise<Payment> {
    const rows = await this.accounts.findManyByIds(dto.accountIds, dto.userId);
    if (rows.length !== dto.accountIds.length) {
      throw new BadRequestException('Uma ou mais contas não pertencem ao usuário');
    }
    const total = rows.reduce((s, a) => s + parseFloat(a.amount), 0);
    const payment = this.repo.create({
      user: { id: dto.userId },
      totalAmount: total.toFixed(2),
      status: 'pending',
      mockBoletoLine: fakeBoletoLine(total.toFixed(2)),
      accountIds: dto.accountIds,
    });
    return this.repo.save(payment);
  }

  async simulatePay(paymentId: string, userId: string): Promise<Payment> {
    const p = await this.repo.findOne({
      where: { id: paymentId, user: { id: userId } },
    });
    if (!p) throw new BadRequestException('Pagamento não encontrado');
    p.status = 'paid';
    return this.repo.save(p);
  }

  async createMockMulti(dto: MockMultiDto): Promise<Payment[]> {
    const count = dto.count ?? 2;
    const statuses =
      dto.statuses ?? Array.from({ length: count }, () => 'pending' as const);
    if (statuses.length !== count) {
      throw new BadRequestException('statuses deve ter o mesmo tamanho que count');
    }
    const userAccounts = await this.accounts.findByUser(dto.userId);
    if (userAccounts.length === 0) {
      throw new BadRequestException('Usuário sem contas para mock');
    }
    const out: Payment[] = [];
    for (let i = 0; i < count; i++) {
      const pick = userAccounts[i % userAccounts.length];
      const amt = (parseFloat(pick.amount) + i * 10).toFixed(2);
      const payment = this.repo.create({
        user: { id: dto.userId },
        totalAmount: amt,
        status: statuses[i] ?? 'pending',
        mockBoletoLine: fakeBoletoLine(amt),
        accountIds: [pick.id],
      });
      out.push(await this.repo.save(payment));
    }
    return out;
  }
}
