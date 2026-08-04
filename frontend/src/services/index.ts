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

interface CatalogApiData {
  regiones?:
    PublicCatalogs["regiones"];

  cargos?:
    PublicCatalogs["cargos"];

  regions?:
    PublicCatalogs["regiones"];

  positions?:
    PublicCatalogs["cargos"];
}

interface PublicCatalogResult {
  regiones:
    PublicCatalogs["regiones"];

  cargos:
    PublicCatalogs["cargos"];

  regions:
    PublicCatalogs["regiones"];

  positions:
    PublicCatalogs["cargos"];
}

/**
 * Servicios públicos:
 * catálogos, regiones eclesiásticas, DNI y registro.
 */
export const publicService = {
  catalogs:
  async (): Promise<PublicCatalogResult> => {
    const response =
      await api.get<
        ApiResponse<CatalogApiData>
      >(
        "/public/catalogs",
      );

    /**
     * Puede recibirse como:
     *
     * AxiosResponse:
     * response.data.data
     *
     * Respuesta transformada:
     * response.data
     *
     * Datos directamente:
     * response
     */
    const rawResponse =
      response as unknown as {
        data?: unknown;
      };

    const firstLevel =
      rawResponse?.data ??
      rawResponse;

    const firstLevelObject =
      firstLevel as {
        ok?: boolean;
        message?: string;
        data?: unknown;
        regiones?: unknown;
        cargos?: unknown;
        regions?: unknown;
        positions?: unknown;
      };

    const catalogData =
      firstLevelObject?.data ??
      firstLevelObject;

    const data =
      catalogData as {
        regiones?: unknown;
        cargos?: unknown;
        regions?: unknown;
        positions?: unknown;
      };

    console.log(
      "Respuesta original de catálogos:",
      response,
    );

    console.log(
      "Datos procesados de catálogos:",
      data,
    );

    const regiones =
      Array.isArray(
        data?.regiones,
      )
        ? data.regiones
        : Array.isArray(
              data?.regions,
            )
          ? data.regions
          : [];

    const cargos =
      Array.isArray(
        data?.cargos,
      )
        ? data.cargos
        : Array.isArray(
              data?.positions,
            )
          ? data.positions
          : [];

    if (
      regiones.length === 0 &&
      cargos.length === 0
    ) {
      console.error(
        "Estructura inesperada de catálogos:",
        response,
      );

      throw new Error(
        "El servidor respondió, pero no se encontraron regiones ni cargos.",
      );
    }

    return {
      regiones:
        regiones as PublicCatalogs["regiones"],

      cargos:
        cargos as PublicCatalogs["cargos"],

      regions:
        regiones as PublicCatalogs["regiones"],

      positions:
        cargos as PublicCatalogs["cargos"],
    };
  },

  churches: async (
    regionId: number,
  ): Promise<RegionEclesiastica[]> => {
    const response = await api.get<
      ApiResponse<RegionEclesiastica[]>
    >(
      `/public/regions/${regionId}/churches`,
    );

    return response.data.data;
  },

  dni: async (
    dni: string,
  ): Promise<DniData> => {
    const response = await api.get<
      ApiResponse<DniData>
    >(`/public/dni/${dni}`);

    return response.data.data;
  },

  register: async (
    payload: ParticipantPayload,
  ): Promise<
    ApiResponse<ParticipantRegistration>
  > => {
    const response = await api.post<
      ApiResponse<ParticipantRegistration>
    >(
      "/public/participants",
      payload,
    );

    return response.data;
  },
};

/**
 * Control de asistencia.
 */
export const attendanceService = {
  search: async (dni: string) => {
    const response = await api.get(
      `/attendance/search/${dni}`,
    );

    return response.data.data;
  },

  mark: async (dni: string) => {
    const response = await api.post(
      "/attendance",
      { dni },
    );

    return response.data;
  },
};

/**
 * Entrega de desayuno y cena.
 */
export const mealService = {
  search: async (dni: string) => {
    const response = await api.get(
      `/meals/search/${dni}`,
    );

    return response.data.data;
  },

  deliver: async (
    dni: string,
    tipo: "DESAYUNO" | "CENA",
  ) => {
    const response = await api.post(
      "/meals/deliver",
      {
        dni,
        tipo,
      },
    );

    return response.data;
  },
};

/**
 * Autenticación.
 */
export const authService = {
  login: async (
    kind:
      | "admin"
      | "collaborator"
      | "stall"
      | "staff",
    body: unknown,
  ) => {
    const response = await api.post(
      `/auth/${kind}`,
      body,
    );

    return response.data.data;
  },
};
/**
 * Colaboradores.
 */
export const collaboratorService = {
  me: async () => {
    const response = await api.get(
      "/collaborator/me",
    );

    return response.data.data;
  },

  code: async () => {
    const response = await api.post(
      "/collaborator/daily-code",
    );

    return response.data.data;
  },

  stalls: async () => {
    const response = await api.get(
      "/collaborator/available-stalls",
    );

    return response.data.data;
  },
};

/**
 * Puestos de comida.
 */
export const stallService = {
  me: async () => {
    const response = await api.get(
      "/stall/me",
    );

    return response.data.data;
  },

  validate: async (
    codigo: string,
  ) => {
    const response = await api.get(
      `/stall/validate/${codigo}`,
    );

    return response.data.data;
  },

  redeem: async (
    codigo: string,
  ) => {
    const response = await api.post(
      "/stall/redeem",
      { codigo },
    );

    return response.data;
  },

  history: async () => {
    const response = await api.get(
      "/stall/history",
    );

    return response.data.data;
  },
};

/**
 * Reportes.
 */
