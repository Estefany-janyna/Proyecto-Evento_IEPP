import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";

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

export const stallRouter = Router();
export const adminStallRouter = Router();

/**
 * Evita que los errores de rutas async
 * cierren el servidor Express.
 */
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

/* =========================================================
   RUTAS DEL PUESTO
   ========================================================= */

stallRouter.use(requireAuth("STALL"));

stallRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            id,
            numero_puesto AS numeroPuesto,
            encargado,
            celular,
            platos_asignados AS platosAsignados,
            platos_entregados AS platosEntregados,
            platos_disponibles AS platosDisponibles,
            estado
          FROM puestos_comida
          WHERE id = ?
          LIMIT 1
        `,
        [req.session!.id],
      );

    const stall = rows[0];

    if (!stall) {
      throw new HttpError(
        404,
        "El puesto no existe.",
      );
    }

    res.json({
      ok: true,
      data: stall,
    });
  }),
);

stallRouter.get(
  "/history",
  asyncHandler(async (req, res) => {
    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            c.id,
            cc.codigo,

            CONCAT(
              co.nombres,
              ' ',
              co.apellidos
            ) AS colaborador,

            c.fecha,
            c.hora,

            c.saldo_posterior
              AS saldoPosterior,

            c.estado

          FROM canjes_colaborador AS c

          INNER JOIN codigos_colaborador AS cc
            ON cc.id =
              c.codigo_colaborador_id

          INNER JOIN colaboradores AS co
            ON co.id =
              c.colaborador_id

          WHERE c.puesto_id = ?

          ORDER BY c.id DESC

          LIMIT 100
        `,
        [req.session!.id],
      );

    res.json({
      ok: true,
      data: rows,
    });
  }),
);

