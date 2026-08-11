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

import axios from 'axios';

import { API_URL } from '@/lib/constants';

let csrfToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

/**
 * Fetch CSRF token from API
 * Uses caching to avoid multiple simultaneous requests
 */
export async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfToken) {
    return csrfToken;
  }

  // If already fetching, return the existing promise
  if (tokenPromise) {
    return tokenPromise;
  }

  // Fetch new token
  tokenPromise = axios
    .get<{ csrfToken: string }>(`${API_URL}/csrf-token`, {
      withCredentials: true, // Include cookies for session
    })
    .then((response) => {
      csrfToken = response.data.csrfToken;
      return csrfToken;
    })
    .catch(() => {
      throw new Error('Failed to fetch CSRF token');
    })
    .finally(() => {
      tokenPromise = null;
    });

  return tokenPromise;
}

/**
 * Clear cached CSRF token
 * Useful when session changes or token expires
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  tokenPromise = null;
}

/**
 * Get current CSRF token (synchronous)
 * Returns null if token hasn't been fetched yet
 */
export function getCurrentCsrfToken(): string | null {
  return csrfToken;
}
