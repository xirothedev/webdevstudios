/**
 * Example deep module.
 *
 * Copy this package to create a new one. The public surface is the root
 * files (index.ts); implementation lives in lib/, tests in tests/.
 */
export function greet(name: string): string {
  return format(name);
}

import { format } from './lib/impl';
