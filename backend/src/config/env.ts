import { config } from "dotenv";
import { z } from "zod";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFile);

// env.ts está en backend/src/config/
// ../../.env apunta a backend/.env
const envPath = resolve(currentDirectory, "../../.env");

const dotenvResult = config({
  path: envPath,
});

if (dotenvResult.error) {
  console.error(`No se pudo cargar el archivo .env desde: ${envPath}`);
  throw dotenvResult.error;
}

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(4000),

  FRONTEND_URL: z
    .string()
    .default("http://localhost:5173"),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().default("eventos_iepp"),

  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET debe tener al menos 16 caracteres."),

  JWT_EXPIRES_IN: z.string().default("8h"),

  API_PERU_URL: z
    .string()
    .url("API_PERU_URL debe ser una URL válida.")
    .default("https://apiperu.dev/api/dni"),

  API_PERU_TOKEN: z
    .string()
    .min(1, "API_PERU_TOKEN es obligatorio."),

  ADMIN_USER: z.string().default("ADMIN"),
  ADMIN_PASSWORD: z.string().default("IEPP2026-08"),
});

const environment = {
  ...process.env,

  // También acepta el nombre anterior por compatibilidad.
  API_PERU_URL:
    process.env.API_PERU_URL ??
    process.env.API_PERU_BASE_URL ??
    "https://apiperu.dev/api/dni",
};

const result = schema.safeParse(environment);

if (!result.success) {
  console.error("Error en las variables de entorno:");

  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }

  throw new Error(
    "La configuración del archivo backend/.env no es válida.",
  );
}

export const env = result.data;