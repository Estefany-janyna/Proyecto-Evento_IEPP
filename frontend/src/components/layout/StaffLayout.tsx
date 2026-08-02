import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

type StaffRole =
  | "ASISTENCIA"
  | "DESAYUNO"
  | "CENA";

interface StaffSession {
  id?: number;
  name?: string;
  celular?: string;
  kind?: "STAFF";
  role?: StaffRole;
}

interface MenuItem {
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    label: "Asistencia",
    path: "/asistencia",
  },
  {
    label: "Desayuno",
    path: "/desayuno",
  },
  {
    label: "Cena",
    path: "/cena",
  },
];

function readStaffSession(): StaffSession {
  try {
    const storedSession =
      localStorage.getItem("session");

    if (!storedSession) {
      return {};
    }

    return JSON.parse(
      storedSession,
    ) as StaffSession;
  } catch {
    return {};
  }
}

export function StaffLayout() {
  const navigate = useNavigate();

  const session =
    readStaffSession();

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
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-white shadow-lg">
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
                Personal operativo
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {menuItems.map(
              (item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({
                    isActive,
                  }) =>
                    [
                      "rounded-xl px-5 py-3 text-sm font-bold transition",
                      isActive
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">
                {session.name ??
                  "Personal operativo"}
              </p>

              <p className="text-xs text-blue-300">
                PERSONAL OPERATIVO
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-white transition hover:border-red-500 hover:bg-red-600"
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