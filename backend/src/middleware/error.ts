import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) { res.status(422).json({ ok: false, message: 'Datos inválidos', errors: error.flatten() }); return; }
    if (error instanceof HttpError) { res.status(error.statusCode).json({ ok: false, message: error.message }); return; }
    console.error(error); res.status(500).json({ ok: false, message: 'Error interno del servidor' });
};