stallRouter.get(
  "/validate/:code",
  asyncHandler(async (req, res) => {
    const code = z
      .string()
      .regex(
        /^[A-Z][0-9]{5}$/,
        "El código debe contener una letra y cinco números.",
      )
      .parse(
        String(req.params.code).toUpperCase(),
      );

    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            cc.id,
            cc.codigo,
            cc.estado,
            cc.fecha,

            co.id AS colaboradorId,
            co.nombres,
            co.apellidos,

            co.estado AS colaboradorEstado

          FROM codigos_colaborador AS cc

          INNER JOIN colaboradores AS co
            ON co.id =
              cc.colaborador_id

          WHERE cc.codigo = ?

          LIMIT 1
        `,
        [code],
      );

    const result = rows[0];

    if (!result) {
      throw new HttpError(
        404,
        "Código inexistente.",
      );
    }

    res.json({
      ok: true,
      data: result,
    });
  }),
);

stallRouter.post(
  "/redeem",
  asyncHandler(async (req, res) => {
    const {
      codigo,
    } = z
      .object({
        codigo: z
          .string()
          .regex(
            /^[A-Z][0-9]{5}$/,
            "El código no tiene el formato correcto.",
          ),
      })
      .parse({
        codigo: String(
          req.body.codigo || "",
        ).toUpperCase(),
      });

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [codeRows] =
        await connection.query<RowDataPacket[]>(
          `
            SELECT
              cc.id,
              cc.colaborador_id,
              cc.estado,
              cc.fecha,
              cc.fecha = CURDATE() AS esDeHoy,
              co.nombres,
              co.apellidos,

              co.estado
                AS colaboradorEstado

            FROM codigos_colaborador AS cc

            INNER JOIN colaboradores AS co
              ON co.id =
                cc.colaborador_id

            WHERE cc.codigo = ?

            FOR UPDATE
          `,
          [codigo],
        );

      const code = codeRows[0];

      if (!code) {
        throw new HttpError(
          404,
          "Código inexistente.",
        );
      }

    if (code.estado !== "DISPONIBLE") {
  throw new HttpError(
    409,
    "El código ya fue utilizado o no está disponible.",
  );
}

if (Number(code.esDeHoy) !== 1) {
  throw new HttpError(
    409,
    "El código está vencido. Genere un código nuevo para el día de hoy.",
  );
}


      if (
        code.colaboradorEstado !==
        "ACTIVO"
      ) {
        throw new HttpError(
          403,
          "El colaborador está inactivo.",
        );
      }

      const [stallRows] =
        await connection.query<RowDataPacket[]>(
          `
            SELECT
              platos_disponibles,
              estado
            FROM puestos_comida
            WHERE id = ?
            FOR UPDATE
          `,
          [req.session!.id],
        );

      const stall = stallRows[0];

      if (!stall) {
        throw new HttpError(
          404,
          "El puesto no existe.",
        );
      }

      if (
        stall.estado === "INACTIVO" ||
        Number(
          stall.platos_disponibles,
        ) <= 0
      ) {
        throw new HttpError(
          409,
          "El puesto no tiene platos disponibles.",
        );
      }

      const before = Number(
        stall.platos_disponibles,
      );

      const after = before - 1;

      const [redeemResult] =
        await connection.execute<ResultSetHeader>(
          `
            INSERT INTO canjes_colaborador (
              codigo_colaborador_id,
              colaborador_id,
              puesto_id,
              fecha,
              hora,
              saldo_anterior,
              saldo_posterior
            )
            VALUES (
              ?,
              ?,
              ?,
              CURDATE(),
              CURTIME(),
              ?,
              ?
            )
          `,
          [
            code.id,
            code.colaborador_id,
            req.session!.id,
            before,
            after,
          ],
        );

      await connection.execute(
        `
          UPDATE codigos_colaborador
          SET
            estado = 'UTILIZADO',
            fecha_hora_uso = NOW()
          WHERE id = ?
        `,
        [code.id],
      );

      await connection.execute(
        `
          UPDATE puestos_comida
          SET
            platos_entregados =
              platos_entregados + 1,

            platos_disponibles = ?,

            estado =
              IF(
                ? = 0,
                'SIN_DISPONIBILIDAD',
                'ACTIVO'
              )

          WHERE id = ?
        `,
        [
          after,
          after,
          req.session!.id,
        ],
      );

      await connection.execute(
        `
          INSERT INTO movimientos_puesto (
            puesto_id,
            tipo,
            cantidad,
            saldo_anterior,
            saldo_posterior,
            canje_id
          )
          VALUES (
            ?,
            'CANJE',
            -1,
            ?,
            ?,
            ?
          )
        `,
        [
          req.session!.id,
          before,
          after,
          redeemResult.insertId,
        ],
      );

      await connection.commit();

      const io = req.app.get("io");

      if (io) {
        io.emit(
          "code:redeemed",
          {
            stallId:
              req.session!.id,

            availablePlates:
              after,
          },
        );
      }

      res.status(201).json({
        ok: true,
        message:
          "Canje registrado correctamente.",

        data: {
          colaborador:
            `${code.nombres} ${code.apellidos}`,

          saldo: after,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

/* =========================================================
   RUTAS ADMINISTRATIVAS PARA GESTIÓN DE PUESTOS
   ========================================================= */

adminStallRouter.use(
  requireAuth("ADMIN"),
);

interface StallIdRow
  extends RowDataPacket {
  id: number;
}

interface StallAdminRow
  extends RowDataPacket {
  id: number;
  numeroPuesto: string;
  encargado: string;
  celular: string;
  passwordReferencia:
    string | null;
  platosAsignados: number;
  platosEntregados: number;
  platosDisponibles: number;
  estado: string;
  ultimoAcceso: string | null;
  createdAt: string;
  updatedAt: string;
}

const createStallSchema = z.object({
  numeroPuesto: z
    .string()
    .trim()
    .min(
      1,
      "Ingrese el número del puesto.",
    )
    .max(20),

  encargado: z
    .string()
    .trim()
    .min(
      2,
      "Ingrese el nombre del encargado.",
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

  platosAsignados: z.coerce
    .number()
    .int()
    .min(
      0,
      "La cantidad no puede ser negativa.",
    )
    .default(2),
});

const updateStallSchema = z.object({
  encargado: z
    .string()
    .trim()
    .min(2)
    .max(200),

  celular: z
    .string()
    .regex(
      /^9\d{8}$/,
      "El celular debe tener 9 dígitos e iniciar con 9.",
    ),

  platosAsignados: z.coerce
    .number()
    .int()
    .min(0),
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

const stallIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive(),
});

/**
 * Listar puestos.
 */
adminStallRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [rows] =
      await pool.query<StallAdminRow[]>(
        `
          SELECT
            id,

            numero_puesto
              AS numeroPuesto,

            encargado,
            celular,

            password_referencia
              AS passwordReferencia,

            platos_asignados
              AS platosAsignados,

            platos_entregados
              AS platosEntregados,

            platos_disponibles
              AS platosDisponibles,

            estado,

            ultimo_acceso
              AS ultimoAcceso,

            created_at
              AS createdAt,

            updated_at
              AS updatedAt

          FROM puestos_comida

          ORDER BY
            CAST(numero_puesto AS UNSIGNED),
            numero_puesto
        `,
      );

    res.json({
      ok: true,
      data: rows,
    });
  }),
);

/**
 * Crear puesto y credenciales.
 */
adminStallRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data =
      createStallSchema.parse(
        req.body,
      );

    const [duplicateRows] =
      await pool.execute<StallIdRow[]>(
        `
          SELECT id
          FROM puestos_comida
          WHERE numero_puesto = ?
          LIMIT 1
        `,
        [data.numeroPuesto],
      );

    if (duplicateRows[0]) {
      throw new HttpError(
        409,
        "Ya existe un puesto con ese número.",
      );
    }

    const passwordHash =
      await bcrypt.hash(
        data.password,
        12,
      );

    const initialState =
      data.platosAsignados > 0
        ? "ACTIVO"
        : "SIN_DISPONIBILIDAD";

    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          INSERT INTO puestos_comida (
            numero_puesto,
            encargado,
            celular,
            password_hash,
            password_referencia,
            platos_asignados,
            platos_entregados,
            platos_disponibles,
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
            ?,
            0,
            ?,
            ?,
            NULL,
            NOW(),
            NOW()
          )
        `,
        [
          data.numeroPuesto,
          data.encargado
            .trim()
            .toUpperCase(),

          data.celular,
          passwordHash,

          /*
           * Se conserva para que el administrador
           * pueda consultar la credencial.
           */
          data.password,

          data.platosAsignados,
          data.platosAsignados,
          initialState,
        ],
      );

    res.status(201).json({
      ok: true,
      message:
        "Puesto creado correctamente.",

      data: {
        id: result.insertId,
        numeroPuesto:
          data.numeroPuesto,

        encargado:
          data.encargado
            .trim()
            .toUpperCase(),

        password:
          data.password,
      },
    });
  }),
);

