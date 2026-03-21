import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  findOne(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async findWithPasswordByLogin(username: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.loginUsername = :username', { username })
      .getOne();
  }

  async ensureAdminUser(): Promise<User> {
    let u = await this.users.findOne({ where: { loginUsername: 'admin' } });
    if (!u) {
      const passwordHash = await bcrypt.hash('admin', 10);
      u = this.users.create({
        email: 'admin@mvp.local',
        name: 'Administrador',
        loginUsername: 'admin',
        passwordHash,
        role: 'admin',
      });
      await this.users.save(u);
    }
    return u;
  }
}
