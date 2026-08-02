import { z } from "zod";

export const regionParamsSchema = z.object({
  regionId: z.coerce
    .number()
    .int()
    .positive("La región seleccionada no es válida."),
});

export type RegionParams = z.infer<
  typeof regionParamsSchema
>;