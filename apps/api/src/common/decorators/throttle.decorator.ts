/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

/**
 * Rate limit decorators for different route types
 *
 * Giải thích:
 * - Khi config short, medium, long trong AppModule, đó là các "throttler profiles" có sẵn
 * - Decorator @Throttle() cần chỉ định rõ dùng throttler nào
 * - Có 2 cách:
 *   1. Dùng trực tiếp throttler đã config: Throttle({ short: {} }) - dùng limit/ttl đã config
 *   2. Override limit/ttl: Throttle({ short: { limit: 5, ttl: 2000 } }) - override giá trị
 *
 * Custom decorators giúp:
 * - Dễ đọc, dễ maintain (tên rõ ràng hơn @Throttle({ short: {} }))
 * - Tập trung logic rate limiting ở một nơi
 * - Có thể override khi cần (như password reset cần limit khác)
 */

/**
 * Strict rate limit for sensitive auth operations (login, register)
 * Dùng 'short' throttler đã config: 3 requests per second
 * Không override, dùng trực tiếp config từ AppModule
 */
export const ThrottleStrict = () => applyDecorators(Throttle({ short: {} }));

/**
 * Rate limit for password reset requests
 * Override 'long' throttler: 3 requests per hour (thay vì 100/minute)
 * Cần override vì password reset cần strict hơn
 */
export const ThrottlePasswordReset = () =>
  applyDecorators(Throttle({ long: { limit: 3, ttl: 3600000 } })); // 3 per hour

/**
 * Rate limit for OAuth endpoints
 * Dùng 'medium' throttler đã config: 20 requests per 10 seconds
 */
export const ThrottleOAuth = () => applyDecorators(Throttle({ medium: {} }));

/**
 * Rate limit for refresh token endpoint
 * Dùng 'medium' throttler đã config: 20 requests per 10 seconds
 */
export const ThrottleRefresh = () => applyDecorators(Throttle({ medium: {} }));

/**
 * Rate limit for 2FA operations
 * Dùng 'medium' throttler đã config: 20 requests per 10 seconds
 */
export const Throttle2FA = () => applyDecorators(Throttle({ medium: {} }));

/**
 * Rate limit for API endpoints (moderate)
 * Dùng 'long' throttler đã config: 100 requests per minute
 */
export const ThrottleAPI = () => applyDecorators(Throttle({ long: {} }));

/**
 * Rate limit for payment endpoints (strict)
 * Dùng 'short' throttler đã config: 3 requests per second
 */
export const ThrottlePayment = () => applyDecorators(Throttle({ short: {} }));
