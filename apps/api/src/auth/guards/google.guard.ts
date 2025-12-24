import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google-auth') {
  async canActivate(context: ExecutionContext) {
    const isAllowed = (await super.canActivate(context)) as boolean;
    if (isAllowed) {
      const request = context.switchToHttp().getRequest();
      await super.logIn(request);
    }
    return isAllowed;
  }
}
