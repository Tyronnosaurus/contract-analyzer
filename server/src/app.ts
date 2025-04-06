/**
 * Sets up the Express application.
 * - Connects to MongoDB using Mongoose.
 * - Configures middleware for CORS, security, logging, sessions, and authentication.
 * - Defines routes for authentication, contracts, and payments.
 * - Starts the server on port 8080.
 */

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import "./config/passport";

// Routes
import authRoute from "./routes/auth";
import contractsRoute from "./routes/contracts";
import paymentsRoute from "./routes/payments";
import { handleWebhook } from "./controllers/payment.controller";


// Set up and configures the Express application for the server
const app = express();

// Connect to MongoDB using Mongoose.
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

  
//////////////////////////////
//// Configure middleware ////
//////////////////////////////

// cors: Enables cross-origin requests
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// helmet: Adds security headers
app.use(helmet());

// morgan: Logs HTTP requests
app.use(morgan("dev"));

// Route to handle Stripe webhooks for payment events
app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// express.json: Parses incoming JSON requests. Allows server to handle requests with
// Content-Type 'application/json' by converting it into a JavaScript object, which is
// then accessible via req.body
app.use(express.json());

// express-session: Manages user sessions with MongoDB as the session store
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI! }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport.js for authentication
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoute); // Handles authentication-related routes.
app.use("/contracts", contractsRoute); // Handles contract-related operations.
app.use("/payments", paymentsRoute); // Handles payment-related operations.

// Start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
