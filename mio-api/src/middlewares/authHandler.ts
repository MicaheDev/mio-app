import { Request, Response, NextFunction } from "express";
import { ApiError } from "../model/Error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/environment";
import { TokenData, TokenPayload } from "../model/User";
import { Database } from "../config/database";

declare global {
    namespace Express {
        interface Request {
            user?: TokenData
        }
    }
}

const db = Database.getInstance().getDB()

export function authHandler(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      ApiError.unauthorized(
        "Token de autenticación faltante o con formato incorrecto."
      )
    );
  }

  const token = authHeader.split(" ")[1];

  if(!token){
        return next(
      ApiError.unauthorized(
        "Token de autenticación faltante o con formato incorrecto."
      )
    );
  }

  try {
    // jwt.verify verifica automáticamente la firma y la fecha de expiración (exp)
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // 3. Pasar el Payload al Siguiente Handler
    // Guardamos la información del usuario en el objeto Request
    const querySql = "SELECT email FROM users WHERE id = ?";
    const user = db.prepare(querySql).get(decoded.data.id);

    if (!user) {
      return next(
        ApiError.forbidden("Acceso denegado: Usuario no encontrado o inactivo.")
      );
    }

    req.user = decoded.data;

    // El token es válido y no ha expirado. Continuamos al siguiente middleware/controller.
    next();
  } catch (error) {
    // 4. Manejo de Errores Específicos de JWT

    if (error) {
      // Error: El token ha expirado
      return next(
        ApiError.unauthorized(
          "El token ha expirado. Por favor, vuelva a iniciar sesión."
        )
      );
    }

    if (error) {
      // Error: La firma es inválida, el token está mal formado, etc.
      return next(ApiError.unauthorized("Token de autenticación inválido."));
    }

    // Error: Cualquier otro error (ej. problema con la librería)
    console.error("Error desconocido en authHandler:", error);
    return next(
      ApiError.internal("Error interno al procesar la autenticación.")
    );
  }
}