/**
 * Modificar datos y cantidad asignada.
 *
 * Los platos disponibles se recalculan:
 * asignados - entregados.
 */
adminStallRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const {
      id,
    } = stallIdSchema.parse(
      req.params,
    );

    const data =
      updateStallSchema.parse(
        req.body,
      );

    const [rows] =
      await pool.execute<RowDataPacket[]>(
        `
          SELECT
            id,
            platos_entregados
          FROM puestos_comida
          WHERE id = ?
          LIMIT 1
        `,
        [id],
      );

    const stall = rows[0];

    if (!stall) {
      throw new HttpError(
        404,
        "El puesto no existe.",
      );
    }

    const delivered = Number(
      stall.platos_entregados,
    );

    if (
      data.platosAsignados <
      delivered
    ) {
      throw new HttpError(
        422,
        `No puede asignar menos de ${delivered} platos porque ya fueron entregados.`,
      );
    }

    const available =
      data.platosAsignados -
      delivered;

    await pool.execute(
      `
        UPDATE puestos_comida
        SET
          encargado = ?,
          celular = ?,
          platos_asignados = ?,
          platos_disponibles = ?,

          estado =
            CASE
              WHEN estado = 'INACTIVO'
                THEN 'INACTIVO'

              WHEN ? = 0
                THEN 'SIN_DISPONIBILIDAD'

              ELSE 'ACTIVO'
            END,

          updated_at = NOW()

        WHERE id = ?
      `,
      [
        data.encargado
          .trim()
          .toUpperCase(),

        data.celular,
        data.platosAsignados,
        available,
        available,
        id,
      ],
    );

    res.json({
      ok: true,
      message:
        "Puesto actualizado correctamente.",
    });
  }),
);

/**
 * Restablecer contraseña.
 */
adminStallRouter.patch(
  "/:id/password",
  asyncHandler(async (req, res) => {
    const {
      id,
    } = stallIdSchema.parse(
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
          UPDATE puestos_comida
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
        "El puesto no existe.",
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
 * Activar o desactivar.
 */
adminStallRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const {
      id,
    } = stallIdSchema.parse(
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
          UPDATE puestos_comida
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
        "El puesto no existe.",
      );
    }

    res.json({
      ok: true,
      message:
        estado === "ACTIVO"
          ? "Puesto activado correctamente."
          : "Puesto desactivado correctamente.",
    });
  }),
);