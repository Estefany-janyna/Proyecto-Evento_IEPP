import axios from 'axios';

import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export async function lookupDni(dni: string) {
  if (!/^\d{8}$/.test(dni)) {
    throw new HttpError(422, 'El DNI debe tener 8 dígitos');
  }

  try {
    const { data } = await axios.post(
      env.API_PERU_URL,
      { dni },
      {
        headers: {
          Authorization: `Bearer ${env.API_PERU_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 12000,
      }
    );

    if (!data?.success || !data?.data) {
      throw new HttpError(
        404,
        data?.message || 'DNI no encontrado'
      );
    }

    return {
      dni,
      nombres: String(data.data.nombres || '').trim(),
      apellidoPaterno: String(data.data.apellido_paterno || '').trim(),
      apellidoMaterno: String(data.data.apellido_materno || '').trim(),
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new HttpError(404, 'DNI no encontrado');
      }

      if ([401, 403].includes(error.response?.status || 0)) {
        throw new HttpError(
          502,
          'Token de API Perú inválido o sin permiso'
        );
      }
    }

    throw new HttpError(
      502,
      'No fue posible consultar el DNI en este momento'
    );
  }
}