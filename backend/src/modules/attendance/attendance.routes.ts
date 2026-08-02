import { Router } from "express";
import { z } from "zod";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../../config/db.js";

import {
  requireAuth,
} from "../../middleware/auth.js";


import { HttpError } from "../../utils/httpError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const attendanceRouter =
  Router();

/**
 * Solamente el personal operativo
 * con función ASISTENCIA puede usar
 * este módulo.
 */
attendanceRouter.use(
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
  fecha: string;
  hora: string;
  estado: string;
}

const dniSchema = z
  .string()
  .regex(
    /^\d{8}$/,
    "El DNI debe contener exactamente 8 dígitos.",
  );

const attendanceSchema =
  z.object({
    dni: dniSchema,
  });

/**
 * Obtener participante por DNI.
 *
 * Esta función siempre devuelve un
 * participante válido o lanza un error.
 */
async function getParticipant(
  dni: string,
): Promise<ParticipantRow> {
  const [rows] =
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
    rows[0];

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

  return participant;
}

/**
 * Buscar participante y asistencia
 * correspondiente al día actual.
 */
attendanceRouter.get(
  "/search/:dni",
  asyncHandler(
    async (req, res) => {
      const dni =
        dniSchema.parse(
          String(
            req.params.dni ??
              "",
          ),
        );

      const participant =
        await getParticipant(
          dni,
        );

      const [attendanceRows] =
        await pool.query<
          AttendanceRow[]
        >(
          `
            SELECT
              id,
              fecha,
              hora,
              estado
            FROM asistencias
            WHERE participante_id = ?
              AND fecha = CURDATE()
            LIMIT 1
          `,
          [
            participant.id,
          ],
        );

      const attendance =
        attendanceRows[0] ??
        null;

      res.json({
        ok: true,

        data: {
          participant,
          attendance,
        },
      });
    },
  ),
);

/**
 * Registrar asistencia del día.
 */
attendanceRouter.post(
  "/",
  asyncHandler(
    async (req, res) => {
      const {
        dni,
      } =
        attendanceSchema.parse(
          req.body,
        );

      const participant =
        await getParticipant(
          dni,
        );

      const personalId =
        req.session?.id;

      if (!personalId) {
        throw new HttpError(
          401,
          "No se pudo identificar al personal operativo.",
        );
      }

      try {
        const [result] =
          await pool.execute<
            ResultSetHeader
          >(
            `
              INSERT INTO asistencias (
                participante_id,
                personal_id,
                fecha,
                hora,
                estado
              )
              VALUES (
                ?,
                ?,
                CURDATE(),
                CURTIME(),
                'ACTIVA'
              )
            `,
            [
              participant.id,
              personalId,
            ],
          );

        await pool.execute<
          ResultSetHeader
        >(
          `
            UPDATE participantes
            SET
              estado = 'ASISTIO',
              updated_at = NOW()
            WHERE id = ?
          `,
          [
            participant.id,
          ],
        );

        const io =
          req.app.get("io");

        if (
          io &&
          typeof io.emit ===
            "function"
        ) {
          io.emit(
            "attendance:created",
            {
              participantId:
                participant.id,

              dni:
                participant.dni,

              nombres:
                participant.nombres,

              apellidos:
                participant.apellidos,
            },
          );
        }

        res.status(201).json({
          ok: true,

          message:
            "Asistencia registrada correctamente.",

          data: {
            id:
              result.insertId,

            participant,
          },
        });
      } catch (
        error: unknown
      ) {
        const mysqlError =
          error as {
            code?: string;
          };

        if (
          mysqlError.code ===
          "ER_DUP_ENTRY"
        ) {
          const [attendanceRows] =
            await pool.query<
              AttendanceRow[]
            >(
              `
                SELECT
                  id,
                  fecha,
                  hora,
                  estado
                FROM asistencias
                WHERE participante_id = ?
                  AND fecha = CURDATE()
                LIMIT 1
              `,
              [
                participant.id,
              ],
            );

          const previousAttendance =
            attendanceRows[0];

          throw new HttpError(
            409,

            previousAttendance
              ? `El participante ya registró asistencia hoy a las ${previousAttendance.hora}.`
              : "El participante ya registró asistencia hoy.",
          );
        }

        throw error;
      }
    },
  ),
);