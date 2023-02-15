import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { Controller, Request, Post, UseGuards } from '@nestjs/common';

@Controller()
export class LocalAuthController {
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }
}
