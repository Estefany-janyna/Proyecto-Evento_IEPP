import { Router } from "express";
import { z } from "zod";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../../config/db.js";
import { HttpError } from "../../utils/httpError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  requireAuth,
} from "../../middleware/auth.js";

export const mealsRouter = Router();
mealsRouter.use(
  requireAuth("STAFF"),
);

interface ParticipantRow
  extends RowDataPacket {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  estado: string;
}

interface AttendanceRow
  extends RowDataPacket {
  id: number;
  hora?: string;
}

interface ConsumptionRow
  extends RowDataPacket {
  tipo: "DESAYUNO" | "CENA";
  hora: string;
}

const deliverSchema = z.object({
  dni: z
    .string()
    .regex(
      /^\d{8}$/,
      "El DNI debe contener exactamente 8 dígitos.",
    ),

  tipo: z.enum([
    "DESAYUNO",
    "CENA",
  ]),
});

const dniSchema = z
  .string()
  .regex(
    /^\d{8}$/,
    "El DNI debe contener exactamente 8 dígitos.",
  );

/**
 * Buscar participante y validar:
 * - asistencia del día
 * - desayuno entregado
 * - cena entregada
 */
mealsRouter.get(
  "/search/:dni",
  asyncHandler(
    async (req, res) => {
      const dni = dniSchema.parse(
        String(
          req.params.dni ?? "",
        ),
      );

      const [participantRows] =
        await pool.query<
          ParticipantRow[]
        >(
          `
            SELECT
              id,
              dni,
              nombres,
              apellidos,
              estado
            FROM participantes
            WHERE dni = ?
            LIMIT 1
          `,
          [dni],
        );

      const participant =
        participantRows[0];

      if (!participant) {
        throw new HttpError(
          404,
          "Participante no registrado.",
        );
      }

      if (
        participant.estado ===
        "ANULADO"
      ) {
        throw new HttpError(
          403,
          "El registro del participante está anulado.",
        );
      }

      const [attendanceRows] =
        await pool.query<
          AttendanceRow[]
        >(
          `
            SELECT
              id,
              hora
            FROM asistencias
            WHERE participante_id = ?
              AND fecha = CURDATE()
              AND estado = 'ACTIVA'
            LIMIT 1
          `,
          [participant.id],
        );

      const attendance =
        attendanceRows[0] ??
        null;

      const [consumptionRows] =
        await pool.query<
          ConsumptionRow[]
        >(
          `
            SELECT
              tipo_alimento AS tipo,
              hora
            FROM consumos_participantes
            WHERE participante_id = ?
              AND fecha = CURDATE()
              AND estado = 'ENTREGADO'
            ORDER BY hora ASC
          `,
          [participant.id],
        );

      res.json({
        ok: true,

        data: {
          participant,

          hasAttendance:
            attendance !== null,

          attendance,

          consumptions:
            consumptionRows,

          hasBreakfast:
            consumptionRows.some(
              (consumption) =>
                consumption.tipo ===
                "DESAYUNO",
            ),

          hasDinner:
            consumptionRows.some(
              (consumption) =>
                consumption.tipo ===
                "CENA",
            ),
        },
      });
    },
  ),
);

/**
 * Registrar entrega de desayuno o cena.
 */
mealsRouter.post(
  "/deliver",
  asyncHandler(
    async (req, res) => {
      const data =
        deliverSchema.parse(
          req.body,
        );
        const personalId =
  req.session?.id;


if (!personalId) {
  throw new HttpError(
    401,
    "No se pudo identificar al personal operativo.",
  );
}


      const connection =
        await pool.getConnection();

      try {
        await connection.beginTransaction();

        const [participantRows] =
          await connection.query<
            ParticipantRow[]
          >(
            `
              SELECT
                id,
                dni,
                nombres,
                apellidos,
                estado
              FROM participantes
              WHERE dni = ?
              LIMIT 1
              FOR UPDATE
            `,
            [data.dni],
          );

        const participant =
          participantRows[0];

        if (!participant) {
          throw new HttpError(
            404,
            "Participante no registrado.",
          );
        }

        if (
          participant.estado ===
          "ANULADO"
        ) {
          throw new HttpError(
            403,
            "El registro del participante está anulado.",
          );
        }

        const [attendanceRows] =
          await connection.query<
            AttendanceRow[]
          >(
            `
              SELECT
                id,
                hora
              FROM asistencias
              WHERE participante_id = ?
                AND fecha = CURDATE()
                AND estado = 'ACTIVA'
              LIMIT 1
              FOR UPDATE
            `,
            [participant.id],
          );

        const attendance =
          attendanceRows[0];

        if (!attendance) {
          throw new HttpError(
            422,
            "El participante no tiene asistencia registrada hoy.",
          );
        }

        /**
         * Validación previa para devolver
         * un mensaje claro antes del INSERT.
         */
        const [existingRows] =
          await connection.query<
            RowDataPacket[]
          >(
            `
              SELECT id
              FROM consumos_participantes
              WHERE participante_id = ?
                AND fecha = CURDATE()
                AND tipo_alimento = ?
                AND estado = 'ENTREGADO'
              LIMIT 1
              FOR UPDATE
            `,
            [
              participant.id,
              data.tipo,
            ],
          );

        if (existingRows[0]) {
          throw new HttpError(
            409,

            data.tipo ===
            "DESAYUNO"
              ? "El participante ya recibió desayuno hoy."
              : "El participante ya recibió cena hoy.",
          );
        }

        const [result] =
  await connection.execute<
    ResultSetHeader
  >(
    `
      INSERT INTO consumos_participantes (
        participante_id,
        personal_id,
        asistencia_id,
        fecha,
        tipo_alimento,
        hora,
        estado
      )
      VALUES (
        ?,
        ?,
        ?,
        CURDATE(),
        ?,
        CURTIME(),
        'ENTREGADO'
      )
    `,
    [
      participant.id,
      personalId,
      attendance.id,
      data.tipo,
    ],
  );

        await connection.commit();

        /**
         * Emitir evento solo si Socket.IO
         * está configurado.
         */
        const io =
          req.app.get("io");

        if (
          io &&
          typeof io.emit ===
            "function"
        ) {
          io.emit(
            "meal:delivered",
            {
              participantId:
                participant.id,

              type:
                data.tipo,
            },
          );
        }

        res.status(201).json({
          ok: true,

          message:
            data.tipo ===
            "DESAYUNO"
              ? "Desayuno entregado correctamente."
              : "Cena entregada correctamente.",

          data: {
            id:
              result.insertId,

            participant,

            tipo:
              data.tipo,

            asistenciaId:
              attendance.id,
          },
        });
      } catch (error: unknown) {
        await connection.rollback();

        const mysqlError =
          error as {
            code?: string;
          };

        if (
          mysqlError.code ===
          "ER_DUP_ENTRY"
        ) {
          throw new HttpError(
            409,

            data.tipo ===
            "DESAYUNO"
              ? "El participante ya recibió desayuno hoy."
              : "El participante ya recibió cena hoy.",
          );
        }

        throw error;
      } finally {
        connection.release();
      }
    },
  ),
);