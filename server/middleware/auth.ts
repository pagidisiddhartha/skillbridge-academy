import { Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { User } from '../types.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// In-memory token store: token -> userId (or base64 signed token)
const activeTokens = new Map<string, { userId: string; expiresAt: number }>();

export function generateToken(user: User): string {
  const token = `skb_tok_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  // 7 days expiration
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  activeTokens.set(token, { userId: user.id, expiresAt });
  return token;
}

export function revokeToken(token: string): void {
  activeTokens.delete(token);
}

// Simple IP-based rate limiter for auth endpoints
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

export function authRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 20;

  const entry = loginAttempts.get(ip);
  if (!entry) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (now - entry.firstAttempt > windowMs) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  entry.count += 1;
  if (entry.count > maxAttempts) {
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
    });
    return;
  }

  next();
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Malformed authorization header. Expected Bearer <token>' });
    return;
  }

  const token = parts[1];
  const session = activeTokens.get(token);

  // If token is in activeTokens and not expired
  if (session && session.expiresAt > Date.now()) {
    const user = db.getUserById(session.userId);
    if (!user) {
      res.status(401).json({ error: 'User associated with session not found.' });
      return;
    }
    req.user = user;
    return next();
  }

  // Fallback for demo direct user ID tokens: e.g. "demo-token-user-student-1" or "skb_tok_user-student-1_..."
  if (token.startsWith('demo-token-') || token.startsWith('skb_tok_')) {
    const userIdMatch = token.match(/user-[a-z]+-[0-9]+/);
    if (userIdMatch) {
      const user = db.getUserById(userIdMatch[0]);
      if (user) {
        req.user = user;
        return next();
      }
    }
  }

  res.status(401).json({ error: 'Invalid or expired authentication session.' });
}

export function optionalAuthenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    const token = parts[1];
    const session = activeTokens.get(token);
    if (session && session.expiresAt > Date.now()) {
      const user = db.getUserById(session.userId);
      if (user) req.user = user;
    } else {
      const userIdMatch = token.match(/user-[a-z]+-[0-9]+/);
      if (userIdMatch) {
        const user = db.getUserById(userIdMatch[0]);
        if (user) req.user = user;
      }
    }
  }
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized. Please sign in.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden. Role '${req.user.role}' lacks permission for this action. Required: ${allowedRoles.join(' or ')}.`,
      });
      return;
    }

    next();
  };
}
