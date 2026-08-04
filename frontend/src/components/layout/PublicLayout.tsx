import {
  Link,
  NavLink,
  Outlet,
} from "react-router-dom";

import {
  IEPPLogo,
} from "../IEPPLogo";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/registro"
            aria-label="Ir al registro"
          >
            <IEPPLogo
              size="small"
              subtitle="Inscripción oficial"
            />
          </Link>

          <nav>
            <NavLink
              to="/registro"
              className={({ isActive }) =>
                [
                  "rounded-xl px-5 py-3 text-sm font-bold transition",
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                ].join(" ")
              }
            >
              Registro
            </NavLink>
          </nav>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-5 text-center">
        <Link
          to="/personal/login"
          className="text-xs text-slate-500 transition hover:text-slate-300"
        >
          Acceso del personal
        </Link>
      </footer>
    </div>
  );
}