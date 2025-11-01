import { Request, Response, NextFunction } from "express";
import { ApiError } from "../model/Error";
import { Database } from "../config/database";

interface UserRoleFromDB {
  role: string;
}
const db = Database.getInstance().getDB();

export function adminHandler(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    // Si no hay req.user, el token no fue decodificado o el authHandler falló.
    // Enviamos el error 401 para que pase al error handler central.
    return next(
      ApiError.unauthorized("Fallo de autenticación: token no decodificado.")
    );
  }
  const { id, role } = req.user;

  if (role !== "admin") {
    return next(
      ApiError.forbidden("Acceso denegado: Se requiere rol de administrador.")
    );
  }

  try {
    const querySql = "SELECT role FROM users WHERE id = ?";


    const user = db.prepare(querySql).get(id) as UserRoleFromDB | undefined;

    if (!user) {
      return next(
        ApiError.forbidden("Acceso denegado: Usuario no encontrado o inactivo.")
      );
    }

    if (user.role !== "admin") {
      return next(
        ApiError.forbidden("Acceso denegado: Su rol ha sido revocado.")
      );
    }

    return next();
  } catch (error) {
    console.error("Error DB en adminHandler:", error);
    return next(ApiError.internal("Error de servidor al verificar permisos."));
  }
}
