import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

/*
 * POST /api/auth/register
 */
authRouter.post("/register", authController.registerUser);

/**
 * GET /api/auth/get-me
 */
authRouter.get("/get-me", authController.getUser);

/*
 * GET /api/auth/refresh-token 
 */
authRouter.get("/refresh-token", authController.refreshToken);

export default authRouter;
