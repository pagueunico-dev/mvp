import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.users.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async ensureDemoUser(): Promise<User> {
    let u = await this.users.findOne({ where: { email: 'demo@mvp.local' } });
    if (!u) {
      u = this.users.create({
        email: 'demo@mvp.local',
        name: 'Usuário demo',
      });
      await this.users.save(u);
    }
    return u;
  }
}
