
// Carga las variables de entorno
process.loadEnvFile(".env");

// -------------------------------------------------------------
// Función para obtener variables de entorno críticas
// -------------------------------------------------------------

/**
 * Obtiene el valor de una variable de entorno. 
 * Si no está definida, lanza un error y termina el proceso.
 * @param key La clave de la variable de entorno a buscar.
 * @returns El valor de la variable como string.
 */
function getRequiredEnv(key: string): string {
    const value = process.env[key];
    
    if (!value) {
        console.error(`❌ Error Crítico: La variable de entorno requerida '${key}' no fue encontrada.`);
        process.exit(500); 
    }
    
    // Si llegamos aquí, TypeScript sabe que 'value' es un string.
    return value;
}

// -------------------------------------------------------------
// Declaración y Exportación de Variables (¡Ahora tipadas como string!)
// -------------------------------------------------------------

// Puerto no crítico, se usa valor por defecto si falta
const PORT = process.env.PORT ?? "3001"; 

// Variables críticas: forzadas a ser string mediante la función verificadora
const ADMIN_NAME: string = getRequiredEnv("ADMIN_NAME");
const ADMIN_EMAIL: string = getRequiredEnv("ADMIN_EMAIL");
const ADMIN_PASSWORD: string = getRequiredEnv("ADMIN_PASSWORD"); // Aquí tu variable 'password'
const JWT_SECRET: string = getRequiredEnv("JWT_SECRET"); // Aquí tu variable 'password'

// Exportación
export { PORT, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET };
