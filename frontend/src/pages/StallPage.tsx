import {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Alert,
  Button,
  Card,
  Input,
} from "../components/ui";

import { stallService } from "../services";

interface StallData {
  id: number;
  numeroPuesto: string;
  encargado: string;
  celular: string;
  platosAsignados: number;
  platosEntregados: number;
  platosDisponibles: number;
  estado:
    | "ACTIVO"
    | "INACTIVO"
    | "SIN_DISPONIBILIDAD";
}

interface Candidate {
  id: number;
  codigo: string;
  estado: string;
  nombres: string;
  apellidos: string;
}

interface Message {
  t: "success" | "error";
  m: string;
}

export function StallPage() {
  const [
    me,
    setMe,
  ] = useState<StallData | null>(
    null,
  );

  const [
    code,
    setCode,
  ] = useState("");

  const [
    candidate,
    setCandidate,
  ] = useState<Candidate | null>(
    null,
  );

  const [
    message,
    setMessage,
  ] = useState<Message | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const getErrorMessage = (
    error: unknown,
    fallback: string,
  ): string => {
    if (axios.isAxiosError(error)) {
      return (
        error.response?.data?.message ??
        fallback
      );
    }

    return fallback;
  };

  const loadStall = useCallback(
    async () => {
      try {
        setLoading(true);

        const result =
          await stallService.me();

        setMe(result);
      } catch (error) {
        console.error(
          "Error cargando puesto:",
          error,
        );

        setMessage({
          t: "error",
          m: getErrorMessage(
            error,
            "No se pudo cargar la información del puesto.",
          ),
        });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadStall();
  }, [loadStall]);

  const validateCode = async () => {
    if (
      !/^[A-Z][0-9]{5}$/.test(code)
    ) {
      setMessage({
        t: "error",
        m: "Ingrese un código válido: una letra y cinco números.",
      });

      return;
    }

    try {
      setProcessing(true);
      setMessage(null);

      const result =
        await stallService.validate(
          code,
        );

      setCandidate(result);
    } catch (error) {
      setCandidate(null);

      setMessage({
        t: "error",
        m: getErrorMessage(
          error,
          "No se pudo validar el código.",
        ),
      });
    } finally {
      setProcessing(false);
    }
  };

  const redeemCode = async () => {
    try {
      setProcessing(true);
      setMessage(null);

      const result =
        await stallService.redeem(
          code,
        );

      setMessage({
        t: "success",
        m:
          `${result.message}. Saldo disponible: ${result.data.saldo}`,
      });

      setCandidate(null);
      setCode("");

      await loadStall();
    } catch (error) {
      setMessage({
        t: "error",
        m: getErrorMessage(
          error,
          "No se pudo realizar el canje.",
        ),
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Card>
          <p className="text-center text-slate-500">
            Cargando información del
            puesto...
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      {message && (
        <div className="mb-5">
          <Alert type={message.t}>
            {message.m}
          </Alert>
        </div>
      )}

      {!me ? (
        <Card>
          <h1 className="text-2xl font-black">
            No se pudo cargar el puesto
          </h1>

          <p className="mt-2 text-slate-600">
            Verifique la sesión o vuelva a
            iniciar sesión.
          </p>

          <Button
            type="button"
            className="mt-5"
            onClick={() =>
              void loadStall()
            }
          >
            Volver a intentar
          </Button>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black">
                Puesto{" "}
                {me.numeroPuesto}
              </h1>

              <p className="mt-1 text-slate-600">
                {me.encargado}
              </p>

              <p className="text-sm text-slate-500">
                {me.celular}
              </p>
            </div>

            <div className="text-right">
              <span className="text-sm text-slate-500">
                Platos disponibles
              </span>

              <div className="text-4xl font-black text-blue-700">
                {me.platosDisponibles}
              </div>

              <span className="text-xs font-bold text-slate-500">
                Estado: {me.estado}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <label className="mb-2 block font-semibold">
              Código del colaborador
            </label>

            <div className="flex gap-3">
              <Input
                value={code}
                onChange={(event) =>
                  setCode(
                    event.target.value
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9]/g,
                        "",
                      )
                      .slice(0, 6),
                  )
                }
                placeholder="A58321"
                maxLength={6}
              />

              <Button
                type="button"
                onClick={validateCode}
                disabled={
                  processing ||
                  code.length !== 6
                }
              >
                {processing
                  ? "Validando..."
                  : "Validar"}
              </Button>
            </div>
          </div>

          {candidate && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-xl font-bold">
                {candidate.nombres}{" "}
                {candidate.apellidos}
              </h2>

              <p className="mt-2">
                Código:{" "}
                <strong>
                  {candidate.codigo}
                </strong>
              </p>

              <p>
                Estado:{" "}
                <strong>
                  {candidate.estado}
                </strong>
              </p>

              <Button
                type="button"
                className="mt-4 w-full"
                onClick={redeemCode}
                disabled={processing}
              >
                {processing
                  ? "Procesando..."
                  : "Confirmar canje"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </main>
  );
}