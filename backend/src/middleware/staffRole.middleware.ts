import type {
  RequestHandler,
} from "express";

import type {
  StaffRole,
} from "./auth.js";

import { HttpError } from "../utils/httpError.js";

export const requireStaffRole =
  (
    ...allowedRoles:
      StaffRole[]
  ): RequestHandler =>
  (
    req,
    _res,
    next,
  ) => {
    const session =
      req.session;

    if (
      !session ||
      session.kind !==
        "STAFF"
    ) {
      next(
        new HttpError(
          401,
          "Debe iniciar sesión como personal operativo.",
        ),
      );

      return;
    }

    if (
      !session.role ||
      !allowedRoles.includes(
        session.role,
      )
    ) {
      next(
        new HttpError(
          403,
          "No tiene autorización para utilizar este módulo.",
        ),
      );

      return;
    }

    next();
  };