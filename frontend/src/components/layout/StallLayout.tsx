import {
  Outlet,
  useNavigate,
} from "react-router-dom";

interface StaffSession {
  id?: number;
  name?: string;

  role?:
    | "ASISTENCIA"
    | "DESAYUNO"
    | "CENA";
}

function readSession():
  StaffSession {
  try {
    return JSON.parse(
      localStorage.getItem(
        "session",
      ) ?? "{}",
    ) as StaffSession;
  } catch {
    return {};
  }
}

function getRoleLabel(
  role?: StaffSession["role"],
): string {
  if (role === "ASISTENCIA") {
    return "Control de asistencia";
  }

  if (role === "DESAYUNO") {
    return "Entrega de desayuno";
  }

  if (role === "CENA") {
    return "Entrega de cena";
  }

  return "Personal operativo";
}

export function StaffLayout() {
  const navigate =
    useNavigate();

  const session =
    readSession();

  const logout = () => {
    localStorage.removeItem(
      "token",
    );

    localStorage.removeItem(
      "session",
    );

    navigate(
      "/personal/login",
      {
        replace: true,
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-black">
              IE
            </div>

            <div>
              <p className="font-black">
                IEPP 2026
              </p>

              <p className="text-xs text-slate-400">
                {getRoleLabel(
                  session.role,
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">
                {session.name ??
                  "Personal operativo"}
              </p>

              <p className="text-xs text-slate-400">
                {session.role ?? ""}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold transition hover:border-red-500 hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}