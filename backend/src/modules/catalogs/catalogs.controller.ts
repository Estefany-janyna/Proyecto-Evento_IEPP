import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  getEcclesiasticalRegions,
  getPublicCatalogs,
} from "./catalogs.service.js";

import {
  regionParamsSchema,
} from "./catalogs.schemas.js";

export async function catalogsController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getPublicCatalogs();

    res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function ecclesiasticalRegionsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { regionId } = regionParamsSchema.parse(
      req.params,
    );

    const data =
      await getEcclesiasticalRegions(regionId);

    res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}