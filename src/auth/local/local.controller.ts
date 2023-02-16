import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { User as UserModel } from '@/modules/user/entities/user.entity';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalAuthService } from './local.service';

@ApiTags('Auth')
@Controller()
export class LocalAuthController {
  constructor(private readonly _authService: LocalAuthService) {}

  @ApiOperation({ summary: '本地登录' })
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Body() user: UserModel) {
    return this._authService.login(user);
  }
}
