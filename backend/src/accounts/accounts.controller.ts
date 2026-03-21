import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  list(@Request() req: { user: User }) {
    return this.accounts.findByUser(req.user.id);
  }

  @Post()
  create(@Request() req: { user: User }, @Body() dto: CreateAccountDto) {
    return this.accounts.create(req.user.id, dto);
  }

  @Get(':id')
  one(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: User },
  ) {
    return this.accounts.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: User },
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accounts.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: User },
  ) {
    await this.accounts.remove(id, req.user.id);
    return { ok: true };
  }
}
