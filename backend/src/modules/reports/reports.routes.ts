import { Router } from "express";
import type {
  NextFunction,
  Request,
  Response,
} from "express";
import type { RowDataPacket } from "mysql2";

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import { pool } from "../../config/db.js";
import { requireAuth } from "../../middleware/auth.js";

export const reportsRouter = Router();

/**
 * Express 4 no captura automáticamente todos los errores
 * producidos dentro de funciones async.
 *
 * Este helper envía cualquier error al errorHandler global
 * y evita que el backend se cierre.
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

/**
 * Todas las rutas de reportes requieren acceso ADMIN.
 */
reportsRouter.use(requireAuth("ADMIN"));

/**
 * Filtros opcionales para reportes por fecha.
 */
function getDateFilters(req: Request): {
  from: string | null;
  to: string | null;
} {
  const from =
    typeof req.query.from === "string" &&
    req.query.from.trim()
      ? req.query.from.trim()
      : null;

  const to =
    typeof req.query.to === "string" &&
    req.query.to.trim()
      ? req.query.to.trim()
      : null;

  return {
    from,
    to,
  };
}

/**
 * Resumen general.
 */
reportsRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    const [
      [participantRows],
      [attendanceRows],
      [breakfastRows],
      [dinnerRows],
      [redemptionRows],
    ] = await Promise.all([
      pool.query<RowDataPacket[]>(
        `
          SELECT COUNT(*) AS total
          FROM participantes
          WHERE estado <> 'ANULADO'
        `,
      ),

      pool.query<RowDataPacket[]>(
        `
          SELECT COUNT(*) AS total
          FROM asistencias
          WHERE estado = 'ACTIVA'
        `,
      ),

      pool.query<RowDataPacket[]>(
        `
          SELECT COUNT(*) AS total
          FROM consumos_participantes
          WHERE estado = 'ENTREGADO'
            AND tipo_alimento = 'DESAYUNO'
        `,
      ),

      pool.query<RowDataPacket[]>(
        `
          SELECT COUNT(*) AS total
          FROM consumos_participantes
          WHERE estado = 'ENTREGADO'
            AND tipo_alimento = 'CENA'
        `,
      ),

      pool.query<RowDataPacket[]>(
        `
          SELECT COUNT(*) AS total
          FROM canjes_colaborador
          WHERE estado = 'CANJEADO'
        `,
      ),
    ]);

    res.json({
      ok: true,
      data: {
        participants: Number(
          participantRows[0]?.total ?? 0,
        ),

        attendance: Number(
          attendanceRows[0]?.total ?? 0,
        ),

        breakfasts: Number(
          breakfastRows[0]?.total ?? 0,
        ),

        dinners: Number(
          dinnerRows[0]?.total ?? 0,
        ),

        redemptions: Number(
          redemptionRows[0]?.total ?? 0,
        ),
      },
    });
  }),
);

/**
 * Reporte por región principal.
 *
 * participantes.region_id apunta a regiones.id
 */
reportsRouter.get(
  "/regions",
  asyncHandler(async (_req, res) => {
    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            COALESCE(
              r.nombre,
              p.region_manual,
              'SIN REGIÓN'
            ) AS region,

            COUNT(*) AS registrados,

            SUM(
              CASE
                WHEN p.estado IN (
                  'CONFIRMADO',
                  'ASISTIO'
                )
                THEN 1
                ELSE 0
              END
            ) AS confirmados,

            COUNT(
              DISTINCT a.participante_id
            ) AS asistentes

          FROM participantes AS p

          LEFT JOIN regiones AS r
            ON r.id = p.region_id

          LEFT JOIN asistencias AS a
            ON a.participante_id = p.id
            AND a.estado = 'ACTIVA'

          WHERE p.estado <> 'ANULADO'

          GROUP BY
            COALESCE(
              r.nombre,
              p.region_manual,
              'SIN REGIÓN'
            )

          ORDER BY
            registrados DESC,
            region ASC
        `,
      );

    res.json({
      ok: true,
      data: rows,
    });
  }),
);

/**
 * Reporte por región eclesiástica o iglesia.
 *
 * participantes.iglesia_id apunta a
 * regiones_eclesiales.id
 */
reportsRouter.get(
  "/churches",
  asyncHandler(async (_req, res) => {
    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            COALESCE(
              re.nombre,
              p.iglesia_manual,
              'SIN REGIÓN ECLESIÁSTICA'
            ) AS iglesia,

            COALESCE(
              r.nombre,
              p.region_manual,
              'SIN REGIÓN'
            ) AS region,

            COUNT(*) AS registrados,

            SUM(
              CASE
                WHEN p.estado IN (
                  'CONFIRMADO',
                  'ASISTIO'
                )
                THEN 1
                ELSE 0
              END
            ) AS confirmados,

            COUNT(
              DISTINCT a.participante_id
            ) AS asistentes

          FROM participantes AS p

          LEFT JOIN regiones AS r
            ON r.id = p.region_id

          LEFT JOIN regiones_eclesiales AS re
            ON re.id = p.iglesia_id

          LEFT JOIN asistencias AS a
            ON a.participante_id = p.id
            AND a.estado = 'ACTIVA'

          WHERE p.estado <> 'ANULADO'

          GROUP BY
            COALESCE(
              re.nombre,
              p.iglesia_manual,
              'SIN REGIÓN ECLESIÁSTICA'
            ),

            COALESCE(
              r.nombre,
              p.region_manual,
              'SIN REGIÓN'
            )

          ORDER BY
            asistentes DESC,
            registrados DESC,
            iglesia ASC
        `,
      );

    res.json({
      ok: true,
      data: rows,
    });
  }),
);

