import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  list(@Query('userId', ParseUUIDPipe) userId: string) {
    return this.accounts.findByUser(userId);
  }

  @Post()
  create(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accounts.create(userId, dto);
  }

  @Get(':id')
  one(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.accounts.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accounts.update(id, userId, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseUUIDPipe) userId: string,
  ) {
    await this.accounts.remove(id, userId);
    return { ok: true };
  }
}
