import dotenv from "dotenv";

dotenv.config();

if(!process.env.MONGO_URI){
  throw new Error("MONGO_URI is not defined in environment variables");
}

if (!process.env.PORT) {
  throw new Error("PORT is not defined in environment variables");
}

const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/authentication-system",
};

export default config;