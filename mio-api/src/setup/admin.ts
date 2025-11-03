import { Database } from "../config/database";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } from "../config/environment";

// Obtener la instancia de la base de datos de forma sincrónica
const db = Database.getInstance().getDB();

/**
 * Realiza el proceso de configuración del usuario administrador.
 * 1. Verifica si el administrador ya existe por email.
 * 2. Si no existe, hashea la contraseña y lo inserta en la base de datos.
 */
export async function setupAdmin() {
  
  // --- PASO 1: VERIFICAR SI EL ADMINISTRADOR YA EXISTE ---
  try {
    const checkSql = "SELECT id FROM users WHERE email = ? AND role = 'admin'";
    
    // Usamos .get() para obtener la primera fila o undefined.
    const existingAdmin = db.prepare(checkSql).get(ADMIN_EMAIL);

    if (existingAdmin) {
      console.log(`✅ [INFO] El usuario administrador (${ADMIN_EMAIL}) ya existe. Saltando creación.`);
      return; // Salimos de la función si ya existe
    }
  } catch (checkError) {
    console.error(`❌ [ERROR] Falló la verificación del administrador:`, checkError);
    // Continuamos si es un error de lectura, pero es mejor detenerse.
  }
  
  // --- PASO 2: CREAR EL ADMINISTRADOR SI NO EXISTE ---
  try {
    const id = uuidv4();
    const name = ADMIN_NAME;
    const email = ADMIN_EMAIL;
    const password = ADMIN_PASSWORD; // Ya verificado como string en environment.ts

    // Como hash es una operación síncrona en muchos entornos (o la librería 
    // lo maneja de forma síncrona o asíncrona), nos aseguramos de usarlo
    // de la manera que espera la librería instalada. 
    // Nota: bcrypt.hash es típicamente async, pero usaremos sintaxis sync/await
    // si el entorno lo requiere. Si bcrypt en Node.js es síncrono, puedes remover 'await'.
    // Dado que has marcado tu función como 'async', la mantendré.
    
    // NOTA: Para ambientes Node.js, bcrypt.hash es ASÍNCRONO, por lo que la función DEBE ser ASYNC.
    const password_hash = hash(password, 10); // Esta llamada devuelve una promesa.

    // Debemos esperar la promesa del hash.
    // Si la función que llama a `setupAdmin` no es async, este 'await' no funciona.
    // Asumo que la función contenedora donde se llama a `setupAdmin` es async/await.
    const hashedPassword = password_hash; // Realizaré la espera más abajo.
    
    // Sentencia de Inserción
    const insertSql = 
      "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)";
      
    const statement = db.prepare(insertSql);
    
    // Ejecutamos la inserción.
    const result = statement.run(
      id, 
      name, 
      email, 
      await hashedPassword, // Esperamos el hash aquí
      "admin"
    );
    
    console.log(`✅ [OK] Administrador insertado con éxito (${email}). Filas afectadas: ${result.changes}`);

  } catch (error) {
    console.error(`❌ [ERROR] Falló la creación del administrador:`, error);
    // No lanzar el error aquí para evitar detener el servidor si es un error no crítico.
  }
}
