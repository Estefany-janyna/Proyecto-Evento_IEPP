import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Card,
} from "../components/ui";

import {
  api,
} from "../lib/api";

import {
  reportService,
} from "../services";

interface Summary {
  participants: number;
  attendance: number;
  breakfasts: number;
  dinners: number;
  redemptions: number;
}

type ReportValue =
  | string
  | number
  | null
  | undefined;

type ReportRow =
  Record<string, ReportValue>;

interface Message {
  type:
    | "success"
    | "error";

  text: string;
}

interface SummaryCard {
  label: string;
  value: number;
  description: string;
}

const columnLabels: Record<
  string,
  string
> = {
  region: "Región",
  iglesia: "Iglesia",

  registrados: "Registrados",
  inscritos: "Inscritos",
  confirmados: "Confirmados",
  asistentes: "Asistentes",

  no_asistentes:
    "No asistentes",

  noAsistentes:
    "No asistentes",

  desayunos: "Desayunos",
  cenas: "Cenas",
  canjes: "Canjes",

  porcentaje:
    "Porcentaje",

  porcentaje_asistencia:
    "% de asistencia",

  porcentajeAsistencia:
    "% de asistencia",

  numeroPuesto:
    "N.º de puesto",

  numero_puesto:
    "N.º de puesto",

  encargado:
    "Encargado",

  celular:
    "Celular",

  platosAsignados:
    "Platos asignados",

  platos_asignados:
    "Platos asignados",

  platosEntregados:
    "Platos entregados",

  platos_entregados:
    "Platos entregados",

  platosDisponibles:
    "Disponibles",

  platos_disponibles:
    "Disponibles",

  codigo:
    "Código",

  colaborador:
    "Colaborador",

  puesto:
    "Puesto",

  fecha:
    "Fecha",

  hora:
    "Hora",

  estado:
    "Estado",
};

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    axios.isAxiosError(
      error,
    )
  ) {
    const backendMessage =
      error.response?.data
        ?.message;

    if (
      typeof backendMessage ===
        "string" &&
      backendMessage.trim()
    ) {
      return backendMessage;
    }

    if (!error.response) {
      return "No se pudo conectar con el servidor. Verifique que el backend esté iniciado.";
    }
  }

  return fallback;
}

