import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeybuypilot', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.user = user as { id: string; email: string };
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
