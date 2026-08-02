import type {
  RequestHandler,
} from "express";

import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export type StaffRole =
  | "ASISTENCIA"
  | "DESAYUNO"
  | "CENA";

export type SessionKind =
  | "ADMIN"
  | "COLLABORATOR"
  | "STALL"
  | "STAFF";

export type Session = {
  id: number;
  kind: SessionKind;

  /**
   * Se mantiene para compatibilidad
   * con sesiones anteriores.
   */
  profile?: string;

  /**
   * Función del personal operativo.
   * Solo se utiliza cuando kind = STAFF.
   */
  role?: StaffRole;
};

declare global {
  namespace Express {
    interface Request {
      session?: Session;
    }
  }
}

/**
 * Verifica que exista una sesión válida
 * y que corresponda a uno de los perfiles
 * permitidos.
 */
export const requireAuth =
  (
    ...kinds: SessionKind[]
  ): RequestHandler =>
  (
    req,
    _res,
    next,
  ) => {
    const authorization =
      req.headers.authorization;

    if (
      !authorization?.startsWith(
        "Bearer ",
      )
    ) {
      next(
        new HttpError(
          401,
          "Token requerido.",
        ),
      );

      return;
    }

    try {
      const token =
        authorization.slice(7);

      const verified =
        jwt.verify(
          token,
          env.JWT_SECRET,
        );

      if (
        typeof verified !==
          "object" ||
        verified === null
      ) {
        throw new HttpError(
          401,
          "Token inválido o vencido.",
        );
      }

      const session =
        verified as Session;

      if (
        !session.id ||
        !session.kind
      ) {
        throw new HttpError(
          401,
          "La sesión no es válida.",
        );
      }

      if (
        kinds.length > 0 &&
        !kinds.includes(
          session.kind,
        )
      ) {
        throw new HttpError(
          403,
          "Acceso denegado.",
        );
      }

      req.session =
        session;

      next();
    } catch (error) {
      next(
        error instanceof
          HttpError
          ? error
          : new HttpError(
              401,
              "Token inválido o vencido.",
            ),
      );
    }
  };

/**
 * Genera el token de sesión.
 */
export function signSession(
  session: Session,
): string {
  return jwt.sign(
    session,
    env.JWT_SECRET,
    {
      expiresIn:
        env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
}