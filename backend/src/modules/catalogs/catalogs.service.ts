export const catalogsService={} as const;
import type { RowDataPacket } from "mysql2";
import { pool } from "../../config/database.js";

interface RegionRow extends RowDataPacket {
  id: number;
  nombre: string;
}

interface RegionEclesiasticaRow extends RowDataPacket {
  id: number;
  region_id: number;
  codigo: string | null;
  nombre: string;
  es_otros: number;
}

interface CargoRow extends RowDataPacket {
  id: number;
  nombre: string;
  es_otro: number;
}

export interface RegionCatalog {
  id: number;
  nombre: string;
}

export interface RegionEclesiasticaCatalog {
  id: number;
  regionId: number;
  codigo: string | null;
  nombre: string;
  esOtros: boolean;
}

export interface CargoCatalog {
  id: number;
  nombre: string;
  permiteOtro: boolean;
}

export async function getRegions(): Promise<
  RegionCatalog[]
> {
  const [rows] = await pool.query<RegionRow[]>(`
    SELECT
      id,
      nombre
    FROM regiones
    WHERE estado = 'ACTIVO'
    ORDER BY
      CASE WHEN nombre = 'OTROS' THEN 1 ELSE 0 END,
      nombre
  `);

  return rows.map((row) => ({
    id: Number(row.id),
    nombre: row.nombre,
  }));
}

export async function getPositions(): Promise<
  CargoCatalog[]
> {
  const [rows] = await pool.query<CargoRow[]>(`
    SELECT
      id,
      nombre,
      permite_otro
    FROM cargos
    WHERE estado = 'ACTIVO'
    ORDER BY
      CASE WHEN permite_otro = 1 THEN 1 ELSE 0 END,
      id
  `);

  return rows.map((row) => ({
    id: Number(row.id),
    nombre: row.nombre,
    permiteOtro: Number(row.permite_otro) === 1,
  }));
}

export async function getPublicCatalogs() {
  const [regiones, cargos] = await Promise.all([
    getRegions(),
    getPositions(),
  ]);

  return {
    regiones,
    cargos,
  };
}

export async function getEcclesiasticalRegions(
  regionId: number,
): Promise<RegionEclesiasticaCatalog[]> {
  const [rows] =
    await pool.execute<RegionEclesiasticaRow[]>(
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
          CASE WHEN es_otros = 1 THEN 1 ELSE 0 END,
          id
      `,
      [regionId],
    );

  return rows.map((row) => ({
    id: Number(row.id),
    regionId: Number(row.region_id),
    codigo: row.codigo,
    nombre: row.nombre,
    esOtros: Number(row.es_otros) === 1,
  }));
}