 /**
   Configures Passport.js for user authentication using Google OAuth 2.0.
   
   - Initializes the GoogleStrategy with client credentials and a callback URL.
   - In the callback, checks if a user with the given Google ID exists in the database.
     - If user exists, it logs them in.
     - If user does not exist, creates new user with the provided Google profile info.
   - Serializes the user by storing their ID in the session.
   - Deserializes the user by retrieving their details from the database using the stored ID.
 */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User, { IUser } from "../models/user.model";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails![0].value,
            displayName: profile.displayName,
            profilePicture: profile.photos![0].value,
          });
        }

        done(null, user);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await User.findById(id);
  done(null, user);
});
