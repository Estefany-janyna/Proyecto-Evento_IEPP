import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../../config/db.js";

import {
  requireAuth,
} from "../../middleware/auth.js";

import {
  asyncHandler,
} from "../../utils/asyncHandler.js";

import {
  HttpError,
} from "../../utils/httpError.js";

export const adminStaffRouter =
  Router();

adminStaffRouter.use(
  requireAuth("ADMIN"),
);

interface IdRow
  extends RowDataPacket {
  id: number;
}

interface StaffRow
  extends RowDataPacket {
  id: number;
  nombres: string;
  apellidos: string;
  celular: string;

  passwordReferencia:
    | string
    | null;

  funcion:
    | "ASISTENCIA"
    | "DESAYUNO"
    | "CENA";

  estado:
    | "ACTIVO"
    | "INACTIVO";

  ultimoAcceso:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
}

const idSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive(),
});

const createSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(
      2,
      "Ingrese los nombres.",
    )
    .max(150),

  apellidos: z
    .string()
    .trim()
    .min(
      2,
      "Ingrese los apellidos.",
    )
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

  funcion: z.enum([
    "ASISTENCIA",
    "DESAYUNO",
    "CENA",
  ]),
});

const updateSchema =
  createSchema.omit({
    password: true,
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
 * Listar personal operativo.
 */
adminStaffRouter.get(
  "/",
  asyncHandler(
    async (_req, res) => {
      const [rows] =
        await pool.query<
          StaffRow[]
        >(
          `
            SELECT
              id,
              nombres,
              apellidos,
              celular,

              password_referencia
                AS passwordReferencia,

              funcion,
              estado,

              ultimo_acceso
                AS ultimoAcceso,

              created_at
                AS createdAt,

              updated_at
                AS updatedAt

            FROM personal_operativo

            ORDER BY
              apellidos ASC,
              nombres ASC
          `,
        );

      res.json({
        ok: true,
        data: rows,
      });
    },
  ),
);

/**
 * Crear personal operativo.
 */
adminStaffRouter.post(
  "/",
  asyncHandler(
    async (req, res) => {
      const data =
        createSchema.parse(
          req.body,
        );

      const [existingRows] =
        await pool.query<
          IdRow[]
        >(
          `
            SELECT id
            FROM personal_operativo
            WHERE celular = ?
            LIMIT 1
          `,
          [
            data.celular,
          ],
        );

      if (
        existingRows[0]
      ) {
        throw new HttpError(
          409,
          "Ya existe personal registrado con ese celular.",
        );
      }

      const passwordHash =
        await bcrypt.hash(
          data.password,
          12,
        );

      const [result] =
        await pool.execute<
          ResultSetHeader
        >(
          `
            INSERT INTO personal_operativo (
              nombres,
              apellidos,
              celular,
              password_hash,
              password_referencia,
              funcion,
              estado
            )
            VALUES (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              'ACTIVO'
            )
          `,
          [
            data.nombres
              .trim()
              .toUpperCase(),

            data.apellidos
              .trim()
              .toUpperCase(),

            data.celular,
            passwordHash,
            data.password,
            data.funcion,
          ],
        );

      res.status(201).json({
        ok: true,

        message:
          "Personal operativo creado correctamente.",

        data: {
          id:
            result.insertId,
        },
      });
    },
  ),
);

/**
 * Actualizar personal operativo.
 */
adminStaffRouter.put(
  "/:id",
  asyncHandler(
    async (req, res) => {
      const {
        id,
      } =
        idSchema.parse(
          req.params,
        );

      const data =
        updateSchema.parse(
          req.body,
        );

      const [duplicateRows] =
        await pool.query<
          IdRow[]
        >(
          `
            SELECT id
            FROM personal_operativo
            WHERE celular = ?
              AND id <> ?
            LIMIT 1
          `,
          [
            data.celular,
            id,
          ],
        );

      if (
        duplicateRows[0]
      ) {
        throw new HttpError(
          409,
          "El celular pertenece a otro usuario.",
        );
      }

      const [result] =
        await pool.execute<
          ResultSetHeader
        >(
          `
            UPDATE personal_operativo
            SET
              nombres = ?,
              apellidos = ?,
              celular = ?,
              funcion = ?,
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
            data.funcion,
            id,
          ],
        );

      if (
        result.affectedRows ===
        0
      ) {
        throw new HttpError(
          404,
          "El personal operativo no existe.",
        );
      }

      res.json({
        ok: true,

        message:
          "Personal operativo actualizado correctamente.",
      });
    },
  ),
);

/**
 * Cambiar contraseña.
 */
adminStaffRouter.patch(
  "/:id/password",
  asyncHandler(
    async (req, res) => {
      const {
        id,
      } =
        idSchema.parse(
          req.params,
        );

      const data =
        passwordSchema.parse(
          req.body,
        );

      const passwordHash =
        await bcrypt.hash(
          data.password,
          12,
        );

      const [result] =
        await pool.execute<
          ResultSetHeader
        >(
          `
            UPDATE personal_operativo
            SET
              password_hash = ?,
              password_referencia = ?,
              updated_at = NOW()
            WHERE id = ?
          `,
          [
            passwordHash,
            data.password,
            id,
          ],
        );

      if (
        result.affectedRows ===
        0
      ) {
        throw new HttpError(
          404,
          "El personal operativo no existe.",
        );
      }

      res.json({
        ok: true,

        message:
          "Contraseña actualizada correctamente.",
      });
    },
  ),
);

/**
 * Activar o desactivar.
 */
adminStaffRouter.patch(
  "/:id/status",
  asyncHandler(
    async (req, res) => {
      const {
        id,
      } =
        idSchema.parse(
          req.params,
        );

      const data =
        statusSchema.parse(
          req.body,
        );

      const [result] =
        await pool.execute<
          ResultSetHeader
        >(
          `
            UPDATE personal_operativo
            SET
              estado = ?,
              updated_at = NOW()
            WHERE id = ?
          `,
          [
            data.estado,
            id,
          ],
        );

      if (
        result.affectedRows ===
        0
      ) {
        throw new HttpError(
          404,
          "El personal operativo no existe.",
        );
      }

      res.json({
        ok: true,

        message:
          "Estado actualizado correctamente.",
      });
    },
  ),
);