/**
 * Reporte de desayunos y cenas.
 */
reportsRouter.get(
  "/meals",
  asyncHandler(async (req, res) => {
    const {
      from,
      to,
    } = getDateFilters(req);

    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            cp.fecha,

            cp.tipo_alimento AS tipo,

            p.dni,
            p.nombres,
            p.apellidos,

            COALESCE(
              r.nombre,
              p.region_manual,
              'SIN REGIÓN'
            ) AS region,

            COALESCE(
              re.nombre,
              p.iglesia_manual,
              'SIN REGIÓN ECLESIÁSTICA'
            ) AS iglesia,

            cp.hora,
            cp.estado

          FROM consumos_participantes AS cp

          INNER JOIN participantes AS p
            ON p.id = cp.participante_id

          LEFT JOIN regiones AS r
            ON r.id = p.region_id

          LEFT JOIN regiones_eclesiales AS re
            ON re.id = p.iglesia_id

          WHERE
            (? IS NULL OR cp.fecha >= ?)

            AND
            (? IS NULL OR cp.fecha <= ?)

          ORDER BY
            cp.fecha DESC,
            cp.hora DESC
        `,
        [
          from,
          from,
          to,
          to,
        ],
      );

    res.json({
      ok: true,
      data: rows,
    });
  }),
);

/**
 * Reporte de puestos de comida.
 */
reportsRouter.get(
  "/stalls",
  asyncHandler(async (_req, res) => {
    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            numero_puesto AS numeroPuesto,
            encargado,
            celular,

            platos_asignados
              AS platosAsignados,

            platos_entregados
              AS platosEntregados,

            platos_disponibles
              AS platosDisponibles,

            estado

          FROM puestos_comida

          ORDER BY
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
 * Reporte de canjes realizados.
 */
reportsRouter.get(
  "/redemptions",
  asyncHandler(async (_req, res) => {
    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            cc.codigo,

            CONCAT(
              co.nombres,
              ' ',
              co.apellidos
            ) AS colaborador,

            pc.numero_puesto AS puesto,

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

          INNER JOIN puestos_comida AS pc
            ON pc.id =
              c.puesto_id

          ORDER BY
            c.id DESC
        `,
      );

    res.json({
      ok: true,
      data: rows,
    });
  }),
);

/**
 * Datos empleados para exportaciones Excel y PDF.
 */
