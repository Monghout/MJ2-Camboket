import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  role: "buyer" | "seller";
  subscriptionStatus: "active" | "inactive";
  photo: string;
  socialMediaLinks: string[];
  isOnline: boolean;
  lastSeen: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["buyer", "seller"], default: "buyer" },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    photo: { type: String, default: "" },
    socialMediaLinks: { type: [String], default: [] },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
