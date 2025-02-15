import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL; // Make sure this is correct in .env.local

if (!MONGODB_URL) {
  throw new Error("❌ MONGODB_URI is not defined in .env.local");
}

// Cached connection object to prevent multiple reconnections
interface MongooseConn {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: MongooseConn = (global as any).mongoose || {
  conn: null,
  promise: null,
};

export const connectDB = async () => {
  if (cached.conn) return cached.conn; // Return cached connection if available

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URL, {
        dbName: "Clerk-Auth",
        bufferCommands: false,
        connectTimeoutMS: 30000,
      })
      .then((mongoose) => {
        console.log("✅ MongoDB Connected!");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
