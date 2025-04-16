import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface UserPayload {
  userID: string;
  name: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: UserPayload; // Attach user info to request
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserPayload;
    req.user = decoded; // Attach user data to req.user
    next(); // Continue to the next middleware/route
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      return;
    }
    next();
  };
};
