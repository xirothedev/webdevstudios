import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { CsrfService } from './common/services/csrf.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly csrfService: CsrfService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('csrf-token')
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const token = this.csrfService.generateToken(req, res);
    return res.json({ csrfToken: token });
  }
}
