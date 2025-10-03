import { Schema, model, type Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IAdmin {
  email: string;
  password: string;
  name: string;
  role: "admin" | "super_admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IAdminMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type AdminModel = IAdmin & IAdminMethods & Document;

const adminSchema = new Schema<AdminModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export type Admin = AdminModel;

export const AdminModel = model<AdminModel>("Admin", adminSchema);
