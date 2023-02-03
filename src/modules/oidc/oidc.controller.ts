import { Controller } from '@nestjs/common';
import { OidcService } from './oidc.service';

@Controller('oidc')
export class OidcController {
  constructor(private oidcService: OidcService) {}
}
