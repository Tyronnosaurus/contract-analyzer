/**
 * This file provides middleware for handling errors in asynchronous route handlers.
 * 
 * - `handleErrors`: A higher-order function that wraps asynchronous route handlers.
 *   - Catches any errors thrown during execution and passes them to the next middleware for centralized error handling.
 */
import { NextFunction, Request, Response } from "express";

export const handleErrors = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
