import { Router } from "express";
import { z } from "zod";
import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../../config/db.js";
import { lookupDni } from "../../services/dni.service.js";
import { HttpError } from "../../utils/httpError.js";

export const publicRouter = Router();

/**
 * Tipos internos de consultas
 */
interface RegionRow extends RowDataPacket {
  id: number;
  nombre: string;
  estado: "ACTIVO" | "INACTIVO";
}

interface EcclesiasticalRegionRow extends RowDataPacket {
  id: number;
  region_id: number;
  codigo: string | null;
  nombre: string;
  es_otros: number;
}

interface PositionRow extends RowDataPacket {
  id: number;
  nombre: string;
  es_otro: number;
}

interface ParticipantIdRow extends RowDataPacket {
  id: number;
}

interface SelectedRegionRow extends RowDataPacket {
  id: number;
  nombre: string;
}

interface SelectedPositionRow extends RowDataPacket {
  id: number;
  nombre: string;
  es_otro: number;
}

/**
 * Catálogos principales
 *
 * Primer selector:
 * regiones
 *
 * Cargo:
 * cargos
 */
publicRouter.get("/catalogs", async (_req, res) => {
  const [regionRows] = await pool.query<RegionRow[]>(
    `
      SELECT
        id,
        nombre,
        estado
      FROM regiones
      WHERE estado = 'ACTIVO'
      ORDER BY
        CASE
          WHEN UPPER(TRIM(nombre)) = 'OTROS' THEN 1
          ELSE 0
        END,
        nombre
    `,
  );

  const [positionRows] =
    await pool.query<PositionRow[]>(
      `
        SELECT
          id,
          nombre,
          es_otro
        FROM cargos
        WHERE estado = 'ACTIVO'
        ORDER BY
          CASE
            WHEN es_otro = 1 THEN 1
            ELSE 0
          END,
          nombre
      `,
    );

  const regiones = regionRows.map((region) => ({
    id: Number(region.id),
    nombre: region.nombre,
    esOtros:
      region.nombre.trim().toUpperCase() === "OTROS",
  }));

  const cargos = positionRows.map((position) => ({
    id: Number(position.id),
    nombre: position.nombre,
    esOtro: Number(position.es_otro) === 1,
  }));

  res.status(200).json({
    ok: true,
    data: {
      /**
       * Nombres recomendados para el frontend actual.
       */
      regiones,
      cargos,

      /**
       * Se conservan estas propiedades para compatibilidad
       * con versiones anteriores del frontend.
       */
      regions: regiones,
      positions: cargos,
    },
  });
});

/**
 * Regiones eclesiásticas por región principal.
 *
 * Se conserva "/churches" para no romper el frontend actual.
 *
 * Ejemplo:
 * GET /api/public/regions/3/churches
 *
 * Devuelve las regiones eclesiásticas de APURIMAC.
 */
publicRouter.get(
  "/regions/:id/churches",
  async (req, res) => {
    const regionId = z.coerce
      .number()
      .int()
      .positive("La región no es válida.")
      .parse(req.params.id);

    const [regionRows] =
      await pool.query<RegionRow[]>(
        `
          SELECT
            id,
            nombre,
            estado
          FROM regiones
          WHERE id = ?
            AND estado = 'ACTIVO'
          LIMIT 1
        `,
        [regionId],
      );

    if (regionRows.length === 0) {
      throw new HttpError(
        404,
        "La región seleccionada no existe.",
      );
    }

    const [rows] =
      await pool.query<EcclesiasticalRegionRow[]>(
        `
          SELECT
            id,
            region_id,
            codigo,
            nombre,
            es_otros
          FROM regiones_eclesiales
          WHERE region_id = ?
            AND estado = 'ACTIVO'
          ORDER BY
            CASE
              WHEN es_otros = 1 THEN 1
              ELSE 0
            END,
            id
        `,
        [regionId],
      );

    const data = rows.map((row) => ({
      id: Number(row.id),
      regionId: Number(row.region_id),
      codigo: row.codigo,
      nombre: row.nombre,
      esOtros: Number(row.es_otros) === 1,
    }));

    res.status(200).json({
      ok: true,
      data,
    });
  },
);

/**
 * Ruta alternativa con nombre más descriptivo.
 *
 * Puedes usarla posteriormente en el frontend:
 * GET /api/public/regions/:id/ecclesiastical-regions
 */
