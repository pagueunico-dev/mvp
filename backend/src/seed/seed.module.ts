import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { SeedService } from './seed.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, AccountsModule],
  providers: [SeedService],
})
export class SeedModule {}
