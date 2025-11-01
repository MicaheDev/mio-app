import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import {
  loginSchema,
  registerSchema,
  validate,
} from "../middlewares/validations";
import { authHandler } from "../middlewares/authHandler";
import { adminHandler } from "../middlewares/adminHandler";

const authRoutes = Router();

authRoutes.post("/login", validate(loginSchema), AuthController.handleLogin);
authRoutes.post(
  "/register",
  authHandler,
  adminHandler,
  validate(registerSchema),
  AuthController.handleRegister
);

export default authRoutes;
