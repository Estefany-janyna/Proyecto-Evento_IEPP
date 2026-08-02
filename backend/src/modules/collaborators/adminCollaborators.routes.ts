import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../../config/db.js";
import { requireAuth } from "../../middleware/auth.js";
import { HttpError } from "../../utils/httpError.js";

export const adminCollaboratorRouter = Router();

type AsyncRoute = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const asyncHandler =
  (handler: AsyncRoute) =>
  (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    Promise.resolve(
      handler(req, res, next),
    ).catch(next);
  };

adminCollaboratorRouter.use(
  requireAuth("ADMIN"),
);

interface CollaboratorIdRow extends RowDataPacket {
  id: number;
}

interface CollaboratorRow extends RowDataPacket {
  id: number;
  nombres: string;
  apellidos: string;
  celular: string;
  passwordReferencia: string | null;
  estado: "ACTIVO" | "INACTIVO";
  ultimoAcceso: string | null;
  createdAt: string;
  updatedAt: string;
}

const collaboratorIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("El colaborador no es válido."),
});

const createCollaboratorSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(2, "Ingrese los nombres.")
    .max(150),

  apellidos: z
    .string()
    .trim()
    .min(2, "Ingrese los apellidos.")
    .max(200),

  celular: z
    .string()
    .regex(
      /^9\d{8}$/,
      "El celular debe tener 9 dígitos e iniciar con 9.",
    ),

  password: z
    .string()
    .min(
      6,
      "La contraseña debe tener al menos 6 caracteres.",
    )
    .max(100),
});

const updateCollaboratorSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(2, "Ingrese los nombres.")
    .max(150),

  apellidos: z
    .string()
    .trim()
    .min(2, "Ingrese los apellidos.")
    .max(200),

  celular: z
    .string()
    .regex(
      /^9\d{8}$/,
      "El celular debe tener 9 dígitos e iniciar con 9.",
    ),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(
      6,
      "La contraseña debe tener al menos 6 caracteres.",
    )
    .max(100),
});

const statusSchema = z.object({
  estado: z.enum([
    "ACTIVO",
    "INACTIVO",
  ]),
});

/**
 * Listar colaboradores.
 */
adminCollaboratorRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [rows] =
      await pool.query<CollaboratorRow[]>(
        `
          SELECT
            id,
            nombres,
            apellidos,
            celular,

            password_referencia
              AS passwordReferencia,

            estado,

            ultimo_acceso
              AS ultimoAcceso,

            created_at
              AS createdAt,

            updated_at
              AS updatedAt

          FROM colaboradores

          ORDER BY
            apellidos,
            nombres
        `,
      );

    res.json({
      ok: true,
      data: rows,
    });
  }),
);

/**
 * Crear colaborador y sus credenciales.
 */
adminCollaboratorRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data =
      createCollaboratorSchema.parse(
        req.body,
      );

    const [duplicateRows] =
      await pool.execute<CollaboratorIdRow[]>(
        `
          SELECT id
          FROM colaboradores
          WHERE celular = ?
          LIMIT 1
        `,
        [data.celular],
      );

    if (duplicateRows[0]) {
      throw new HttpError(
        409,
        "Ya existe un colaborador registrado con ese celular.",
      );
    }

    const passwordHash =
      await bcrypt.hash(
        data.password,
        12,
      );

    const nombres = data.nombres
      .trim()
      .toUpperCase();

    const apellidos = data.apellidos
      .trim()
      .toUpperCase();

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          INSERT INTO colaboradores (
            nombres,
            apellidos,
            celular,
            password_hash,
            password_referencia,
            estado,
            ultimo_acceso,
            created_at,
            updated_at
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            'ACTIVO',
            NULL,
            NOW(),
            NOW()
          )
        `,
        [
          nombres,
          apellidos,
          data.celular,
          passwordHash,
          data.password,
        ],
      );

    res.status(201).json({
      ok: true,
      message:
        "Colaborador y credenciales creados correctamente.",

      data: {
        id: result.insertId,
        nombres,
        apellidos,
        celular: data.celular,
        password:
          data.password,
      },
    });
  }),
);

/**
 * Actualizar datos del colaborador.
 */
adminCollaboratorRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const {
      id,
    } = collaboratorIdSchema.parse(
      req.params,
    );

    const data =
      updateCollaboratorSchema.parse(
        req.body,
      );

    const [duplicateRows] =
      await pool.execute<CollaboratorIdRow[]>(
        `
          SELECT id
          FROM colaboradores
          WHERE celular = ?
            AND id <> ?
          LIMIT 1
        `,
        [
          data.celular,
          id,
        ],
      );

    if (duplicateRows[0]) {
      throw new HttpError(
        409,
        "El celular ya pertenece a otro colaborador.",
      );
    }

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          UPDATE colaboradores
          SET
            nombres = ?,
            apellidos = ?,
            celular = ?,
            updated_at = NOW()
          WHERE id = ?
        `,
        [
          data.nombres
            .trim()
            .toUpperCase(),

          data.apellidos
            .trim()
            .toUpperCase(),

          data.celular,
          id,
        ],
      );

    if (
      result.affectedRows === 0
    ) {
      throw new HttpError(
        404,
        "El colaborador no existe.",
      );
    }

    res.json({
      ok: true,
      message:
        "Colaborador actualizado correctamente.",
    });
  }),
);

/**
 * Restablecer contraseña.
 */
adminCollaboratorRouter.patch(
  "/:id/password",
  asyncHandler(async (req, res) => {
    const {
      id,
    } = collaboratorIdSchema.parse(
      req.params,
    );

    const {
      password,
    } = passwordSchema.parse(
      req.body,
    );

    const passwordHash =
      await bcrypt.hash(
        password,
        12,
      );

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          UPDATE colaboradores
          SET
            password_hash = ?,
            password_referencia = ?,
            updated_at = NOW()
          WHERE id = ?
        `,
        [
          passwordHash,
          password,
          id,
        ],
      );

    if (
      result.affectedRows === 0
    ) {
      throw new HttpError(
        404,
        "El colaborador no existe.",
      );
    }

    res.json({
      ok: true,
      message:
        "Contraseña actualizada correctamente.",

      data: {
        password,
      },
    });
  }),
);

/**
 * Activar o desactivar colaborador.
 */
adminCollaboratorRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const {
      id,
    } = collaboratorIdSchema.parse(
      req.params,
    );

    const {
      estado,
    } = statusSchema.parse(
      req.body,
    );

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          UPDATE colaboradores
          SET
            estado = ?,
            updated_at = NOW()
          WHERE id = ?
        `,
        [
          estado,
          id,
        ],
      );

    if (
      result.affectedRows === 0
    ) {
      throw new HttpError(
        404,
        "El colaborador no existe.",
      );
    }

    res.json({
      ok: true,

      message:
        estado === "ACTIVO"
          ? "Colaborador activado correctamente."
          : "Colaborador desactivado correctamente.",
    });
  }),
);