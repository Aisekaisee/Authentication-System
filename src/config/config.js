import dotenv from "dotenv";

dotenv.config();

if(!process.env.MONGO_URI){
  throw new Error("MONGO_URI is not defined in environment variables");
}

if (!process.env.PORT) {
  throw new Error("PORT is not defined in environment variables");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const config = {
  PORT: process.env.PORT || 8001,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/authentication-system",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_key",
};

export default config;