import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useForm,
  type FieldErrors,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import {
  Button,
  Card,
  Input,
  Select,
} from "../components/ui";

import { publicService } from "../services";
import { eventConfig } from "../config/event.config";

interface RegistrationSuccess {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  dni: string;
}

const schema = z.object({
  dni: z
    .string()
    .regex(
      /^\d{8}$/,
      "El DNI debe contener exactamente 8 dígitos.",
    ),

  nombres: z
    .string()
    .trim()
    .min(
      2,
      "Ingrese los nombres.",
    ),

  apellidos: z
    .string()
    .trim()
    .min(
      2,
      "Ingrese los apellidos.",
    ),

  fechaNacimiento: z
    .string()
    .min(
      1,
      "Seleccione la fecha de nacimiento.",
    ),

  sexo: z.enum(
    [
      "MASCULINO",
      "FEMENINO",
    ],
    {
      message:
        "Seleccione el sexo.",
    },
  ),

  celular: z
    .string()
    .regex(
      /^9\d{8}$/,
      "El celular debe tener 9 dígitos e iniciar con 9.",
    ),

  regionId: z
    .string()
    .min(
      1,
      "Seleccione una región.",
    ),

  iglesiaId: z
    .string()
    .optional(),

  cargoId: z
    .string()
    .min(
      1,
      "Seleccione un cargo.",
    ),

  regionManual: z
    .string()
    .trim()
    .optional(),

  iglesiaManual: z
    .string()
    .trim()
    .optional(),

  cargoManual: z
    .string()
    .trim()
    .optional(),

  aceptaReglamento: z
    .boolean()
    .refine(
      (value) => value === true,
      {
        message:
          "Debe aceptar el reglamento.",
      },
    ),
});

type FormValues = z.infer<
  typeof schema
>;

interface Region {
  id: number;
  nombre: string;
  esOtros?: boolean;
}

interface RegionEclesiastica {
  id: number;
  regionId?: number;
  codigo?: string | null;
  nombre: string;
  esOtros?: boolean;
}

interface Cargo {
  id: number;
  nombre: string;
  esOtro?: boolean;
}

interface Catalogs {
  regions: Region[];
  positions: Cargo[];
}

type MessageType =
  | "success"
  | "error"
  | "warning"
  | "info";

interface Message {
  t: MessageType;
  title?: string;
  m: string;
}

interface AlertStyles {
  container: string;
  icon: string;
  bar: string;
  symbol: string;
}

function getMessageStyles(
  type: MessageType,
): AlertStyles {
  if (type === "success") {
    return {
      container:
        "border-emerald-300 bg-emerald-50 text-emerald-950",
      icon:
        "bg-emerald-600 text-white",
      bar: "bg-emerald-500",
      symbol: "✓",
    };
  }

  if (type === "warning") {
    return {
      container:
        "border-amber-300 bg-amber-50 text-amber-950",
      icon:
        "bg-amber-500 text-white",
      bar: "bg-amber-500",
      symbol: "!",
    };
  }

  if (type === "info") {
    return {
      container:
        "border-blue-300 bg-blue-50 text-blue-950",
      icon:
        "bg-blue-600 text-white",
      bar: "bg-blue-500",
      symbol: "i",
    };
  }

  return {
    container:
      "border-red-300 bg-red-50 text-red-950",
    icon:
      "bg-red-600 text-white",
    bar: "bg-red-500",
    symbol: "!",
  };
}

function getDefaultMessageTitle(
  type: MessageType,
): string {
  if (type === "success") {
    return "Operación realizada";
  }

  if (type === "warning") {
    return "Revise la información";
  }

  if (type === "info") {
    return "Información";
  }

  return "No se pudo completar la operación";
}

function getApiMessage(
  error: unknown,
  fallback: string,
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const message =
    error.response?.data?.message;

  return typeof message === "string" &&
    message.trim()
    ? message
    : fallback;
}

