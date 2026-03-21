import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ name: 'login_username', unique: true, nullable: true })
  loginUsername: string | null;

  @Column({ name: 'password_hash', nullable: true, select: false })
  passwordHash: string | null;

  @Column({ default: 'admin' })
  role: string;
}
