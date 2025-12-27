import type { Session, SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    oauthRedirectUrl?: string;
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    sessionID: string;
    session: Session & Partial<SessionData>;
    user?: AuthenticatedUser;
  }
}