export const reportService = {
  summary: async () => {
    const response = await api.get(
      "/reports/summary",
    );

    return response.data.data;
  },

  regions: async () => {
    const response = await api.get(
      "/reports/regions",
    );

    return response.data.data;
  },

  churches: async () => {
    const response = await api.get(
      "/reports/churches",
    );

    return response.data.data;
  },

  stalls: async () => {
    const response = await api.get(
      "/reports/stalls",
    );

    return response.data.data;
  },

  redemptions: async () => {
    const response = await api.get(
      "/reports/redemptions",
    );

    return response.data.data;
  },
};

export interface AdminStall {
  id: number;
  numeroPuesto: string;
  encargado: string;
  celular: string;

  passwordReferencia:
    | string
    | null;

  platosAsignados: number;
  platosEntregados: number;
  platosDisponibles: number;

  estado:
    | "ACTIVO"
    | "INACTIVO"
    | "SIN_DISPONIBILIDAD";

  ultimoAcceso:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminStallPayload {
  numeroPuesto: string;
  encargado: string;
  celular: string;
  password: string;
  platosAsignados: number;
}

export interface UpdateAdminStallPayload {
  encargado: string;
  celular: string;
  platosAsignados: number;
}

export const adminStallService = {
  list: async (): Promise<
    AdminStall[]
  > => {
    const response =
      await api.get<
        ApiResponse<
          AdminStall[]
        >
      >(
        "/admin/stalls",
      );

    return response.data.data;
  },

  create: async (
    payload:
      CreateAdminStallPayload,
  ) => {
    const response =
      await api.post(
        "/admin/stalls",
        payload,
      );

    return response.data;
  },

  update: async (
    id: number,
    payload:
      UpdateAdminStallPayload,
  ) => {
    const response =
      await api.put(
        `/admin/stalls/${id}`,
        payload,
      );

    return response.data;
  },

  changePassword:
    async (
      id: number,
      password: string,
    ) => {
      const response =
        await api.patch(
          `/admin/stalls/${id}/password`,
          {
            password,
          },
        );

      return response.data;
    },

  changeStatus:
    async (
      id: number,
      estado:
        | "ACTIVO"
        | "INACTIVO",
    ) => {
      const response =
        await api.patch(
          `/admin/stalls/${id}/status`,
          {
            estado,
          },
        );

      return response.data;
    },
};

export interface AdminCollaborator {
  id: number;
  nombres: string;
  apellidos: string;
  celular: string;

  passwordReferencia:
    | string
    | null;

  estado:
    | "ACTIVO"
    | "INACTIVO";

  ultimoAcceso:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminCollaboratorPayload {
  nombres: string;
  apellidos: string;
  celular: string;
  password: string;
}

export interface UpdateAdminCollaboratorPayload {
  nombres: string;
  apellidos: string;
  celular: string;
}

export const adminCollaboratorService = {
  list: async (): Promise<
    AdminCollaborator[]
  > => {
    const response =
      await api.get<
        ApiResponse<
          AdminCollaborator[]
        >
      >(
        "/admin/collaborators",
      );

    return response.data.data;
  },

  create: async (
    payload:
      CreateAdminCollaboratorPayload,
  ) => {
    const response =
      await api.post(
        "/admin/collaborators",
        payload,
      );

    return response.data;
  },

  update: async (
    id: number,
    payload:
      UpdateAdminCollaboratorPayload,
  ) => {
    const response =
      await api.put(
        `/admin/collaborators/${id}`,
        payload,
      );

    return response.data;
  },

  changePassword: async (
    id: number,
    password: string,
  ) => {
    const response =
      await api.patch(
        `/admin/collaborators/${id}/password`,
        {
          password,
        },
      );

    return response.data;
  },

  changeStatus: async (
    id: number,
    estado:
      | "ACTIVO"
      | "INACTIVO",
  ) => {
    const response =
      await api.patch(
        `/admin/collaborators/${id}/status`,
        {
          estado,
        },
      );

    return response.data;
  },
};

/**
 * Personal operativo.
 */
export type StaffFunction =
  | "ASISTENCIA"
  | "DESAYUNO"
  | "CENA";

export type StaffStatus =
  | "ACTIVO"
  | "INACTIVO";

export interface AdminStaff {
  id: number;
  nombres: string;
  apellidos: string;
  celular: string;

  passwordReferencia:
    | string
    | null;

  funcion: StaffFunction;

  estado: StaffStatus;

  ultimoAcceso:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminStaffPayload {
  nombres: string;
  apellidos: string;
  celular: string;
  password: string;
  funcion: StaffFunction;
}

export interface UpdateAdminStaffPayload {
  nombres: string;
  apellidos: string;
  celular: string;
  funcion: StaffFunction;
}

export const adminStaffService = {
  list: async (): Promise<
    AdminStaff[]
  > => {
    const response =
      await api.get<
        ApiResponse<
          AdminStaff[]
        >
      >(
        "/admin/staff",
      );

    return response.data.data;
  },

  create: async (
    payload:
      CreateAdminStaffPayload,
  ) => {
    const response =
      await api.post(
        "/admin/staff",
        payload,
      );

    return response.data;
  },

  update: async (
    id: number,
    payload:
      UpdateAdminStaffPayload,
  ) => {
    const response =
      await api.put(
        `/admin/staff/${id}`,
        payload,
      );

    return response.data;
  },

  changePassword: async (
    id: number,
    password: string,
  ) => {
    const response =
      await api.patch(
        `/admin/staff/${id}/password`,
        {
          password,
        },
      );

    return response.data;
  },

  changeStatus: async (
    id: number,
    estado: StaffStatus,
  ) => {
    const response =
      await api.patch(
        `/admin/staff/${id}/status`,
        {
          estado,
        },
      );

    return response.data;
  },
};