function getColumnLabel(
  key: string,
): string {
  const configuredLabel =
    columnLabels[key];

  if (configuredLabel) {
    return configuredLabel;
  }

  return key
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatCellValue(
  key: string,
  value: ReportValue,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (
    key
      .toLowerCase()
      .includes(
        "porcentaje",
      )
  ) {
    const numberValue =
      Number(value);

    if (
      Number.isFinite(
        numberValue,
      )
    ) {
      return `${numberValue}%`;
    }
  }

  return String(value);
}

export function ReportsPage() {
  const [
    summary,
    setSummary,
  ] = useState<Summary>({
    participants: 0,
    attendance: 0,
    breakfasts: 0,
    dinners: 0,
    redemptions: 0,
  });

  const [
    regions,
    setRegions,
  ] = useState<ReportRow[]>(
    [],
  );

  const [
    churches,
    setChurches,
  ] = useState<ReportRow[]>(
    [],
  );

  const [
    stalls,
    setStalls,
  ] = useState<ReportRow[]>(
    [],
  );

  const [
    redemptions,
    setRedemptions,
  ] = useState<ReportRow[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    downloading,
    setDownloading,
  ] = useState<
    "xlsx" | "pdf" | null
  >(null);

  const [
    message,
    setMessage,
  ] = useState<Message | null>(
    null,
  );

  const loadReports =
    async () => {
      try {
        setLoading(true);
        setMessage(null);

        const [
          summaryResult,
          regionsResult,
          churchesResult,
          stallsResult,
          redemptionsResult,
        ] =
          await Promise.all([
            reportService.summary(),
            reportService.regions(),
            reportService.churches(),
            reportService.stalls(),
            reportService.redemptions(),
          ]);

        setSummary({
          participants:
            Number(
              summaryResult
                ?.participants ??
                0,
            ),

          attendance:
            Number(
              summaryResult
                ?.attendance ??
                0,
            ),

          breakfasts:
            Number(
              summaryResult
                ?.breakfasts ??
                0,
            ),

          dinners:
            Number(
              summaryResult
                ?.dinners ??
                0,
            ),

          redemptions:
            Number(
              summaryResult
                ?.redemptions ??
                0,
            ),
        });

        setRegions(
          Array.isArray(
            regionsResult,
          )
            ? regionsResult
            : [],
        );

        setChurches(
          Array.isArray(
            churchesResult,
          )
            ? churchesResult
            : [],
        );

        setStalls(
          Array.isArray(
            stallsResult,
          )
            ? stallsResult
            : [],
        );

        setRedemptions(
          Array.isArray(
            redemptionsResult,
          )
            ? redemptionsResult
            : [],
        );
      } catch (
        error: unknown
      ) {
        setSummary({
          participants: 0,
          attendance: 0,
          breakfasts: 0,
          dinners: 0,
          redemptions: 0,
        });

        setRegions([]);
        setChurches([]);
        setStalls([]);
        setRedemptions([]);

        setMessage({
          type: "error",

          text:
            getErrorMessage(
              error,
              "No se pudieron cargar los reportes.",
            ),
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadReports();
  }, []);

  const attendancePercentage =
    useMemo(() => {
      if (
        summary.participants <=
        0
      ) {
        return 0;
      }

      return Number(
        (
          (summary.attendance /
            summary.participants) *
          100
        ).toFixed(1),
      );
    }, [
      summary.attendance,
      summary.participants,
    ]);

  const summaryCards:
    SummaryCard[] = [
      {
        label:
          "Participantes",

        value:
          summary.participants,

        description:
          "Total de inscritos",
      },
      {
        label:
          "Asistencias",

        value:
          summary.attendance,

        description:
          `${attendancePercentage}% de participación`,
      },
      {
        label:
          "Desayunos",

        value:
          summary.breakfasts,

        description:
          "Entregas realizadas",
      },
      {
        label:
          "Cenas",

        value:
          summary.dinners,

        description:
          "Entregas realizadas",
      },
      {
        label:
          "Canjes",

        value:
          summary.redemptions,

        description:
          "Canjes procesados",
      },
    ];

  const download =
    async (
      format:
        | "xlsx"
        | "pdf",
    ) => {
      try {
        setDownloading(
          format,
        );

        setMessage(null);

        const response =
          await api.get(
            `/reports/export/participants.${format}`,
            {
              responseType:
                "blob",
            },
          );

        const rawContentType =
          response.headers[
            "content-type"
          ];

        const contentType =
          typeof rawContentType ===
          "string"
            ? rawContentType
            : undefined;

        const blob =
          new Blob(
            [
              response.data,
            ],
            {
              type:
                contentType ??
                (format ===
                "xlsx"
                  ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  : "application/pdf"),
            },
          );

        const url =
          URL.createObjectURL(
            blob,
          );

        const anchor =
          document.createElement(
            "a",
          );

        anchor.href =
          url;

        anchor.download =
          format === "xlsx"
            ? "participantes-iepp-2026.xlsx"
            : "participantes-iepp-2026.pdf";

        document.body.appendChild(
          anchor,
        );

        anchor.click();

        anchor.remove();

        URL.revokeObjectURL(
          url,
        );

        setMessage({
          type: "success",

          text:
            format === "xlsx"
              ? "El archivo Excel fue generado correctamente."
              : "El archivo PDF fue generado correctamente.",
        });
      } catch (
        error: unknown
      ) {
        setMessage({
          type: "error",

          text:
            getErrorMessage(
              error,
              format === "xlsx"
                ? "No se pudo exportar el Excel."
                : "No se pudo exportar el PDF.",
            ),
        });
      } finally {
        setDownloading(
          null,
        );
      }
    };

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950">
            Reportes IEPP 2026
          </h1>

          <p className="mt-2 text-slate-600">
            Resumen general de participantes,
            asistencias, alimentación,
            puestos y canjes.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadReports()
          }
          disabled={loading}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Actualizando..."
            : "Actualizar datos"}
        </button>
      </div>

      {message && (
        <div
          role={
            message.type ===
            "error"
              ? "alert"
              : "status"
          }
          className={`mt-6 flex items-start justify-between gap-4 rounded-2xl border p-5 shadow-sm ${
            message.type ===
            "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-red-300 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black text-white ${
                message.type ===
                "success"
                  ? "bg-emerald-600"
                  : "bg-red-600"
              }`}
            >
              {message.type ===
              "success"
                ? "✓"
                : "!"}
            </div>

            <div>
              <p className="font-black">
                {message.type ===
                "success"
                  ? "Operación completada"
                  : "Ocurrió un problema"}
              </p>

              <p className="mt-1 text-sm leading-6">
                {
                  message.text
                }
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setMessage(
                null,
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xl font-black opacity-60 transition hover:bg-black/10 hover:opacity-100"
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map(
          (card) => (
            <Card
              key={
                card.label
              }
            >
              <p className="text-sm font-semibold text-slate-500">
                {card.label}
              </p>

              {loading ? (
                <div className="mt-3 h-10 w-20 animate-pulse rounded-lg bg-slate-200" />
              ) : (
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {
                    card.value
                  }
                </p>
              )}

              <p className="mt-2 text-xs text-slate-500">
                {
                  card.description
                }
              </p>
            </Card>
          ),
        )}
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            void download(
              "xlsx",
            )
          }
          disabled={
            downloading !==
              null ||
            loading
          }
          className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ===
          "xlsx"
            ? "Generando Excel..."
            : "Exportar Excel"}
        </button>

        <button
          type="button"
          onClick={() =>
            void download(
              "pdf",
            )
          }
          disabled={
            downloading !==
              null ||
            loading
          }
          className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ===
          "pdf"
            ? "Generando PDF..."
            : "Exportar PDF"}
        </button>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <ReportTable
          title="Reporte por región"
          description="Participantes registrados y asistentes agrupados por región."
          rows={regions}
          loading={loading}
        />

        <ReportTable
          title="Ranking de iglesias"
          description="Iglesias con mayor cantidad de registrados y asistentes."
          rows={churches}
          loading={loading}
        />

        <ReportTable
          title="Reporte de puestos"
          description="Disponibilidad, platos asignados y entregas realizadas por cada puesto."
          rows={stalls}
          loading={loading}
        />

        <ReportTable
          title="Reporte de canjes"
          description="Historial general de códigos canjeados en los puestos."
          rows={redemptions}
          loading={loading}
        />
      </section>
    </main>
  );
}

