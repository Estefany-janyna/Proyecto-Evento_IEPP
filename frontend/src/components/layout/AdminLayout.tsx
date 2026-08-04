import {
  useEffect,
  useRef,
  useState,
} from "react";

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

interface QuickAccessItem {
  label: string;
  description: string;
  path: string;
}

const quickAccessItems: QuickAccessItem[] = [
  {
    label: "Registro público",
    description:
      "Formulario para registrar participantes.",
    path: "/registro",
  },
  {
    label: "Personal operativo",
    description:
      "Acceso para asistencia, desayuno y cena.",
    path: "/personal/login",
  },
  {
    label: "Colaborador",
    description:
      "Acceso al panel de colaboradores.",
    path: "/colaborador/login",
  },
  {
    label: "Puesto de comida",
    description:
      "Acceso para los puestos de comida.",
    path: "/puesto/login",
  },
  {
    label: "Administrador y reportes",
    description:
      "Acceso al panel administrativo y reportes.",
    path: "/admin/login",
  },
];

/**
 * Menús según el módulo actual.
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
        label: "Colaboradores",
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

  const accessMenuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    showQuickAccess,
    setShowQuickAccess,
  ] = useState(false);

  const menuItems =
    getMenuItems(
      location.pathname,
    );

  const panelTitle =
    getPanelTitle(
      location.pathname,
    );

  /**
   * Cerrar el menú al hacer clic
   * fuera de él.
   */
  useEffect(() => {
    const closeMenu = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as Node;

      if (
        accessMenuRef.current &&
        !accessMenuRef.current.contains(
          target,
        )
      ) {
        setShowQuickAccess(
          false,
        );
      }
    };

    document.addEventListener(
      "mousedown",
      closeMenu,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeMenu,
      );
    };
  }, []);

  /**
   * Abrir una vista en otra pestaña.
   *
   * Se usan rutas relativas para que
   * funcione tanto en localhost como
   * en producción.
   */
  const openQuickAccess = (
    path: string,
  ) => {
    const url =
      new URL(
        path,
        window.location.origin,
      ).toString();

    window.open(
      url,
      "_blank",
      "noopener,noreferrer",
    );

    setShowQuickAccess(
      false,
    );
  };

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
          {/* LOGO Y TÍTULO */}
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow">
              <img
                src="/logo-iepp.png"
                alt="Logo IEPP"
                className="h-full w-full object-contain"
              />
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

          {/* MENÚ */}
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
                      "rounded-xl px-4 py-2 text-sm font-bold transition",
                      isActive
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    ].join(
                      " ",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}

            {/* ACCESOS RÁPIDOS */}
            {location.pathname.startsWith(
              "/admin",
            ) && (
              <div
                ref={
                  accessMenuRef
                }
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowQuickAccess(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                    showQuickAccess
                      ? "bg-emerald-600 text-white"
                      : "border border-emerald-500 text-emerald-300 hover:bg-emerald-600 hover:text-white"
                  }`}
                  aria-expanded={
                    showQuickAccess
                  }
                  aria-haspopup="menu"
                >
                  Accesos

                  <span
                    className={`text-xs transition ${
                      showQuickAccess
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {showQuickAccess && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-[100] mt-3 w-80 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl"
                  >
                    <div className="border-b border-slate-700 px-3 py-3">
                      <p className="font-black text-white">
                        Accesos del sistema
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Abrir cada vista en una pestaña nueva.
                      </p>
                    </div>

                    <div className="mt-2 space-y-1">
                      {quickAccessItems.map(
                        (item) => (
                          <button
                            key={
                              item.path
                            }
                            type="button"
                            role="menuitem"
                            onClick={() =>
                              openQuickAccess(
                                item.path,
                              )
                            }
                            className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-slate-800"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-black text-white">
                                  {
                                    item.label
                                  }
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                  {
                                    item.description
                                  }
                                </p>
                              </div>

                              <span className="shrink-0 text-lg text-emerald-400">
                                ↗
                              </span>
                            </div>
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={logout}
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