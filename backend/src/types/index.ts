import { Request } from 'express';

export interface UserPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}
