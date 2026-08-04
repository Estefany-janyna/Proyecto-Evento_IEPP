export function AttendeeReportPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div>
        <h1 className="text-3xl font-black text-slate-950">
          Reporte general de asistentes
        </h1>

        <p className="mt-2 text-slate-600">
          Consulte los participantes registrados, su asistencia y
          la entrega de alimentos.
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Total inscritos
          </p>

          <p className="mt-2 text-3xl font-black text-slate-950">
            0
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Asistentes
          </p>

          <p className="mt-2 text-3xl font-black text-emerald-600">
            0
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            No asistentes
          </p>

          <p className="mt-2 text-3xl font-black text-amber-600">
            0
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Porcentaje de asistencia
          </p>

          <p className="mt-2 text-3xl font-black text-blue-600">
            0%
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Participantes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              La información se conectará posteriormente con el
              backend.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Actualizar
            </button>

            <button
              type="button"
              className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white transition hover:bg-emerald-700"
            >
              Exportar Excel
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">DNI</th>
                <th className="p-3">Nombres y apellidos</th>
                <th className="p-3">Región</th>
                <th className="p-3">Iglesia</th>
                <th className="p-3">Cargo</th>
                <th className="p-3">Asistencia</th>
                <th className="p-3">Desayuno</th>
                <th className="p-3">Cena</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-slate-500"
                >
                  No hay información para mostrar.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}