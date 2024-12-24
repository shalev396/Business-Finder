import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  plan: "Standard" | "Gold" | "Platinum";
  role?: "user" | "admin";
  savedBusinesses: Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plan: {
      type: String,
      enum: ["Standard", "Gold", "Platinum"],
      default: "Standard",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    savedBusinesses: [{ type: Schema.Types.ObjectId, ref: "Business" }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving only if it's been modified
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

export const User = model<IUser>("User", userSchema);