function getFirstFormError(
  errors: FieldErrors<FormValues>,
): string {
  const fields: Array<
    keyof FormValues
  > = [
    "dni",
    "nombres",
    "apellidos",
    "fechaNacimiento",
    "sexo",
    "celular",
    "regionId",
    "iglesiaId",
    "regionManual",
    "iglesiaManual",
    "cargoId",
    "cargoManual",
    "aceptaReglamento",
  ];

  for (const field of fields) {
    const fieldError = errors[field];

    if (
      fieldError &&
      typeof fieldError.message ===
        "string"
    ) {
      return fieldError.message;
    }
  }

  return "Revise los campos marcados antes de continuar.";
}

export function RegisterPage() {
  const [
    catalogs,
    setCatalogs,
  ] = useState<Catalogs>({
    regions: [],
    positions: [],
  });

  const [
    churches,
    setChurches,
  ] = useState<
    RegionEclesiastica[]
  >([]);

  const [
    dniOk,
    setDniOk,
  ] = useState(false);

  const [
    dniManual,
    setDniManual,
  ] = useState(false);

  const [
    loadingDni,
    setLoadingDni,
  ] = useState(false);

  const [
    loadingCatalogs,
    setLoadingCatalogs,
  ] = useState(false);

  const [
    loadingChurches,
    setLoadingChurches,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<Message | null>(
    null,
  );

  const showMessage = (
    nextMessage: Message,
  ) => {
    setMessage(nextMessage);

    window.requestAnimationFrame(
      () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      },
    );
  };

  const [
    registrationSuccess,
    setRegistrationSuccess,
  ] = useState<
    RegistrationSuccess | null
  >(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormValues>({
    resolver: zodResolver(
      schema,
    ),

    defaultValues: {
      dni: "",
      nombres: "",
      apellidos: "",
      fechaNacimiento: "",
      sexo: undefined,
      celular: "",

      regionId: "",
      iglesiaId: "",
      cargoId: "",

      regionManual: "",
      iglesiaManual: "",
      cargoManual: "",

      aceptaReglamento:
        false,
    },
  });

  const dni = watch("dni");

  const regionId =
    watch("regionId");

  const cargoId =
    watch("cargoId");

  const selectedRegion =
    useMemo(
      () =>
        catalogs.regions.find(
          (region) =>
            Number(region.id) ===
            Number(regionId),
        ),
      [
        catalogs.regions,
        regionId,
      ],
    );

  const selectedCargo =
    useMemo(
      () =>
        catalogs.positions.find(
          (cargo) =>
            Number(cargo.id) ===
            Number(cargoId),
        ),
      [
        catalogs.positions,
        cargoId,
      ],
    );

  const isOtherRegion =
    selectedRegion?.esOtros ===
      true ||
    selectedRegion?.nombre
      ?.trim()
      .toUpperCase() ===
      "OTROS";

  const isOtherCargo =
    selectedCargo?.esOtro ===
      true ||
    selectedCargo?.nombre
      ?.trim()
      .toUpperCase() ===
      "OTRO" ||
    selectedCargo?.nombre
      ?.trim()
      .toUpperCase() ===
      "OTROS";

  /**
   * Cargar regiones y cargos.
   */
  useEffect(() => {
    const loadCatalogs =
      async () => {
        try {
          setLoadingCatalogs(
            true,
          );

          setMessage(null);

          const response =
            await publicService.catalogs();

          setCatalogs({
            regions:
              response.regions ??
              response.regiones ??
              [],

            positions:
              response.positions ??
              response.cargos ??
              [],
          });
        } catch (error) {
          console.error(
            "Error cargando catálogos:",
            error,
          );

          setMessage({
            t: "error",

            m:
              axios.isAxiosError(
                error,
              )
                ? error.response
                    ?.data
                    ?.message ??
                  "No se pudieron cargar los catálogos."
                : "No se pudieron cargar los catálogos.",
          });
        } finally {
          setLoadingCatalogs(
            false,
          );
        }
      };

    void loadCatalogs();
  }, []);

  /**
   * Cargar regiones eclesiásticas
   * según la región seleccionada.
   */
  useEffect(() => {
    const selectedRegionId =
      Number(regionId);

    setChurches([]);

    setValue(
      "iglesiaId",
      "",
      {
        shouldValidate:
          false,
      },
    );

    setValue(
      "regionManual",
      "",
      {
        shouldValidate:
          false,
      },
    );

    setValue(
      "iglesiaManual",
      "",
      {
        shouldValidate:
          false,
      },
    );

    if (
      !selectedRegionId ||
      selectedRegionId <= 0 ||
      isOtherRegion
    ) {
      return;
    }

    const loadChurches =
      async () => {
        try {
          setLoadingChurches(
            true,
          );

          const result =
            await publicService.churches(
              selectedRegionId,
            );

          setChurches(result);
        } catch (error) {
          console.error(
            "Error cargando regiones eclesiásticas:",
            error,
          );

          setMessage({
            t: "error",

            m:
              axios.isAxiosError(
                error,
              )
                ? error.response
                    ?.data
                    ?.message ??
                  "No se pudieron cargar las regiones eclesiásticas."
                : "No se pudieron cargar las regiones eclesiásticas.",
          });
        } finally {
          setLoadingChurches(
            false,
          );
        }
      };

    void loadChurches();
  }, [
    regionId,
    isOtherRegion,
    setValue,
  ]);

  /**
   * Limpiar cargo manual
   * cuando deja de seleccionarse OTRO.
   */
  useEffect(() => {
    if (!isOtherCargo) {
      setValue(
        "cargoManual",
        "",
        {
          shouldValidate:
            false,
        },
      );
    }
  }, [
    isOtherCargo,
    setValue,
  ]);

/**
 * Consulta automática del DNI.
 *
 * Cuando la consulta externa falla,
 * habilita el ingreso manual de
 * nombres y apellidos.
 */
useEffect(() => {
  setDniOk(false);
  setDniManual(false);

  const numeroDni =
    (dni || "").trim();

  /**
   * Mientras el DNI no tenga
   * exactamente 8 dígitos,
   * limpiar nombres y apellidos.
   */
  if (
    !/^\d{8}$/.test(
      numeroDni,
    )
  ) {
    setValue(
      "nombres",
      "",
      {
        shouldValidate:
          false,
      },
    );

    setValue(
      "apellidos",
      "",
      {
        shouldValidate:
          false,
      },
    );

    return;
  }

  const timer =
    window.setTimeout(
      async () => {
        try {
          setLoadingDni(true);
          setMessage(null);

          const result =
            await publicService.dni(
              numeroDni,
            );

          setValue(
            "nombres",
            result.nombres ??
              "",
            {
              shouldValidate:
                true,

              shouldDirty:
                true,
            },
          );

          const apellidos = [
            result.apellidoPaterno ??
              result.apellido_paterno,

            result.apellidoMaterno ??
              result.apellido_materno,
          ]
            .filter(Boolean)
            .join(" ");

          setValue(
            "apellidos",
            apellidos,
            {
              shouldValidate:
                true,

              shouldDirty:
                true,
            },
          );

          setDniOk(true);
          setDniManual(false);
        } catch (error) {
          console.error(
            "Error consultando DNI:",
            error,
          );

          setDniOk(false);

          /**
           * Un estado 409 significa que
           * el DNI ya está registrado.
           * En ese caso no debe permitirse
           * otro registro manual.
           */
          if (
            axios.isAxiosError(
              error,
            ) &&
            error.response?.status ===
              409
          ) {
            setDniManual(false);

            setValue(
              "nombres",
              "",
              {
                shouldValidate:
                  false,
              },
            );

            setValue(
              "apellidos",
              "",
              {
                shouldValidate:
                  false,
              },
            );

            showMessage({
              t: "error",

              title:
                "DNI ya registrado",

              m:
                error.response
                  ?.data
                  ?.message ??
                "El DNI ya se encuentra registrado.",
            });

            return;
          }

          /**
           * Para errores del servicio de
           * consulta, permitir completar
           * nombres y apellidos manualmente.
           */
          setDniManual(true);

          setValue(
            "nombres",
            "",
            {
              shouldValidate:
                false,
            },
          );

          setValue(
            "apellidos",
            "",
            {
              shouldValidate:
                false,
            },
          );

          showMessage({
            t: "warning",

            title:
              "Ingrese los datos manualmente",

            m:
              "No fue posible consultar el DNI automáticamente. Complete los nombres y apellidos para continuar.",
          });
        } finally {
          setLoadingDni(false);
        }
      },

      450,
    );

  return () => {
    window.clearTimeout(
      timer,
    );
  };
}, [
  dni,
  setValue,
]);

  const submit:
    SubmitHandler<FormValues> =
    async (form) => {
      try {
        setMessage(null);

        if (isOtherRegion) {
          if (
            !form.regionManual
              ?.trim()
          ) {
            showMessage({
              t: "warning",
              title: "Región pendiente",
              m:
                "Ingrese el nombre de la región antes de continuar.",
            });

            return;
          }

          if (
            !form.iglesiaManual
              ?.trim()
          ) {
            showMessage({
              t: "warning",
              title:
                "Región eclesiástica pendiente",
              m:
                "Ingrese la región eclesiástica o iglesia.",
            });

            return;
          }
        } else if (
          !form.iglesiaId
        ) {
          showMessage({
            t: "warning",
            title: "Seleccione una iglesia",
            m:
              "Debe seleccionar una región eclesiástica para continuar.",
          });

          return;
        }

        if (
          isOtherCargo &&
          !form.cargoManual
            ?.trim()
        ) {
          showMessage({
            t: "warning",
            title: "Cargo pendiente",
            m:
              "Ingrese el cargo correspondiente antes de continuar.",
          });

          return;
        }

        const result =
          await publicService.register(
            {
              dni:
                form.dni,

              nombres:
                form.nombres,

              apellidos:
                form.apellidos,

              fechaNacimiento:
                form.fechaNacimiento,

              sexo:
                form.sexo,

              celular:
                form.celular,

              regionId:
                Number(
                  form.regionId,
                ),

              iglesiaId:
                isOtherRegion
                  ? null
                  : form.iglesiaId
                    ? Number(
                        form.iglesiaId,
                      )
                    : null,

              cargoId:
                Number(
                  form.cargoId,
                ),

              regionManual:
                isOtherRegion
                  ? form.regionManual
                      ?.trim() ||
                    null
                  : null,

              iglesiaManual:
                isOtherRegion
                  ? form.iglesiaManual
                      ?.trim() ||
                    null
                  : null,

              cargoManual:
                isOtherCargo
                  ? form.cargoManual
                      ?.trim() ||
                    null
                  : null,

              aceptaReglamento:
                form.aceptaReglamento,
            },
          );

        const registrationCode =
          result.data
            .numeroInscripcion ??
          String(
            result.data.id,
          ).padStart(
            6,
            "0",
          );

        setRegistrationSuccess({
          id:
            result.data.id,

          codigo:
            registrationCode,

          nombres:
            form.nombres,

          apellidos:
            form.apellidos,

          dni:
            form.dni,
        });

        reset();
        setChurches([]);
        setDniOk(false);
        setDniManual(false);
        setMessage(null);

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });
      } catch (error) {
        console.error(
          "Error registrando participante:",
          error,
        );

        if (axios.isAxiosError(error)) {
          const status =
            error.response?.status;

          const backendMessage =
            getApiMessage(
              error,
              "No se pudo completar el registro.",
            );

          if (status === 409) {
            showMessage({
              t: "warning",
              title: "DNI ya registrado",
              m: backendMessage,
            });

            return;
          }

          if (
            status === 400 ||
            status === 422
          ) {
            showMessage({
              t: "warning",
              title:
                "Información inválida",
              m: backendMessage,
            });

            return;
          }

          if (status === 404) {
            showMessage({
              t: "error",
              title:
                "Información no encontrada",
              m: backendMessage,
            });

            return;
          }

          if (!error.response) {
            showMessage({
              t: "error",
              title:
                "No hay conexión con el servidor",
              m:
                "No se pudo conectar con el sistema. Verifique su conexión e intente nuevamente.",
            });

            return;
          }

          showMessage({
            t: "error",
            title:
              "No se pudo completar el registro",
            m: backendMessage,
          });

          return;
        }

        showMessage({
          t: "error",
          title: "Error inesperado",
          m:
            "Ocurrió un error inesperado durante el registro. Intente nuevamente.",
        });
      }
    };

  const invalidSubmit:
    SubmitErrorHandler<FormValues> =
    (formErrors) => {
      showMessage({
        t: "warning",
        title: "Revise el formulario",
        m: getFirstFormError(
          formErrors,
        ),
      });
    };

  /**
   * Pantalla posterior al registro.
   */
  if (registrationSuccess) {
    const participantName =
      `${registrationSuccess.nombres} ${registrationSuccess.apellidos}`;

    return (
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-blue-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-2xl">
            <section className="bg-emerald-600 px-6 py-10 text-center text-white">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl font-black text-emerald-600 shadow-lg">
                ✓
              </div>

              <h1 className="mt-6 text-4xl font-black">
                ¡Registro exitoso!
              </h1>

              <p className="mt-3 text-lg text-emerald-50">
                Su inscripción fue completada correctamente.
              </p>
            </section>

            <section className="px-6 py-8 md:px-10">
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Participante
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  {participantName}
                </h2>

                <p className="mt-1 text-slate-600">
                  DNI:{" "}
                  {
                    registrationSuccess.dni
                  }
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-200 text-2xl">
                    🪪
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-amber-900">
                      No olvide llevar su DNI
                    </h3>

                    <p className="mt-2 leading-7 text-amber-800">
                      El día del evento deberá presentar su DNI físico para validar su identidad y registrar su asistencia.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-black text-slate-900">
                  Información del evento
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-500">
                      EVENTO
                    </p>

                    <p className="mt-1 font-black text-slate-900">
                      {
                        eventConfig.nombre
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-500">
                      FECHA
                    </p>

                    <p className="mt-1 font-black text-slate-900">
                      {
                        eventConfig.fecha
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-500">
                      HORA DEL EVENTO
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Ingreso desde las{" "}
                      {
                        eventConfig.horaIngreso
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-500">
                      LUGAR
                    </p>

                    <p className="mt-1 font-black text-slate-900">
                      {
                        eventConfig.lugar
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-blue-50 p-6">
                <h3 className="font-black text-blue-900">
                  Recomendaciones importantes
                </h3>

                <ul className="mt-4 space-y-3">
                  {eventConfig.recomendaciones.map(
                    (
                      recommendation,
                    ) => (
                      <li
                        key={
                          recommendation
                        }
                        className="flex items-start gap-3 text-blue-900"
                      >
                        <span className="mt-1 font-black text-blue-600">
                          ✓
                        </span>

                        <span>
                          {
                            recommendation
                          }
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRegistrationSuccess(
                    null,
                  );

                  window.scrollTo({
                    top: 0,
                    behavior:
                      "smooth",
                  });
                }}
                className="mt-8 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 font-black text-slate-700 transition hover:bg-slate-50"
              >
                Registrar a otra persona
              </button>
            </section>
          </div>
        </div>
      </main>
    );
  }

  /**
   * Formulario público.
   */
  return (
    <main className="mx-auto max-w-4xl px-4 pb-12 pt-8">
      <Card>
        <div className="mb-8">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
            Inscripción oficial
          </span>

          <h1 className="mt-4 text-3xl font-black text-slate-950">
            Registro de participantes
          </h1>

          <p className="mt-2 text-slate-600">
            Complete sus datos. Los nombres se consultan automáticamente al completar el DNI.
          </p>
        </div>

        {message && (() => {
          const styles =
            getMessageStyles(
              message.t,
            );

          return (
            <div
              role={
                message.t ===
                "error"
                  ? "alert"
                  : "status"
              }
              aria-live={
                message.t ===
                "error"
                  ? "assertive"
                  : "polite"
              }
              className={`mb-7 overflow-hidden rounded-2xl border shadow-lg ${styles.container}`}
            >
              <div className="flex items-start gap-4 p-5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-black shadow-sm ${styles.icon}`}
                  aria-hidden="true"
                >
                  {styles.symbol}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-black md:text-lg">
                    {message.title ??
                      getDefaultMessageTitle(
                        message.t,
                      )}
                  </h2>

                  <p className="mt-1 text-sm leading-6 md:text-base">
                    {message.m}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMessage(null)
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl font-bold leading-none opacity-60 transition hover:bg-black/10 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
                  aria-label="Cerrar mensaje"
                  title="Cerrar mensaje"
                >
                  ×
                </button>
              </div>

              <div
                className={`h-1.5 w-full ${styles.bar}`}
              />
            </div>
          );
        })()}

        <form
          onSubmit={handleSubmit(
            submit,
            invalidSubmit,
          )}
          className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2"
        >
          {/* DNI */}
          <div className="md:col-span-2">
            <label className="mb-2 block font-semibold">
              DNI
            </label>

            <div className="relative">
              <Input
                {...register(
                  "dni",
                  {
                    onChange: () => {
                      if (message) {
                        setMessage(null);
                      }
                    },
                  },
                )}
                maxLength={8}
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ingrese los 8 dígitos"
                className={`pr-14 ${
                  errors.dni
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : dniOk
                      ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100"
                      : ""
                }`}
                onInput={(
                  event,
                ) => {
                  event.currentTarget.value =
                    event.currentTarget.value
                      .replace(
                        /\D/g,
                        "",
                      )
                      .slice(
                        0,
                        8,
                      );
                }}
              />

              <span className="absolute inset-y-0 right-4 flex items-center">
                {loadingDni && (
                  <span
                    className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"
                    aria-label="Consultando DNI"
                  />
                )}

                {!loadingDni &&
                  dniOk && (
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-700"
                      title="DNI validado"
                    >
                      ✓
                    </span>
                  )}
              </span>
            </div>

            {errors.dni && (
              <small className="mt-1 block text-red-600">
                {
                  errors.dni
                    .message
                }
              </small>
            )}
          </div>

          {/* Nombres */}
          <div>
            <label className="mb-2 block font-semibold">
              Nombres
            </label>

     <Input
  {...register(
    "nombres",
  )}
  readOnly={
    dniOk ||
    loadingDni
  }
  placeholder={
    loadingDni
      ? "Consultando DNI..."
      : dniManual
        ? "Ingrese los nombres manualmente"
        : "Los nombres se completarán con el DNI"
  }
  className={
    dniOk ||
    loadingDni
      ? "bg-slate-50"
      : ""
  }
/>

            {errors.nombres && (
              <small className="mt-1 block text-red-600">
                {
                  errors.nombres
                    .message
                }
              </small>
            )}
          </div>

          {/* Apellidos */}
          <div>
            <label className="mb-2 block font-semibold">
              Apellidos
            </label>

       <Input
  {...register(
    "apellidos",
  )}
  readOnly={
    dniOk ||
    loadingDni
  }
  placeholder={
    loadingDni
      ? "Consultando DNI..."
      : dniManual
        ? "Ingrese los apellidos manualmente"
        : "Los apellidos se completarán con el DNI"
  }
  className={
    dniOk ||
    loadingDni
      ? "bg-slate-50"
      : ""
  }
/>

            {errors.apellidos && (
              <small className="mt-1 block text-red-600">
                {
                  errors.apellidos
                    .message
                }
              </small>
            )}
          </div>

          {dniManual && (
            <div className="md:col-span-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-bold">
                Consulta automática no disponible
              </p>

              <p className="mt-1">
                Verifique que el DNI esté correctamente escrito e ingrese los nombres y apellidos manualmente.
              </p>
            </div>
          )}

          {/* Fecha de nacimiento */}
          <div>
            <label className="mb-2 block font-semibold">
              Fecha de nacimiento
            </label>

            <Input
              type="date"
              max={new Date()
                .toISOString()
                .slice(0, 10)}
              {...register(
                "fechaNacimiento",
              )}
            />

            {errors.fechaNacimiento && (
              <small className="mt-1 block text-red-600">
                {
                  errors
                    .fechaNacimiento
                    .message
                }
              </small>
            )}
          </div>

          {/* Sexo */}
          <div>
            <label className="mb-2 block font-semibold">
              Sexo
            </label>

            <Select
              {...register(
                "sexo",
              )}
            >
              <option value="">
                Seleccione
              </option>

              <option value="MASCULINO">
                Masculino
              </option>

              <option value="FEMENINO">
                Femenino
              </option>
            </Select>

            {errors.sexo && (
              <small className="mt-1 block text-red-600">
                {
                  errors.sexo
                    .message
                }
              </small>
            )}
          </div>

          {/* Celular */}
          <div>
            <label className="mb-2 block font-semibold">
              Celular
            </label>

            <Input
              {...register(
                "celular",
              )}
              maxLength={9}
              inputMode="numeric"
              placeholder="9XXXXXXXX"
              onInput={(
                event,
              ) => {
                event.currentTarget.value =
                  event.currentTarget.value
                    .replace(
                      /\D/g,
                      "",
                    )
                    .slice(
                      0,
                      9,
                    );
              }}
            />

            {errors.celular && (
              <small className="mt-1 block text-red-600">
                {
                  errors.celular
                    .message
                }
              </small>
            )}
          </div>

          {/* Región */}
          <div>
            <label className="mb-2 block font-semibold">
              Región
            </label>

            <Select
              {...register(
                "regionId",
              )}
              disabled={
                loadingCatalogs
              }
            >
              <option value="">
                {loadingCatalogs
                  ? "Cargando regiones..."
                  : "Seleccione una región"}
              </option>

              {catalogs.regions.map(
                (region) => (
                  <option
                    key={
                      region.id
                    }
                    value={
                      region.id
                    }
                  >
                    {
                      region.nombre
                    }
                  </option>
                ),
              )}
            </Select>

            {errors.regionId && (
              <small className="mt-1 block text-red-600">
                {
                  errors.regionId
                    .message
                }
              </small>
            )}
          </div>

          {/* Región eclesiástica */}
          {!isOtherRegion && (
            <div>
              <label className="mb-2 block font-semibold">
                Región eclesiástica
                (Iglesia)
              </label>

              <Select
                {...register(
                  "iglesiaId",
                )}
                disabled={
                  !regionId ||
                  loadingChurches
                }
              >
                <option value="">
                  {!regionId
                    ? "Seleccione primero una región"
                    : loadingChurches
                      ? "Cargando regiones eclesiásticas..."
                      : churches.length ===
                          0
                        ? "No hay regiones eclesiásticas"
                        : "Seleccione una región eclesiástica"}
                </option>

                {churches.map(
                  (church) => (
                    <option
                      key={
                        church.id
                      }
                      value={
                        church.id
                      }
                    >
                      {
                        church.nombre
                      }
                    </option>
                  ),
                )}
              </Select>
            </div>
          )}

          {/* Región manual */}
          {isOtherRegion && (
            <>
              <div>
                <label className="mb-2 block font-semibold">
                  Especifique la región
                </label>

                <Input
                  {...register(
                    "regionManual",
                  )}
                  placeholder="Ingrese la región"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Región eclesiástica o iglesia
                </label>

                <Input
                  {...register(
                    "iglesiaManual",
                  )}
                  placeholder="Ingrese la región eclesiástica"
                />
              </div>
            </>
          )}

          {/* Cargo */}
          <div>
            <label className="mb-2 block font-semibold">
              Cargo
            </label>

            <Select
              {...register(
                "cargoId",
              )}
              disabled={
                loadingCatalogs
              }
            >
              <option value="">
                Seleccione un cargo
              </option>

              {catalogs.positions.map(
                (position) => (
                  <option
                    key={
                      position.id
                    }
                    value={
                      position.id
                    }
                  >
                    {
                      position.nombre
                    }
                  </option>
                ),
              )}
            </Select>

            {errors.cargoId && (
              <small className="mt-1 block text-red-600">
                {
                  errors.cargoId
                    .message
                }
              </small>
            )}
          </div>

          {/* Cargo manual */}
          {isOtherCargo && (
            <div>
              <label className="mb-2 block font-semibold">
                Especifique el cargo
              </label>

              <Input
                {...register(
                  "cargoManual",
                )}
                placeholder="Ingrese el cargo"
              />
            </div>
          )}

          {/* Reglamento */}
          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                {...register(
                  "aceptaReglamento",
                )}
              />

              <span>
                Acepto cumplir con el reglamento del evento.
              </span>
            </label>

            {errors.aceptaReglamento && (
              <small className="mt-2 block text-red-600">
                {
                  errors
                    .aceptaReglamento
                    .message
                }
              </small>
            )}
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              loadingCatalogs ||
              loadingDni ||
              !(dniOk || dniManual)
            }
            className="md:col-span-2"
          >
            {isSubmitting
              ? "Registrando..."
              : loadingDni
                ? "Validando DNI..."
                : dniOk || dniManual
                  ? "Completar inscripción"
                  : "Ingrese y valide su DNI"}
          </Button>
        </form>
      </Card>
    </main>
  );
}