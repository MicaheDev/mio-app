import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function getContent(file_path: string) {
  const __filename = fileURLToPath(import.meta.url);

  const __dirname = path.dirname(__filename);

  const filePath = path.join(__dirname,'..', file_path);
  const content = fs.readFileSync(filePath, "utf-8");

  return content;
}
