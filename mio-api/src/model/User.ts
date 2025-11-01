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
  role: "admin" | "sender" | "validator";
  created_at: Date;
}

export interface TokenData {
  id: string
  email: string;
  role: string;
}

export interface TokenPayload {
  data: TokenData;
  iat: number;
  exp: number;
}
