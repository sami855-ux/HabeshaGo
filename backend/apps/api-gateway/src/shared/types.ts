export interface AuthUser {
  id: string;
  roles: string[];
  sessionId?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
    id: string;
  }
}
