import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

/*
 * POST /api/auth/register
 */
authRouter.post("/register", authController.registerUser);

/*
 * POST /api/auth/login
 */
authRouter.post("/login", authController.loginUser);

/**
 * GET /api/auth/get-me
 */
authRouter.get("/get-me", authController.getUser);

/*
 * GET /api/auth/refresh-token 
 */
authRouter.get("/refresh-token", authController.refreshToken);

/*
 * GET /api/auth/logout
*/
authRouter.get("/logout", authController.logoutUser);

/*
 * GET /api/auth/logout-all-sessions
 */
authRouter.get("/logout-all-sessions", authController.logoutAllUserSessions);

export default authRouter;
