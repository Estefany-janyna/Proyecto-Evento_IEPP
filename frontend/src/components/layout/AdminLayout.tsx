import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

interface MenuItem {
  label: string;
  path: string;
}

/**
 * Menús según el módulo actual.
 *
 * Este layout se utiliza para:
 * - administrador
 * - colaborador
 * - puesto
 *
 * Se muestran opciones distintas
 * según la URL actual.
 */
function getMenuItems(
  pathname: string,
): MenuItem[] {
  if (
    pathname.startsWith(
      "/admin",
    )
  ) {
    return [
      {
        label: "Reportes",
        path: "/admin/reportes",
      },
      {
        label:
          "Gestión de puestos",
        path: "/admin/puestos",
      },
      {
        label:
          "Colaboradores",
        path:
          "/admin/colaboradores",
      },
      {
        label:
          "Personal operativo",
        path:
          "/admin/personal",
      },
    ];
  }

  if (
    pathname.startsWith(
      "/colaborador",
    )
  ) {
    return [
      {
        label:
          "Panel del colaborador",
        path: "/colaborador",
      },
    ];
  }

  if (
    pathname.startsWith(
      "/puesto",
    )
  ) {
    return [
      {
        label:
          "Operación del puesto",
        path: "/puesto",
      },
    ];
  }

  return [];
}

function getPanelTitle(
  pathname: string,
): string {
  if (
    pathname.startsWith(
      "/admin",
    )
  ) {
    return "Panel administrativo";
  }

  if (
    pathname.startsWith(
      "/colaborador",
    )
  ) {
    return "Panel del colaborador";
  }

  if (
    pathname.startsWith(
      "/puesto",
    )
  ) {
    return "Panel del puesto";
  }

  return "IEPP 2026";
}

export function AdminLayout() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const menuItems =
    getMenuItems(
      location.pathname,
    );

  const panelTitle =
    getPanelTitle(
      location.pathname,
    );

  const logout = () => {
    localStorage.removeItem(
      "token",
    );

    localStorage.removeItem(
      "session",
    );

    if (
      location.pathname.startsWith(
        "/admin",
      )
    ) {
      navigate(
        "/admin/login",
        {
          replace: true,
        },
      );

      return;
    }

    if (
      location.pathname.startsWith(
        "/colaborador",
      )
    ) {
      navigate(
        "/colaborador/login",
        {
          replace: true,
        },
      );

      return;
    }

    navigate(
      "/puesto/login",
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black">
              IE
            </div>

            <div>
              <p className="font-black">
                IEPP 2026
              </p>

              <p className="text-xs text-slate-400">
                {panelTitle}
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {menuItems.map(
              (item) => (
                <NavLink
                  key={
                    item.path
                  }
                  to={
                    item.path
                  }
                  className={({
                    isActive,
                  }) =>
                    [
                      "rounded-xl px-4 py-2 text-sm font-bold transition",
                      isActive
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    ].join(
                      " ",
                    )
                  }
                >
                  {
                    item.label
                  }
                </NavLink>
              ),
            )}

            <button
              type="button"
              onClick={
                logout
              }
              className="ml-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-white transition hover:border-red-500 hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}