publicRouter.get(
  "/regions/:id/ecclesiastical-regions",
  async (req, res) => {
    const regionId = z.coerce
      .number()
      .int()
      .positive("La región no es válida.")
      .parse(req.params.id);

    const [rows] =
      await pool.query<EcclesiasticalRegionRow[]>(
        `
          SELECT
            id,
            region_id,
            codigo,
            nombre,
            es_otros
          FROM regiones_eclesiales
          WHERE region_id = ?
            AND estado = 'ACTIVO'
          ORDER BY
            CASE
              WHEN es_otros = 1 THEN 1
              ELSE 0
            END,
            id
        `,
        [regionId],
      );

    res.status(200).json({
      ok: true,
      data: rows.map((row) => ({
        id: Number(row.id),
        regionId: Number(row.region_id),
        codigo: row.codigo,
        nombre: row.nombre,
        esOtros: Number(row.es_otros) === 1,
      })),
    });
  },
);

/**
 * Consulta automática del DNI.
 */
publicRouter.get("/dni/:dni", async (req, res) => {
  const dni = z
    .string()
    .regex(
      /^\d{8}$/,
      "El DNI debe contener exactamente 8 dígitos.",
    )
    .parse(req.params.dni);

  const data = await lookupDni(dni);

  res.status(200).json({
    ok: true,
    data,
  });
});

/**
 * Esquema para registrar participantes.
 *
 * regionId:
 * ID de regiones.
 *
 * iglesiaId:
 * ID de regiones_eclesiales.
 *
 * Se conserva el nombre iglesiaId para no romper
 * el formulario existente.
 */
const registerSchema = z
  .object({
    dni: z
      .string()
      .regex(
        /^\d{8}$/,
        "El DNI debe contener exactamente 8 dígitos.",
      ),

    nombres: z
      .string()
      .trim()
      .min(2, "Ingrese los nombres."),

    apellidos: z
      .string()
      .trim()
      .min(2, "Ingrese los apellidos."),

    fechaNacimiento: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "La fecha de nacimiento no es válida.",
      ),

    sexo: z.enum([
      "MASCULINO",
      "FEMENINO",
    ]),

    celular: z
      .string()
      .regex(
        /^9\d{8}$/,
        "El celular debe tener 9 dígitos e iniciar con 9.",
      ),

    regionId: z.coerce
      .number()
      .int()
      .positive("Seleccione una región."),

    iglesiaId: z
      .union([
        z.coerce.number().int().positive(),
        z.null(),
      ])
      .optional()
      .nullable(),

    /**
     * Se aceptan los dos nombres por compatibilidad:
     * cargoId y cargoEclesialId.
     */
    cargoId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    cargoEclesialId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    regionManual: z
      .string()
      .trim()
      .optional()
      .nullable(),

    iglesiaManual: z
      .string()
      .trim()
      .optional()
      .nullable(),

    cargoManual: z
      .string()
      .trim()
      .optional()
      .nullable(),

    aceptaReglamento: z.literal(true),
  })
  .superRefine((data, ctx) => {
    if (!data.cargoId && !data.cargoEclesialId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cargoEclesialId"],
        message: "Seleccione un cargo.",
      });
    }
  });

/**
 * Registro de participantes.
 */
