import { User } from '@generated/prisma';

export type ExpressUser = User;

// ensure file is parsed as a module
export {};

// access the global scope inside our module
declare global {
  namespace Express {
    // introduce another declaration of interface Express.User which will merge with any others
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends ExpressUser {}
  }
}
