/**
 * Defines authentication-related routes (using Express and Passport.js) for login, logout, get current user...
 * Integrates with Passport.js for Google OAuth authentication.
 */
import express from "express";
import passport from "passport";

const router = express.Router();

// Route to initiate Google OAuth authentication
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Route to handle the Google OAuth callback and redirect to the dashboard on success
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Route to get the authenticated user's details if logged in, or a 401 error if not.
router.get("/current-user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

// Route to log out the user and respond with a success status.
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ status: "ok" });
  });
});

export default router;