publicRouter.post(
  "/participants",
  async (req, res) => {
    const data = registerSchema.parse(req.body);

    const cargoId =
      data.cargoId ??
      data.cargoEclesialId;

    if (!cargoId) {
      throw new HttpError(
        422,
        "Seleccione un cargo.",
      );
    }

    /**
     * Validar fecha de nacimiento.
     */
    const birthDate = new Date(
      `${data.fechaNacimiento}T00:00:00`,
    );

    if (Number.isNaN(birthDate.getTime())) {
      throw new HttpError(
        422,
        "La fecha de nacimiento no es válida.",
      );
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (birthDate > today) {
      throw new HttpError(
        422,
        "La fecha de nacimiento no puede ser futura.",
      );
    }

    /**
     * Validar DNI duplicado.
     */
    const [duplicateRows] =
      await pool.query<ParticipantIdRow[]>(
        `
          SELECT id
          FROM participantes
          WHERE dni = ?
          LIMIT 1
        `,
        [data.dni],
      );

    if (duplicateRows.length > 0) {
      throw new HttpError(
        409,
        "El DNI ya está registrado.",
      );
    }

    /**
     * Validar región principal.
     */
    const [regionRows] =
      await pool.query<SelectedRegionRow[]>(
        `
          SELECT
            id,
            nombre
          FROM regiones
          WHERE id = ?
            AND estado = 'ACTIVO'
          LIMIT 1
        `,
        [data.regionId],
      );

    if (regionRows.length === 0) {
      throw new HttpError(
        422,
        "La región seleccionada no es válida.",
      );
    }

    const selectedRegion = regionRows[0];

    if (!selectedRegion) {
    throw new HttpError(
        422,
        "La región seleccionada no es válida.",
    );
    }

    const isOtherRegion =
    selectedRegion.nombre
        .trim()
        .toUpperCase() === "OTROS";

    let ecclesiasticalRegionId:
      | number
      | null = data.iglesiaId ?? null;

    let regionManual: string | null = null;
    let iglesiaManual: string | null = null;

    /**
     * Validaciones para OTROS.
     */
    if (isOtherRegion) {
      if (!data.regionManual?.trim()) {
        throw new HttpError(
          422,
          "Ingrese la región manual.",
        );
      }

      if (!data.iglesiaManual?.trim()) {
        throw new HttpError(
          422,
          "Ingrese la región eclesiástica o iglesia.",
        );
      }

      ecclesiasticalRegionId = null;
      regionManual =
        data.regionManual.trim().toUpperCase();

      iglesiaManual =
        data.iglesiaManual.trim().toUpperCase();
    } else {
      /**
       * Para una región normal, debe seleccionarse una
       * región eclesiástica perteneciente a esa región.
       */
      if (!ecclesiasticalRegionId) {
        throw new HttpError(
          422,
          "Seleccione una región eclesiástica.",
        );
      }

      const [ecclesiasticalRows] =
        await pool.query<EcclesiasticalRegionRow[]>(
          `
            SELECT
              id,
              region_id,
              codigo,
              nombre,
              es_otros
            FROM regiones_eclesiales
            WHERE id = ?
              AND region_id = ?
              AND estado = 'ACTIVO'
            LIMIT 1
          `,
          [
            ecclesiasticalRegionId,
            data.regionId,
          ],
        );

      if (ecclesiasticalRows.length === 0) {
        throw new HttpError(
          422,
          "La región eclesiástica no pertenece a la región seleccionada.",
        );
      }
    }

    /**
     * Validar cargo.
     */
    const [positionRows] =
      await pool.query<SelectedPositionRow[]>(
        `
          SELECT
            id,
            nombre,
            es_otro
          FROM cargos
          WHERE id = ?
            AND estado = 'ACTIVO'
          LIMIT 1
        `,
        [cargoId],
      );

    const selectedPosition = positionRows[0];

    if (!selectedPosition) {
    throw new HttpError(
        422,
        "El cargo seleccionado no es válido.",
    );
    }

    const isOtherPosition =
    Number(selectedPosition.es_otro) === 1;

    let cargoManual: string | null = null;

    if (isOtherPosition) {
      if (!data.cargoManual?.trim()) {
        throw new HttpError(
          422,
          "Ingrese el cargo.",
        );
      }

      cargoManual =
        data.cargoManual.trim().toUpperCase();
    }

    /**
     * Insertar participante.
     */
    const [result] =
      await pool.execute<ResultSetHeader>(
        `
          INSERT INTO participantes (
            dni,
            nombres,
            apellidos,
            fecha_nacimiento,
            sexo,
            celular,
            region_id,
            iglesia_id,
            cargo_id,
            region_manual,
            iglesia_manual,
            cargo_manual,
            acepta_reglamento,
            fecha_aceptacion_reglamento,
            estado
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            1,
            NOW(),
            'REGISTRADO'
          )
        `,
        [
          data.dni,
          data.nombres.trim().toUpperCase(),
          data.apellidos.trim().toUpperCase(),
          data.fechaNacimiento,
          data.sexo,
          data.celular,
          data.regionId,
          ecclesiasticalRegionId,
          cargoId,
          regionManual,
          iglesiaManual,
          cargoManual,
        ],
      );

    res.status(201).json({
      ok: true,
      message:
        "Registro realizado correctamente.",
      data: {
        id: result.insertId,
        dni: data.dni,
        nombres:
          data.nombres.trim().toUpperCase(),
        apellidos:
          data.apellidos.trim().toUpperCase(),

        numeroInscripcion: String(
          result.insertId,
        ).padStart(6, "0"),
      },
    });
  },
);