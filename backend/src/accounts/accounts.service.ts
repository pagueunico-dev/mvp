import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,
  ) {}

  countByUser(userId: string): Promise<number> {
    return this.repo.count({ where: { user: { id: userId } } });
  }

  async create(userId: string, dto: CreateAccountDto): Promise<Account> {
    const row = this.repo.create({
      title: dto.title,
      amount: dto.amount.toFixed(2),
      dueDate: dto.dueDate,
      user: { id: userId },
    });
    return this.repo.save(row);
  }

  findByUser(userId: string): Promise<Account[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { dueDate: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Account> {
    const a = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!a) throw new NotFoundException('Conta não encontrada');
    return a;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateAccountDto,
  ): Promise<Account> {
    const a = await this.findOne(id, userId);
    if (dto.title !== undefined) a.title = dto.title;
    if (dto.amount !== undefined) a.amount = dto.amount.toFixed(2);
    if (dto.dueDate !== undefined) a.dueDate = dto.dueDate;
    return this.repo.save(a);
  }

  async remove(id: string, userId: string): Promise<void> {
    const a = await this.findOne(id, userId);
    await this.repo.remove(a);
  }

  async findManyByIds(ids: string[], userId: string): Promise<Account[]> {
    if (ids.length === 0) return [];
    return this.repo.find({
      where: { id: In(ids), user: { id: userId } },
    });
  }
}
