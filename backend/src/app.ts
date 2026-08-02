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

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.get(
  "/api/health",
  (_req, res) => {
    res.json({
      ok: true,
      message: "API IEPP activa",
    });
  },
);

app.use(
  "/api/public",
  publicRouter,
);

app.use(
  "/api/attendance",
  attendanceRouter,
);

app.use(
  "/api/meals",
  mealsRouter,
);

app.use(
  "/api/auth",
  authRouter,
);

app.use(
  "/api/collaborator",
  collaboratorRouter,
);

app.use(
  "/api/stall",
  stallRouter,
);

/**
 * Nueva gestión administrativa de puestos.
 */
app.use(
  "/api/admin/stalls",
  adminStallRouter,
);

app.use(
  "/api/reports",
  reportsRouter,
);

app.use(
  "/api/admin/collaborators",
  adminCollaboratorRouter,
);

app.use(
  "/api/admin/staff",
  adminStaffRouter,
);

app.use(errorHandler);