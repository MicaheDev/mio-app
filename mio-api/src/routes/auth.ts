import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validate } from "../middlewares/validations";
import { authHandler } from "../middlewares/authHandler";
import { adminHandler } from "../middlewares/adminHandler";
import { loginSchema, registerSchema } from "../model/User";

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
