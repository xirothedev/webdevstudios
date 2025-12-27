import type { Session, SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    oauthRedirectUrl?: string;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    sessionID: string;
    session: Session & Partial<SessionData>;
  }
}
