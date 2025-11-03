import z from "zod";

export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface UserRegisterDTO {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "sender" | "custodian";
  created_at: Date;
}

export interface TokenData {
  id: string;
  email: string;
  role: string;
}

export interface TokenPayload {
  data: TokenData;
  iat: number;
  exp: number;
}

// Esquema base para el formato de contraseña
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula.")
  .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula.")
  .regex(/[0-9]/, "La contraseña debe contener al menos un número.")
  .regex(
    /[^A-Za-z0-9]/,
    "La contraseña debe contener al menos un carácter especial."
  );

// 1. Esquema de Registro
export const registerSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  email: z.string().email("El formato de email no es válido."),
  password: passwordSchema,
  role: z
    .enum(["sender", "custodian", "admin"], {
      error: "El rol es obligatorio.",
    })
    .default("sender"),
});

// 2. Esquema de Login
export const loginSchema = z.object({
  email: z.string().email("El formato de email no es válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});
