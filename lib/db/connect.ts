import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

/**
 * Cached Mongoose connection for Next.js (dev HMR + serverless).
 * Safe to call from Route Handlers / Server Components.
 */
export async function connectDb() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  try {
    await global._mongoosePromise;
  } catch (err) {
    global._mongoosePromise = undefined;
    throw err;
  }

  return mongoose;
}
