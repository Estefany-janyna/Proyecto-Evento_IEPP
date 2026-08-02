import type { RequestHandler } from 'express'; import { HttpError } from '../utils/httpError.js'; 
export const requireProfile = (...profiles: string[]): RequestHandler => (req, _res, next) => { if (!req.session?.profile || !profiles.includes(req.session.profile)) 
    return next(new HttpError(403, 'Perfil sin permiso')); next(); 
};
