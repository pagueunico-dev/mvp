import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('me')
  me(@Request() req: { user: User }) {
    const u = req.user;
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  }
}
