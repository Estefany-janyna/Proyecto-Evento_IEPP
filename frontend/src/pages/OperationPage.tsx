import { useState } from "react";
import axios from "axios";

import {
  Alert,
  Button,
  Card,
  Input,
} from "../components/ui";

import {
  attendanceService,
  mealService,
} from "../services";

type OperationMode =
  | "ASISTENCIA"
  | "DESAYUNO"
  | "CENA";

interface OperationPageProps {
  mode: OperationMode;
}

interface Message {
  type:
    | "success"
    | "error"
    | "info";

  text: string;
}

interface Participant {
  dni: string;
  nombres: string;
  apellidos: string;
}

interface Attendance {
  hora?: string;
}

interface OperationData {
  participant: Participant;
  attendance?: Attendance | null;
  hasAttendance?: boolean;
}

export function OperationPage({
  mode,
}: OperationPageProps) {
  const [
    dni,
    setDni,
  ] = useState("");

  const [
    data,
    setData,
  ] = useState<OperationData | null>(
    null,
  );

  const [
    message,
    setMessage,
  ] = useState<Message | null>(
    null,
  );

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [
    busy,
    setBusy,
  ] = useState(false);

  /**
   * Obtiene un mensaje seguro desde
   * cualquier respuesta del backend.
   */
  const getErrorMessage = (
    error: unknown,
    fallback: string,
  ): string => {
    if (!axios.isAxiosError(error)) {
      return fallback;
    }

    const responseData =
      error.response?.data;

    if (
      typeof responseData?.message ===
        "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }

    if (
      typeof responseData?.error ===
        "string" &&
      responseData.error.trim()
    ) {
      return responseData.error;
    }

    if (
      typeof responseData?.detail ===
        "string" &&
      responseData.detail.trim()
    ) {
      return responseData.detail;
    }

    return fallback;
  };

  const getTitle = (): string => {
    if (mode === "ASISTENCIA") {
      return "Confirmación de asistencia";
    }

    if (mode === "DESAYUNO") {
      return "Entrega de desayuno";
    }

    return "Entrega de cena";
  };

  const search = async () => {
    const cleanDni =
      dni.trim();

    if (
      !/^\d{8}$/.test(
        cleanDni,
      )
    ) {
      setData(null);

      setMessage({
        type: "error",
        text:
          "Ingrese un DNI válido de 8 dígitos.",
      });

      return;
    }

    try {
      setSearching(true);
      setMessage(null);
      setData(null);

      const result =
        mode === "ASISTENCIA"
          ? await attendanceService.search(
              cleanDni,
            )
          : await mealService.search(
              cleanDni,
            );

      if (
        !result ||
        !result.participant
      ) {
        setMessage({
          type: "error",
          text:
            "No se encontró información del participante.",
        });

        return;
      }

      setData(result);
    } catch (error) {
      console.error(
        "Error buscando participante:",
        error,
      );

      setData(null);

      setMessage({
        type: "error",

        text:
          getErrorMessage(
            error,
            "No se encontró al participante o no se pudo realizar la búsqueda.",
          ),
      });
    } finally {
      setSearching(false);
    }
  };

  const confirm = async () => {
    const cleanDni =
      dni.trim();

    if (
      !/^\d{8}$/.test(
        cleanDni,
      )
    ) {
      setMessage({
        type: "error",
        text:
          "Ingrese un DNI válido de 8 dígitos.",
      });

      return;
    }

    try {
      setBusy(true);
      setMessage(null);

      const result =
        mode === "ASISTENCIA"
          ? await attendanceService.mark(
              cleanDni,
            )
          : await mealService.deliver(
              cleanDni,
              mode,
            );

      let successMessage =
        result?.message;

      if (
        typeof successMessage !==
          "string" ||
        !successMessage.trim()
      ) {
        successMessage =
          mode === "ASISTENCIA"
            ? "Asistencia registrada correctamente."
            : mode === "DESAYUNO"
              ? "Desayuno entregado correctamente."
              : "Cena entregada correctamente.";
      }

      setMessage({
        type: "success",
        text: successMessage,
      });

      setData(null);
      setDni("");
    } catch (error) {
      console.error(
        "Error confirmando operación:",
        error,
      );

      setMessage({
        type: "error",

        text:
          getErrorMessage(
            error,
            mode === "ASISTENCIA"
              ? "No se pudo registrar la asistencia."
              : mode === "DESAYUNO"
                ? "No se pudo registrar la entrega del desayuno."
                : "No se pudo registrar la entrega de la cena.",
          ),
      });
    } finally {
      setBusy(false);
    }
  };

  const canConfirm =
    data !== null &&
    !busy &&
    (
      mode === "ASISTENCIA"
        ? !data.attendance
        : data.hasAttendance ===
          true
    );

  return (
    <main className="mx-auto max-w-2xl px-4 pb-12 pt-8">
      <Card>
        <h1 className="text-3xl font-black">
          {getTitle()}
        </h1>

        <p className="mt-2 text-slate-600">
          Ingrese el DNI para validar y registrar la operación del día.
        </p>

        <div className="mt-7 flex gap-3">
          <Input
            value={dni}
            onChange={(event) => {
              setDni(
                event.target.value
                  .replace(
                    /\D/g,
                    "",
                  )
                  .slice(
                    0,
                    8,
                  ),
              );

              setMessage(null);
              setData(null);
            }}
            onKeyDown={(event) => {
              if (
                event.key ===
                  "Enter" &&
                dni.length === 8
              ) {
                event.preventDefault();
                void search();
              }
            }}
            maxLength={8}
            inputMode="numeric"
            placeholder="Ingrese el DNI"
          />

          <Button
            type="button"
            onClick={() =>
              void search()
            }
            disabled={
              dni.length !== 8 ||
              searching
            }
          >
            {searching
              ? "Buscando..."
              : "Buscar"}
          </Button>
        </div>

        {message && (
          <div className="mt-5">
            <Alert
              type={message.type}
            >
              {message.text}
            </Alert>
          </div>
        )}

        {data && (
          <div className="mt-6 rounded-2xl border bg-slate-50 p-5">
            <h2 className="text-xl font-bold">
              {
                data.participant
                  .nombres
              }{" "}
              {
                data.participant
                  .apellidos
              }
            </h2>

            <p className="mt-1 text-slate-600">
              DNI:{" "}
              {
                data.participant
                  .dni
              }
            </p>

            {mode ===
              "ASISTENCIA" &&
              data.attendance && (
                <div className="mt-4">
                  <Alert type="info">
                    Ya registró asistencia
                    {data.attendance
                      .hora
                      ? ` a las ${data.attendance.hora}`
                      : "."}
                  </Alert>
                </div>
              )}

            {mode !==
              "ASISTENCIA" &&
              data.hasAttendance !==
                true && (
                <div className="mt-4">
                  <Alert type="error">
                    No tiene asistencia registrada hoy.
                  </Alert>
                </div>
              )}

            <Button
              type="button"
              className="mt-5 w-full"
              onClick={() =>
                void confirm()
              }
              disabled={
                !canConfirm
              }
            >
              {busy
                ? "Procesando..."
                : "Confirmar"}
            </Button>
          </div>
        )}
      </Card>
    </main>
  );
}