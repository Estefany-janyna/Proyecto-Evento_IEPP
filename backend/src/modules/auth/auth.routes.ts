import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  RowDataPacket,
  ResultSetHeader,
} from "mysql2";

import { pool } from "../../config/db.js";
import { HttpError } from "../../utils/httpError.js";
import { signSession } from "../../middleware/auth.js";

interface StaffLoginRow
  extends RowDataPacket {
  id: number;
  nombres: string;
  apellidos: string;
  celular: string;
  password_hash: string;

  funcion:
    | "ASISTENCIA"
    | "DESAYUNO"
    | "CENA";

  estado:
    | "ACTIVO"
    | "INACTIVO";
}

export const authRouter = Router();

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
const staffLoginSchema = z.object({
  celular: z
    .string()
    .regex(
      /^9\d{8}$/,
      "El celular debe contener 9 dígitos e iniciar con 9.",
    ),

  password: z
    .string()
    .min(
      1,
      "Ingrese la contraseña.",
    ),
});

authRouter.post(
  "/admin",
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        usuario: z
          .string()
          .trim()
          .min(1),

        password: z
          .string()
          .min(1),
      })
      .parse(req.body);

    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            id,
            usuario,
            password_hash,
            perfil,
            estado
          FROM usuarios
          WHERE usuario = ?
          LIMIT 1
        `,
        [
          data.usuario
            .trim()
            .toUpperCase(),
        ],
      );

    const admin = rows[0];

    if (
      !admin ||
      admin.estado !== "ACTIVO"
    ) {
      throw new HttpError(
        401,
        "Credenciales incorrectas.",
      );
    }

    const valid =
      await bcrypt.compare(
        data.password,
        admin.password_hash,
      );

    if (!valid) {
      throw new HttpError(
        401,
        "Credenciales incorrectas.",
      );
    }

    await pool.execute(
      `
        UPDATE usuarios
        SET ultimo_acceso = NOW()
        WHERE id = ?
      `,
      [admin.id],
    );

    res.json({
      ok: true,
      data: {
        token: signSession({
          id: admin.id,
          kind: "ADMIN",
          profile: admin.perfil,
        }),

        user: {
          id: admin.id,
          name: admin.usuario,
          profile: admin.perfil,
        },
      },
    });
  }),
);

authRouter.post(
  "/collaborator",
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        celular: z
          .string()
          .regex(/^9\d{8}$/),

        password: z
          .string()
          .min(1),
      })
      .parse(req.body);

    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            id,
            nombres,
            apellidos,
            password_hash,
            estado
          FROM colaboradores
          WHERE celular = ?
          LIMIT 1
        `,
        [data.celular],
      );

    const collaborator =
      rows[0];

    if (
      !collaborator ||
      collaborator.estado !==
        "ACTIVO"
    ) {
      throw new HttpError(
        401,
        "Credenciales incorrectas.",
      );
    }

    const valid =
      await bcrypt.compare(
        data.password,
        collaborator.password_hash,
      );

    if (!valid) {
      throw new HttpError(
        401,
        "Credenciales incorrectas.",
      );
    }

    await pool.execute(
      `
        UPDATE colaboradores
        SET ultimo_acceso = NOW()
        WHERE id = ?
      `,
      [collaborator.id],
    );

    res.json({
      ok: true,
      data: {
        token: signSession({
          id: collaborator.id,
          kind: "COLLABORATOR",
        }),

        user: {
          id: collaborator.id,

          name:
            `${collaborator.nombres} ${collaborator.apellidos}`,
        },
      },
    });
  }),
);

authRouter.post(
  "/stall",
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        numeroPuesto: z
          .string()
          .trim()
          .min(
            1,
            "Ingrese el número de puesto.",
          ),

        password: z
          .string()
          .min(
            1,
            "Ingrese la contraseña.",
          ),
      })
      .parse(req.body);

    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            id,
            numero_puesto,
            encargado,
            password_hash,
            estado
          FROM puestos_comida
          WHERE numero_puesto = ?
          LIMIT 1
        `,
        [
          data.numeroPuesto.trim(),
        ],
      );

    const stall = rows[0];

    if (!stall) {
      throw new HttpError(
        401,
        "Credenciales incorrectas.",
      );
    }

    if (
      stall.estado === "INACTIVO"
    ) {
      throw new HttpError(
        403,
        "El puesto está inactivo.",
      );
    }

    if (
      !stall.password_hash
    ) {
      throw new HttpError(
        401,
        "El puesto no tiene una contraseña configurada.",
      );
    }

    const valid =
      await bcrypt.compare(
        data.password,
        stall.password_hash,
      );

    if (!valid) {
      throw new HttpError(
        401,
        "Credenciales incorrectas.",
      );
    }

    await pool.execute(
      `
        UPDATE puestos_comida
        SET ultimo_acceso = NOW()
        WHERE id = ?
      `,
      [stall.id],
    );

    res.json({
      ok: true,
      data: {
        token: signSession({
          id: stall.id,
          kind: "STALL",
        }),

        user: {
          id: stall.id,
          name: stall.encargado,
          stall:
            stall.numero_puesto,
        },
      },
    });
  }),
);

authRouter.post(
  "/staff",
  asyncHandler(
    async (req, res) => {
      const data =
        staffLoginSchema.parse(
          req.body,
        );

      const [rows] =
        await pool.query<
          StaffLoginRow[]
        >(
          `
            SELECT
              id,
              nombres,
              apellidos,
              celular,
              password_hash,
              funcion,
              estado

            FROM personal_operativo

            WHERE celular = ?

            LIMIT 1
          `,
          [data.celular],
        );

      const staff =
        rows[0];

      if (!staff) {
        throw new HttpError(
          401,
          "Celular o contraseña incorrectos.",
        );
      }

      if (
        staff.estado !==
        "ACTIVO"
      ) {
        throw new HttpError(
          403,
          "El acceso del personal está inactivo.",
        );
      }

      const passwordOk =
        await bcrypt.compare(
          data.password,
          staff.password_hash,
        );

      if (!passwordOk) {
        throw new HttpError(
          401,
          "Celular o contraseña incorrectos.",
        );
      }

      await pool.execute<
        ResultSetHeader
      >(
        `
          UPDATE personal_operativo
          SET ultimo_acceso = NOW()
          WHERE id = ?
        `,
        [staff.id],
      );

      const token =
        signSession({
          id: staff.id,
          kind: "STAFF",
          role: staff.funcion,
        });

      res.json({
        ok: true,

        message:
          "Inicio de sesión correcto.",

        data: {
          token,

          user: {
            id: staff.id,

            name:
              `${staff.nombres} ${staff.apellidos}`,

            celular:
              staff.celular,

            kind:
              "STAFF",

            role:
              staff.funcion,
          },
        },
      });
    },
  ),
);