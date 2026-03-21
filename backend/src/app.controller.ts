import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  root() {
    return {
      service: 'mvp-api',
      health: 'ok',
      hint: 'Documentacao: use GET /health e a UI em http://localhost:5173',
    };
  }

  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
