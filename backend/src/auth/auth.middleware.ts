import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Erweiterung, damit wir die Benutzerdaten an die Anfrage hängen können
export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

// Türsteher 1: prüft, ob überhaupt ein gültiger Token da ist
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Kein Token. Bitte einloggen.' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      role: string;
    };
    req.user = { id: payload.id, role: payload.role };
    next(); // alles ok -> weiter zur eigentlichen Route
  } catch (error) {
    return res.status(401).json({ message: 'Token ungültig oder abgelaufen.' });
  }
}

// Türsteher 2: prüft zusätzlich, ob die Person Admin ist
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Nur für Administratoren.' });
  }
  next();
}
