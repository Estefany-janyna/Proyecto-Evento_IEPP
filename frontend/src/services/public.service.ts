import { api } from "../lib/api";

import type {
  DniData,
  ParticipantPayload,
  ParticipantRegistration,
  PublicCatalogs,
  RegionEclesiastica,
} from "../types/participant.types";

interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data: T;
}

interface CatalogResponse {
  regiones?: PublicCatalogs["regiones"];
  cargos?: PublicCatalogs["cargos"];

  // Compatibilidad con nombres anteriores.
  regions?: PublicCatalogs["regiones"];
  positions?: PublicCatalogs["cargos"];
}

/**
 * Regiones principales y cargos.
 */
export async function getCatalogs(): Promise<PublicCatalogs> {
  const response = await api.get<
    ApiResponse<CatalogResponse>
  >("/public/catalogs");

  const result = response.data.data;

  return {
    regiones:
      result.regiones ??
      result.regions ??
      [],

    cargos:
      result.cargos ??
      result.positions ??
      [],
  };
}

/**
 * Regiones eclesiásticas pertenecientes
 * a una región principal.
 */
export async function getChurches(
  regionId: number,
): Promise<RegionEclesiastica[]> {
  const response = await api.get<
    ApiResponse<RegionEclesiastica[]>
  >(
    `/public/regions/${regionId}/churches`,
  );

  return response.data.data;
}

/**
 * Consulta DNI mediante el backend.
 */
export async function lookupDni(
  dni: string,
): Promise<DniData> {
  const response = await api.get<
    ApiResponse<DniData>
  >(`/public/dni/${dni}`);

  return response.data.data;
}

/**
 * Registrar participante.
 */
export async function registerParticipant(
  payload: ParticipantPayload,
): Promise<ParticipantRegistration> {
  const response = await api.post<
    ApiResponse<ParticipantRegistration>
  >(
    "/public/participants",
    payload,
  );

  return response.data.data;
}

/**
 * Objeto utilizado actualmente por RegisterPage.tsx.
 *
 * Esto permite conservar llamadas como:
 *
 * publicService.catalogs()
 * publicService.churches()
 * publicService.dni()
 * publicService.register()
 */
export const publicService = {
  catalogs: async () => {
    const result = await getCatalogs();

    return {
      // Nombres usados por RegisterPage.tsx.
      regions: result.regiones,
      positions: result.cargos,

      // Nombres actuales recomendados.
      regiones: result.regiones,
      cargos: result.cargos,
    };
  },

  churches: async (
    regionId: number,
  ): Promise<RegionEclesiastica[]> => {
    return getChurches(regionId);
  },

  dni: async (
    dni: string,
  ): Promise<DniData> => {
    return lookupDni(dni);
  },

  register: async (
    payload: ParticipantPayload,
  ): Promise<ParticipantRegistration> => {
    return registerParticipant(payload);
  },
};