async function reportRows(
  type: string,
): Promise<RowDataPacket[]> {
  if (type === "regions") {
    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            COALESCE(
              r.nombre,
              p.region_manual,
              'SIN REGIÓN'
            ) AS region,

            COUNT(*) AS registrados,

            SUM(
              CASE
                WHEN p.estado IN (
                  'CONFIRMADO',
                  'ASISTIO'
                )
                THEN 1
                ELSE 0
              END
            ) AS confirmados

          FROM participantes AS p

          LEFT JOIN regiones AS r
            ON r.id = p.region_id

          WHERE p.estado <> 'ANULADO'

          GROUP BY
            COALESCE(
              r.nombre,
              p.region_manual,
              'SIN REGIÓN'
            )

          ORDER BY
            registrados DESC
        `,
      );

    return rows;
  }

  if (
    type === "churches" ||
    type === "iglesias"
  ) {
    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            COALESCE(
              re.nombre,
              p.iglesia_manual,
              'SIN REGIÓN ECLESIÁSTICA'
            ) AS iglesia,

            COALESCE(
              r.nombre,
              p.region_manual,
              'SIN REGIÓN'
            ) AS region,

            COUNT(*) AS registrados,

            SUM(
              CASE
                WHEN p.estado IN (
                  'CONFIRMADO',
                  'ASISTIO'
                )
                THEN 1
                ELSE 0
              END
            ) AS confirmados

          FROM participantes AS p

          LEFT JOIN regiones AS r
            ON r.id = p.region_id

          LEFT JOIN regiones_eclesiales AS re
            ON re.id = p.iglesia_id

          WHERE p.estado <> 'ANULADO'

          GROUP BY
            COALESCE(
              re.nombre,
              p.iglesia_manual,
              'SIN REGIÓN ECLESIÁSTICA'
            ),

            COALESCE(
              r.nombre,
              p.region_manual,
              'SIN REGIÓN'
            )

          ORDER BY
            registrados DESC,
            iglesia ASC
        `,
      );

    return rows;
  }

  if (type === "stalls") {
    const [rows] =
      await pool.query<RowDataPacket[]>(
        `
          SELECT
            numero_puesto,
            encargado,
            celular,
            platos_asignados,
            platos_entregados,
            platos_disponibles,
            estado
          FROM puestos_comida
          ORDER BY numero_puesto
        `,
      );

    return rows;
  }

  /**
   * Reporte general de participantes.
   */
  const [rows] =
    await pool.query<RowDataPacket[]>(
      `
        SELECT
          p.dni,
          p.nombres,
          p.apellidos,
          p.celular,

          COALESCE(
            r.nombre,
            p.region_manual,
            'SIN REGIÓN'
          ) AS region,

          COALESCE(
            re.nombre,
            p.iglesia_manual,
            'SIN REGIÓN ECLESIÁSTICA'
          ) AS iglesia,

          COALESCE(
            c.nombre,
            p.cargo_manual,
            'SIN CARGO'
          ) AS cargo,

          p.estado

        FROM participantes AS p

        LEFT JOIN regiones AS r
          ON r.id = p.region_id

        LEFT JOIN regiones_eclesiales AS re
          ON re.id = p.iglesia_id

        LEFT JOIN cargos AS c
          ON c.id = p.cargo_id

        ORDER BY
          p.apellidos,
          p.nombres
      `,
    );

  return rows;
}

/**
 * Exportar reporte Excel.
 *
 * Ejemplos:
 * /api/reports/export/regions.xlsx
 * /api/reports/export/churches.xlsx
 * /api/reports/export/participants.xlsx
 * /api/reports/export/stalls.xlsx
 */
reportsRouter.get(
  "/export/:type.xlsx",
  asyncHandler(async (req, res) => {
    const type = String(
      req.params.type ??
        "participants",
    );

    const rows =
      await reportRows(type);

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      "Sistema IEPP";

    workbook.created =
      new Date();

    const worksheet =
      workbook.addWorksheet(
        "Reporte",
      );

    if (rows.length > 0) {
      const firstRow =
        rows[0];

      if (firstRow) {
        worksheet.columns =
          Object.keys(
            firstRow,
          ).map(
            (key) => ({
              header: key
                .replaceAll(
                  "_",
                  " ",
                )
                .toUpperCase(),

              key,
              width: 24,
            }),
          );

        rows.forEach(
          (row) => {
            worksheet.addRow(
              row,
            );
          },
        );

        const header =
          worksheet.getRow(1);

        header.font = {
          bold: true,
        };

        header.alignment = {
          vertical:
            "middle",
          horizontal:
            "center",
        };

        worksheet.views = [
          {
            state:
              "frozen",
            ySplit: 1,
          },
        ];
      }
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${type}.xlsx"`,
    );

    await workbook.xlsx.write(
      res,
    );

    res.end();
  }),
);

/**
 * Exportar reporte PDF.
 */
reportsRouter.get(
  "/export/:type.pdf",
  asyncHandler(async (req, res) => {
    const type = String(
  req.params.type ?? "participants",
);

const rows =
  await reportRows(type);

    res.setHeader(
      "Content-Type",
      "application/pdf",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${type}.pdf"`,
    );

    const document =
      new PDFDocument({
        margin: 40,
        size: "A4",
      });

    document.pipe(res);

    document
      .fontSize(18)
      .text(
        `Reporte: ${type}`,
        {
          align: "center",
        },
      );

    document
      .fontSize(9)
      .text(
        `Fecha de generación: ${new Date().toLocaleString(
          "es-PE",
        )}`,
        {
          align: "center",
        },
      );

    document.moveDown();

    if (rows.length === 0) {
      document
        .fontSize(11)
        .text(
          "No existen registros para mostrar.",
        );
    } else {
      rows
        .slice(0, 150)
        .forEach((row) => {
          const line =
            Object.entries(row)
              .map(
                ([key, value]) =>
                  `${key}: ${
                    value ?? ""
                  }`,
              )
              .join(" | ");

          document
            .fontSize(8)
            .text(line);

          document.moveDown(
            0.4,
          );
        });
    }

    document.end();
  }),
);