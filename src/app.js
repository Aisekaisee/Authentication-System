import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRouter);

export default app;
