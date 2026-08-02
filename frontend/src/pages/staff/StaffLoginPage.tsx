import {
  useState,
} from "react";

import axios from "axios";

import {
  useNavigate,
} from "react-router-dom";

import {
  Button,
  Card,
  Input,
} from "../../components/ui";

import {
  authService,
} from "../../services";

type StaffRole =
  | "ASISTENCIA"
  | "DESAYUNO"
  | "CENA";

interface StaffUser {
  id: number;
  name: string;
  celular: string;
  kind: "STAFF";
  role: StaffRole;
}

interface StaffLoginResult {
  token: string;
  user: StaffUser;
}

export function StaffLoginPage() {
  const navigate =
    useNavigate();

  const [
    celular,
    setCelular,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    busy,
    setBusy,
  ] = useState(false);

  const submit = async (
    event:
      React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !/^9\d{8}$/.test(
        celular,
      )
    ) {
      setError(
        "Ingrese un celular válido de 9 dígitos.",
      );

      return;
    }

    if (!password.trim()) {
      setError(
        "Ingrese la contraseña.",
      );

      return;
    }

    try {
      setBusy(true);
      setError("");

      localStorage.removeItem(
        "token",
      );

      localStorage.removeItem(
        "session",
      );

      const result =
        (await authService.login(
          "staff",
          {
            celular,
            password,
          },
        )) as StaffLoginResult;

      localStorage.setItem(
        "token",
        result.token,
      );

      localStorage.setItem(
        "session",
        JSON.stringify(
          result.user,
        ),
      );

      if (
        result.user.role ===
        "ASISTENCIA"
      ) {
        navigate(
          "/asistencia",
          {
            replace: true,
          },
        );

        return;
      }

      if (
        result.user.role ===
        "DESAYUNO"
      ) {
        navigate(
          "/desayuno",
          {
            replace: true,
          },
        );

        return;
      }

      navigate(
        "/cena",
        {
          replace: true,
        },
      );
    } catch (error) {
      setError(
        axios.isAxiosError(
          error,
        )
          ? error.response?.data
              ?.message ??
            "No se pudo iniciar sesión."
          : "No se pudo iniciar sesión.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white">
            IE
          </div>

          <h1 className="mt-5 text-3xl font-black">
            Acceso del personal
          </h1>

          <p className="mt-2 text-slate-600">
            Ingrese con las credenciales asignadas por el administrador.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 font-semibold text-red-800">
            {error}
          </div>
        )}

        <form
          onSubmit={submit}
          className="mt-6 space-y-5"
        >
          <div>
            <label className="mb-2 block font-semibold">
              Celular
            </label>

            <Input
              value={celular}
              onChange={(event) =>
                setCelular(
                  event.target.value
                    .replace(
                      /\D/g,
                      "",
                    )
                    .slice(
                      0,
                      9,
                    ),
                )
              }
              maxLength={9}
              inputMode="numeric"
              autoComplete="username"
              placeholder="9XXXXXXXX"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Contraseña
            </label>

            <Input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              autoComplete="current-password"
              placeholder="Ingrese la contraseña"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full"
          >
            {busy
              ? "Ingresando..."
              : "Ingresar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}