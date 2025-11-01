import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodObject } from "zod"; // Importamos AnyZodObject
import { ApiError } from "../model/Error";

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
    .enum(["sender", "validator", "admin"], {
      error: "El rol es obligatorio.",
    })
    .default("sender"),
});

// 2. Esquema de Login
export const loginSchema = z.object({
  email: z.string().email("El formato de email no es válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

/**
 * Middleware de validación genérico.
 * Usa Request y Response sin argumentos genéricos para evitar conflictos de sobrecarga.
 * @param schema El esquema Zod a validar (debe ser un AnyZodObject).
 */
export const validate =
  (schema: ZodObject) => // Tipo correcto para el esquema
  (req: Request, _res: Response, next: NextFunction) => {
    // Si la validación falla, next() se llama con el error 400.
    try {
      // Intenta parsear el body contra el esquema
      schema.parse(req.body);

      // Si es exitoso, pasa al siguiente middleware/controller
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatea el mensaje de error de Zod para una respuesta limpia
        const errorMessage = error.issues
          .map((err) => {
            // Muestra la ruta del campo y el mensaje de error
            return `${err.path.join(".")}: ${err.message}`;
          })
          .join(" | ");

        // Usamos ApiError para enviar un error 400 (Bad Request)
        return next(new ApiError(400, `Error de validación: ${errorMessage}`));
      }

      // Error no reconocido
      return next(
        ApiError.internal("Error desconocido durante la validación de datos.")
      );
    }
  };
