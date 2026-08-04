import express from "express";
import cors from "cors";
import helmet from "helmet";

import { publicRouter } from "./modules/catalogs/catalogs.routes.js";
import { attendanceRouter } from "./modules/attendance/attendance.routes.js";
import { mealsRouter } from "./modules/meals/meals.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { collaboratorRouter } from "./modules/collaborators/collaborators.routes.js";

import {
  adminStaffRouter,
} from "./modules/staff/adminStaff.routes.js";

import {
  adminStallRouter,
  stallRouter,
} from "./modules/stalls/stalls.routes.js";

import {
  adminCollaboratorRouter,
} from "./modules/collaborators/adminCollaborators.routes.js";

import { reportsRouter } from "./modules/reports/reports.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { env } from "./config/env.js";

export const app = express();

/**
 * Orígenes permitidos.
 *
 * Local:
 * http://localhost:5173
 *
 * Producción:
 * valor de FRONTEND_URL en Railway.
 */
const allowedOrigins = Array.from(
  new Set([
    "http://localhost:5173",
    env.FRONTEND_URL,
  ]),
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(
  cors({
    origin(
      origin,
      callback,
    ) {
      /**
       * Permitir solicitudes sin Origin:
       * Postman, servidor a servidor,
       * navegador abriendo directamente la API.
       */
      if (!origin) {
        callback(null, true);
        return;
      }

      if (
        allowedOrigins.includes(
          origin,
        )
      ) {
        callback(null, true);
        return;
      }

      console.warn(
        `Origen bloqueado por CORS: ${origin}`,
      );

      callback(
        new Error(
          `Origen no permitido por CORS: ${origin}`,
        ),
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],

    exposedHeaders: [
      "Content-Disposition",
    ],
  }),
);

/**
 * Responder solicitudes preflight.
 */
app.options(
  "*",
  cors({
    origin(
      origin,
      callback,
    ) {
      if (
        !origin ||
        allowedOrigins.includes(
          origin,
        )
      ) {
        callback(null, true);
        return;
      }

      callback(
        new Error(
          `Origen no permitido por CORS: ${origin}`,
        ),
      );
    },

    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

/**
 * Health check.
 */
app.get(
  "/api/health",
  (_req, res) => {
    res.json({
      ok: true,
      message:
        "API IEPP activa",
      environment:
        env.NODE_ENV,
    });
  },
);

/**
 * Rutas públicas.
 */
app.use(
  "/api/public",
  publicRouter,
);

/**
 * Asistencia.
 */
app.use(
  "/api/attendance",
  attendanceRouter,
);

/**
 * Alimentación.
 */
app.use(
  "/api/meals",
  mealsRouter,
);

/**
 * Autenticación.
 */
app.use(
  "/api/auth",
  authRouter,
);

/**
 * Colaboradores.
 */
app.use(
  "/api/collaborator",
  collaboratorRouter,
);

/**
 * Puestos.
 */
app.use(
  "/api/stall",
  stallRouter,
);

/**
 * Gestión administrativa de puestos.
 */
app.use(
  "/api/admin/stalls",
  adminStallRouter,
);

/**
 * Reportes.
 */
app.use(
  "/api/reports",
  reportsRouter,
);

/**
 * Gestión administrativa
 * de colaboradores.
 */
app.use(
  "/api/admin/collaborators",
  adminCollaboratorRouter,
);

/**
 * Gestión administrativa
 * del personal operativo.
 */
app.use(
  "/api/admin/staff",
  adminStaffRouter,
);

/**
 * Ruta no encontrada dentro de /api.
 */
app.use(
  "/api",
  (_req, res) => {
    res.status(404).json({
      ok: false,
      message:
        "Ruta de API no encontrada.",
    });
  },
);

/**
 * El manejador de errores siempre
 * debe colocarse al final.
 */
app.use(errorHandler);