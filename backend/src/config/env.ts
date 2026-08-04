import { config } from "dotenv";
import { z } from "zod";
import {
  dirname,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

const currentFile =
  fileURLToPath(
    import.meta.url,
  );

const currentDirectory =
  dirname(currentFile);

const envPath =
  resolve(
    currentDirectory,
    "../../.env",
  );

/**
 * En local carga backend/.env.
 * En Railway utiliza directamente process.env.
 */
if (
  process.env.NODE_ENV !==
  "production"
) {
  const dotenvResult =
    config({
      path: envPath,
    });

  if (
    dotenvResult.error
  ) {
    console.warn(
      `No se pudo cargar el archivo .env desde: ${envPath}`,
    );
  }
}

/**
 * Compatibilidad:
 *
 * Local:
 * DB_HOST, DB_PORT, DB_USER...
 *
 * Railway:
 * MYSQLHOST, MYSQLPORT,
 * MYSQLUSER, MYSQLPASSWORD,
 * MYSQLDATABASE.
 */
const environment = {
  ...process.env,

  DB_HOST:
    process.env.MYSQLHOST ??
    process.env.DB_HOST ??
    "127.0.0.1",

  DB_PORT:
    process.env.MYSQLPORT ??
    process.env.DB_PORT ??
    "3306",

  DB_USER:
    process.env.MYSQLUSER ??
    process.env.DB_USER ??
    "root",

  DB_PASSWORD:
    process.env.MYSQLPASSWORD ??
    process.env.DB_PASSWORD ??
    "",

  DB_NAME:
    process.env.MYSQLDATABASE ??
    process.env.DB_NAME ??
    "eventos_iepp",

  API_PERU_URL:
    process.env.API_PERU_URL ??
    process.env.API_PERU_BASE_URL ??
    "https://apiperu.dev/api/dni",
};

const schema = z.object({
  NODE_ENV: z
    .enum([
      "development",
      "test",
      "production",
    ])
    .default(
      "development",
    ),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),

  FRONTEND_URL: z
    .string()
    .min(1)
    .default(
      "http://localhost:5173",
    ),

  DB_HOST: z
    .string()
    .min(
      1,
      "DB_HOST es obligatorio.",
    ),

  DB_PORT: z.coerce
    .number()
    .int()
    .positive(),

  DB_USER: z
    .string()
    .min(
      1,
      "DB_USER es obligatorio.",
    ),

  DB_PASSWORD:
    z.string(),

  DB_NAME: z
    .string()
    .min(
      1,
      "DB_NAME es obligatorio.",
    ),

  JWT_SECRET: z
    .string()
    .min(
      16,
      "JWT_SECRET debe tener al menos 16 caracteres.",
    ),

  JWT_EXPIRES_IN:
    z.string().default(
      "8h",
    ),

  API_PERU_URL: z
    .string()
    .url(
      "API_PERU_URL debe ser una URL válida.",
    ),

  API_PERU_TOKEN: z
    .string()
    .min(
      1,
      "API_PERU_TOKEN es obligatorio.",
    ),

  ADMIN_USER: z
    .string()
    .default(
      "ADMIN",
    ),

  ADMIN_PASSWORD:
    z.string().min(
      6,
      "ADMIN_PASSWORD debe tener al menos 6 caracteres.",
    ),
});

const result =
  schema.safeParse(
    environment,
  );

if (!result.success) {
  console.error(
    "Error en las variables de entorno:",
  );

  for (
    const issue
    of result.error.issues
  ) {
    console.error(
      `- ${issue.path.join(
        ".",
      )}: ${issue.message}`,
    );
  }

  throw new Error(
    "La configuración de variables de entorno no es válida.",
  );
}

export const env =
  result.data;