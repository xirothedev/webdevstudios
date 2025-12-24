import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RealIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const ip =
      req.headers['cf-connecting-ip'] || // Cloudflare
      req.headers['x-forwarded-for']?.split(',')[0].trim() || // Multi-proxy list
      req.headers['x-real-ip'] || // Nginx fallback
      req.ip || // Express standard
      req.socket.remoteAddress; // Socket fallback

    // Clean up IPv6 loopback if testing locally
    return ip === '::1' ? '127.0.0.1' : ip;
  }
);
