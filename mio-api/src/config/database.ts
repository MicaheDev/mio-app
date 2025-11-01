import { DatabaseSync } from "node:sqlite";
import { getContent } from "../utils/readFile";

type DBInstance = DatabaseSync;

export class Database {
  private static instance: Database;
  private db!: DBInstance;

  private constructor() {
    try {
      this.db = new DatabaseSync("./src/database/database.db");
      this.db.exec(getContent("./database/seed.sql"));

      console.log("Database initialized and seed executed successfully.");
    } catch (error) {
      console.error("Error initializing or seeding the database:", error);
      throw error; // Es buena práctica detener la aplicación si la DB no inicializa
    }
  }

  public static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  public getDB(): DBInstance {
    return this.db;
  }

  
}
