import { DeviceType } from '@generated/prisma';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';
// Assuming you have your DeviceType enum exported somewhere
// import { DeviceType } from './constants';

export const Device = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userAgentString = request.headers['user-agent'] || '';

    // 1. Get IP Address (handling proxies/load balancers)
    const ipAddress =
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.socket.remoteAddress ||
      '0.0.0.0';

    // 2. Parse User-Agent
    const parser = new UAParser(userAgentString);
    const uaResult = parser.getResult();

    // 3. Map parser types to your DeviceType enum
    let type: DeviceType = DeviceType.UNKNOWN; // Default
    if (uaResult.device.type === 'desktop') type = DeviceType.DESKTOP;
    if (uaResult.device.type === 'mobile') type = DeviceType.MOBILE;
    if (uaResult.device.type === 'tablet') type = DeviceType.TABLET;

    // 4. Construct Device Name (e.g., "Apple iPhone" or "Windows Chrome")
    const deviceName = uaResult.device.model
      ? `${uaResult.device.vendor || ''} ${uaResult.device.model}`.trim()
      : `${uaResult.os.name || 'Unknown OS'} ${uaResult.browser.name || 'Unknown Browser'}`;

    return {
      name: deviceName,
      type,
      userAgent: userAgentString,
      ipAddress,
      fingerprint: request.headers['x-device-fingerprint'] || null,
    };
  }
);
