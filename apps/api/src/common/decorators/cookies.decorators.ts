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

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type CookieMap = Record<string, string | undefined>;

/**
 * Retrieve cookies from the incoming request.
 * - `@Cookies()` returns the whole cookie map.
 * - `@Cookies('name')` returns the value of the named cookie.
 */
export const Cookies = createParamDecorator(
  (
    name: string | undefined,
    ctx: ExecutionContext
  ): string | CookieMap | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const cookies = (request.cookies || {}) as CookieMap;
    if (!name) return cookies;
    return cookies?.[name];
  }
);
