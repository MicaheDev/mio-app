import { Request, Response, NextFunction } from "express";
import { ApiError } from "../model/Error";

export const errorHandler = (
  err: Error, // Express reconoce que es un middleware de error por el primer parámetro 'err'
  req: Request,
  res: Response,
  next: NextFunction // Aunque no se usa, es necesario mantener la firma
) => {
  // 1. Manejo de errores personalizados (ApiError)
  if (err instanceof ApiError) {
    // Si es un error conocido de la API (401, 409, 500, etc.)
    return res.status(err.status).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString(),
      // status: err.status // Opcional, si quieres exponer el status en el body
    });
  }

  // 2. Manejo de errores no capturados (Errores genéricos, 500)
  // Imprimimos el stack para depuración, pero enviamos un mensaje genérico al cliente
  console.error("❌ ERROR CRÍTICO NO CAPTURADO:", err.stack);

  return res.status(500).json({
    success: false,
    message: "Error interno desconocido del servidor.",
    timestamp: new Date().toISOString(),
  });
};