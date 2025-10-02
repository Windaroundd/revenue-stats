import mongoose from "mongoose";

export async function connectToDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  console.log("process.env.MONGODB_URI: ", process.env.MONGODB_URI);
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  } else {
    console.log("Connect success");
  }

  await mongoose.connect(mongoUri);
}
