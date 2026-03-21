import { Injectable, OnModuleInit } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly users: UsersService,
    private readonly accounts: AccountsService,
  ) {}

  async onModuleInit(): Promise<void> {
    const user = await this.users.ensureDemoUser();
    const existing = await this.accounts.countByUser(user.id);
    if (existing > 0) return;
    await this.accounts.create(user.id, {
      title: 'Conta de luz',
      amount: 189.9,
      dueDate: '2025-04-10',
    });
    await this.accounts.create(user.id, {
      title: 'Internet',
      amount: 99.9,
      dueDate: '2025-04-12',
    });
    await this.accounts.create(user.id, {
      title: 'Água',
      amount: 72.5,
      dueDate: '2025-04-15',
    });
  }
}
