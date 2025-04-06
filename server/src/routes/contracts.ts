/**
 * Defines routes for contract-related operations using Express:
 * detect-type, analyze, get user contracts, get contract by ID...
 * 
 * - Middleware:
 *   - Uses `isAuthenticated` to ensure routes are accessible only to authenticated users.
 *   - Uses `handleErrors` to handle errors in asynchronous route handlers.
 *   - Includes `uploadMiddleware` for handling PDF file uploads.
 */

import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  analyzeContract,
  detectAndConfirmContractType,
  getContractByID,
  getUserContracts,
  uploadMiddleware,
} from "../controllers/contract.controller";
import { handleErrors } from "../middleware/errors";

const router = express.Router();

// Detects the type of a contract from an uploaded PDF (requires authentication).
router.post(
  "/detect-type",
  isAuthenticated,
  uploadMiddleware,
  handleErrors(detectAndConfirmContractType)
);

// Analyzes an uploaded contract using AI (requires authentication).
router.post(
  "/analyze",
  isAuthenticated,
  uploadMiddleware,
  handleErrors(analyzeContract)
);

// Retrieves all contracts associated with the authenticated user.
router.get("/user-contracts", isAuthenticated, handleErrors(getUserContracts));

// Retrieves a specific contract by its ID.
router.get("/contract/:id", isAuthenticated, handleErrors(getContractByID));

export default router;
