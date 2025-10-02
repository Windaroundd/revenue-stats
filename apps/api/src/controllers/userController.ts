import type { Request, Response } from "express";
import { UserModel } from "../models/User";

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await UserModel.find().lean();
  res.json(users);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const { name, email } = req.body as { name?: string; email?: string };
  const user = await UserModel.create({ name, email });
  res.status(201).json(user);
}
