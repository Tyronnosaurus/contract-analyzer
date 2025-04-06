/**
 * Defines the Mongoose schema for user data.
 */
import { Document, model, Schema } from "mongoose";

// Represents a user with fields for Google ID, email, display name, profile picture, and premium status
export interface IUser extends Document {
  googleId: string;
  email: string;
  displayName: string;
  profilePicture: string;
  isPremium: boolean;
}

// MongoDB schema for storing user data (Google ID, email, name...)
const UserSchema: Schema = new Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  profilePicture: { type: String },
  isPremium: { type: Boolean, default: true },
});

export default model<IUser>("User", UserSchema);
