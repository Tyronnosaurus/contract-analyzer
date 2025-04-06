import mongoose from "mongoose";

// Checks if a given string is a valid MongoDB ObjectId
export function isValidMongoId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}
