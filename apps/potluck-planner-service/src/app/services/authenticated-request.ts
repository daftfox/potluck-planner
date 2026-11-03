import { Request } from 'express';
import { AuthenticatedUser } from '../models/authenticated-user';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
