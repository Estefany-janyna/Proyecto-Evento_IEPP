import { useEffect, useState } from 'react';
import { Card } from '../components/ui';
import { api } from '../lib/api';
import { reportService } from '../services';

export function ReportsPage() {
  const [summary, setSummary] = useState<any>({});
  const [regions, setRegions] = useState<any[]>([]);
  const [churches, setChurches] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      reportService.summary(),
      reportService.regions(),
      reportService.churches(),
    ]).then(([s, r, c]) => {
      setSummary(s);
      setRegions(r);
      setChurches(c);
    });
  }, []);

  const download = async (format: 'xlsx' | 'pdf') => {
    const response = await api.get(`/reports/export/participants.${format}`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `participantes.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    ['Participantes', summary.participants],
    ['Asistencias', summary.attendance],
    ['Desayunos', summary.breakfasts],
    ['Cenas', summary.dinners],
    ['Canjes', summary.redemptions],
  ];

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-black">Reportes IEPP 2026</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((item) => (
          <Card key={item[0]}>
            <div className="text-sm text-slate-500">{item[0]}</div>
            <div className="mt-2 text-3xl font-black">{item[1] ?? 0}</div>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <button className="rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white" onClick={() => download('xlsx')}>Exportar Excel</button>
        <button className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white" onClick={() => download('pdf')}>Exportar PDF</button>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Report title="Reporte por región" rows={regions} />
        <Report title="Ranking de iglesias" rows={churches} />
      </div>
    </main>
  );
}

function Report({ title, rows }: { title: string; rows: any[] }) {
  return (
    <Card>
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>{rows[0] && Object.keys(rows[0]).map((key) => <th key={key} className="border-b p-2">{key}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>{Object.values(row).map((value: any, cell) => <td key={cell} className="border-b p-2">{String(value)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
