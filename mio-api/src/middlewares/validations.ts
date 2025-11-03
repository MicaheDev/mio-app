import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject } from "zod"; // Importamos AnyZodObject
import { ApiError } from "../model/Error";

/**
 * Middleware de validación genérico.
 * Usa Request y Response sin argumentos genéricos para evitar conflictos de sobrecarga.
 * @param schema El esquema Zod a validar (debe ser un AnyZodObject).
 */
export const validate =
  (
    schema: ZodObject // Tipo correcto para el esquema
  ) =>
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
