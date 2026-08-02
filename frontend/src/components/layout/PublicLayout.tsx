import {
  Link,
  NavLink,
  Outlet,
} from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            to="/registro"
            className="text-xl font-black"
          >
            IEPP 2026
          </Link>

          <nav>
            <NavLink
              to="/registro"
              className={({
                isActive,
              }) =>
                [
                  "rounded-xl px-4 py-2 font-semibold transition",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-white hover:bg-white/10",
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