import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema> & { _id: string };

export const UserModel = model("User", userSchema);
