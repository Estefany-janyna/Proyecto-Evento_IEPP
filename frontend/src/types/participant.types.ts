export interface Region {
  id: number;
  nombre: string;
  esOtros: boolean;
}

export interface RegionEclesiastica {
  id: number;
  regionId: number;
  codigo: string | null;
  nombre: string;
  esOtros: boolean;
}

export interface Cargo {
  id: number;
  nombre: string;
  esOtro: boolean;
}

export interface PublicCatalogs {
  regiones: Region[];
  cargos: Cargo[];
}

export interface DniData {
  nombres: string;

  apellidoPaterno?:
    string;

  apellidoMaterno?:
    string;

  apellido_paterno?:
    string;

  apellido_materno?:
    string;
}

export interface ParticipantPayload {
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;

  sexo:
    | "MASCULINO"
    | "FEMENINO";

  celular: string;

  regionId: number;
  iglesiaId:
    | number
    | null;

  cargoId: number;

  regionManual?:
    | string
    | null;

  iglesiaManual?:
    | string
    | null;

  cargoManual?:
    | string
    | null;

  aceptaReglamento:
    boolean;
}

export interface ParticipantRegistration {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  numeroInscripcion: string;
}