/**
 * This file defines routes for payment-related operations using Express:
 *   create-checkout-session, membership-status.
 * 
 * - Middleware:
 *   - Uses `isAuthenticated` to ensure routes are accessible only to authenticated users.
 */
import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  createCheckoutSession,
  getPremiumStatus,
} from "../controllers/payment.controller";

const router = express.Router();

// Creates a Stripe Checkout session for processing payments (requires authentication).
router.get("/create-checkout-session", isAuthenticated, createCheckoutSession);

// Retrieves the premium subscription status of the authenticated user (requires authentication).
router.get("/membership-status", isAuthenticated, getPremiumStatus);

export default router;
