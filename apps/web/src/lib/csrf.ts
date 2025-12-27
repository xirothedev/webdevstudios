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
    .get<{ csrfToken: string }>(`${API_URL}/v1/csrf-token`, {
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
