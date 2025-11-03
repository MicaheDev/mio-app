/**
 * Clase de Error Personalizada para la API.
 * Permite manejar errores con un código de estado HTTP específico.
 */
export class ApiError extends Error {
  // Código de estado HTTP (e.g., 400, 401, 409)
  public status: number;

  // Mensaje legible para el cliente
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;

    // Configuración para el motor de Node.js (opcional pero recomendado)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  // Métodos estáticos para errores comunes (facilita el uso en el controller)

  public static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  public static notFound(message: string): ApiError {
    return new ApiError(404, message);
  }
  public static unauthorized(
    message: string = "Credenciales de autenticación no válidas."
  ): ApiError {
    return new ApiError(401, message);
  }

  public static forbidden(message: string = "Prohibido el acceso."): ApiError {
    return new ApiError(403, message);
  }

  public static conflict(message: string = "El recurso ya existe."): ApiError {
    return new ApiError(409, message);
  }

  public static internal(
    message: string = "Error interno del servidor."
  ): ApiError {
    return new ApiError(500, message);
  }
}
