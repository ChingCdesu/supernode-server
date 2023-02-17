import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @ApiOperation({ summary: '健康检查' })
  @Get()
  public async check() {
    return {
      code: 200,
      message: '',
    };
  }
}
