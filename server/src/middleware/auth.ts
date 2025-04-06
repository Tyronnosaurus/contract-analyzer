/**
 * This file contains middleware for authentication.
 * 
 * - `isAuthenticated`: Checks if the user is authenticated by verifying the `req.isAuthenticated()` method.
 *   - If authenticated, it proceeds to the next middleware or route handler.
 *   - If not, it responds with a 401 Unauthorized error.
*/
import { NextFunction, Request, Response } from "express";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};