interface ReportTableProps {
  title: string;
  description: string;
  rows: ReportRow[];
  loading: boolean;
}

function ReportTable({
  title,
  description,
  rows,
  loading,
}: ReportTableProps) {
  const columns =
    useMemo(
      () =>
        rows.length > 0
          ? Object.keys(
              rows[0],
            )
          : [],
      [rows],
    );

  return (
    <Card>
      <div>
        <h2 className="text-xl font-black text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-50">
              {columns.map(
                (column) => (
                  <th
                    key={
                      column
                    }
                    className="whitespace-nowrap px-3 py-3 font-black text-slate-700"
                  >
                    {getColumnLabel(
                      column,
                    )}
                  </th>
                ),
              )}

              {!loading &&
                columns.length ===
                  0 && (
                  <th className="px-3 py-3 font-black text-slate-700">
                    Información
                  </th>
                )}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({
                length: 5,
              }).map(
                (
                  _,
                  rowIndex,
                ) => (
                  <tr
                    key={
                      rowIndex
                    }
                    className="border-b border-slate-200"
                  >
                    {Array.from({
                      length:
                        Math.max(
                          columns.length,
                          4,
                        ),
                    }).map(
                      (
                        __,
                        cellIndex,
                      ) => (
                        <td
                          key={
                            cellIndex
                          }
                          className="px-3 py-4"
                        >
                          <div className="h-5 animate-pulse rounded bg-slate-200" />
                        </td>
                      ),
                    )}
                  </tr>
                ),
              )}

            {!loading &&
              rows.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      Math.max(
                        columns.length,
                        1,
                      )
                    }
                    className="px-3 py-10 text-center text-slate-500"
                  >
                    No hay información disponible.
                  </td>
                </tr>
              )}

            {!loading &&
              rows.map(
                (
                  row,
                  rowIndex,
                ) => (
                  <tr
                    key={
                      rowIndex
                    }
                    className="border-b border-slate-200 transition hover:bg-slate-50"
                  >
                    {columns.map(
                      (
                        column,
                      ) => (
                        <td
                          key={
                            column
                          }
                          className="px-3 py-3 text-slate-700"
                        >
                          {formatCellValue(
                            column,
                            row[
                              column
                            ],
                          )}
                        </td>
                      ),
                    )}
                  </tr>
                ),
              )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}