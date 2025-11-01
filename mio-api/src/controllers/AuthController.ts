import { NextFunction, Response, Request } from "express";
import { Database } from "../config/database";
import { User, UserLoginDTO, UserRegisterDTO } from "../model/User";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/environment";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../model/Error";

const db = Database.getInstance().getDB();

export const AuthController = {
  async handleLogin(
    req: Request<{}, {}, UserLoginDTO>,
    res: Response,
    next: NextFunction
  ) {
    const { email, password } = req.body;

    try {
      const checkSql =
        "SELECT id, role, password_hash FROM users WHERE email = ?";

      const existingUser = db.prepare(checkSql).get(email) as User | undefined;
      console.log(existingUser);
      if (!existingUser) {
        return next(
          ApiError.unauthorized(
            "Credenciales incorrectas (usuario/contraseña)."
          )
        );
      }

      const isCorrectPassword = await compare(
        password,
        existingUser.password_hash
      );

      if (!isCorrectPassword) {
        return next(
          ApiError.unauthorized(
            "Credenciales incorrectas (usuario/contraseña)."
          )
        );
      }

      const token = jwt.sign(
        {
          data: {
            id:existingUser.id,
            email: email,
            role: existingUser.role,
          },
        },
        JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      return res.status(200).json({ token: token });
    } catch (error) {
      console.error("Falló el proceso de login:", error);
      return next(ApiError.internal("Error en el servidor durante el login."));
    }
  },

  async handleRegister(
    req: Request<{}, {}, UserRegisterDTO>,
    res: Response,
    next: NextFunction
  ) {
    const { name, email, password, role } = req.body;

    try {
      const checkSql = "SELECT id FROM users WHERE email = ?";

      const existingUser = db.prepare(checkSql).get(email);

      if (existingUser) {
        return next(
          ApiError.conflict(`El usuario con email ${email} ya está registrado.`)
        );
      }
    } catch (error) {
      console.error("Falló la verificación de email:", error);
      return next(
        ApiError.internal("Error en el servidor al verificar el email.")
      );
    }

    try {
      const id = uuidv4();
      const password_hash = await hash(password, 10);

      const insertSql =
        "INSERT INTO users (id,name, email, password_hash, role) VALUES (?,?,?,?,?)";

      const statement = db.prepare(insertSql);

      statement.run(id, name, email, password_hash, role);

      return res.status(201).json({
        message: `Usuario registrado con éxito.`,
        userId: id,
      });
    } catch (error) {
      console.error("Falló la creación del usuario:", error);
      return next(
        ApiError.internal("Error en el servidor al crear el usuario.")
      );
    }
  },
};
