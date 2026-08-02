import {
  useEffect,
  useState,
} from "react";

import axios from "axios";
import { Link } from "react-router-dom";

import {
  Alert,
  Button,
  Card,
  Input,

} from "../../components/ui";

import {
  adminStallService,
  type AdminStall,
} from "../../services";

interface FormData {
  numeroPuesto: string;
  encargado: string;
  celular: string;
  password: string;
  platosAsignados: string;
}

const emptyForm: FormData = {
  numeroPuesto: "",
  encargado: "",
  celular: "",
  password: "",
  platosAsignados: "2",
};

interface Message {
  type:
    | "success"
    | "error";

  text: string;
}

export function AdminStallsPage() {
  const [
    stalls,
    setStalls,
  ] = useState<AdminStall[]>(
    [],
  );

  const [
    form,
    setForm,
  ] = useState<FormData>(
    emptyForm,
  );

  const [
    editing,
    setEditing,
  ] = useState<
    AdminStall | null
  >(null);

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<Message | null>(
    null,
  );

  const loadStalls =
    async () => {
      try {
        setLoading(true);

        const result =
          await adminStallService.list();

        setStalls(result);
      } catch (error) {
        setMessage({
          type: "error",

          text:
            axios.isAxiosError(
              error,
            )
              ? error.response
                  ?.data
                  ?.message ??
                "No se pudieron cargar los puestos."
              : "No se pudieron cargar los puestos.",
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadStalls();
  }, []);

  const updateField = (
    field: keyof FormData,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const createStall = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage(null);

      await adminStallService.create({
        numeroPuesto:
          form.numeroPuesto.trim(),

        encargado:
          form.encargado.trim(),

        celular:
          form.celular.trim(),

        password:
          form.password,

        platosAsignados:
          Number(
            form.platosAsignados,
          ),
      });

      setForm(emptyForm);

      setMessage({
        type: "success",
        text:
          "El puesto y sus credenciales fueron creados correctamente.",
      });

      await loadStalls();
    } catch (error) {
      setMessage({
        type: "error",

        text:
          axios.isAxiosError(
            error,
          )
            ? error.response
                ?.data
                ?.message ??
              "No se pudo crear el puesto."
            : "No se pudo crear el puesto.",
      });
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (
    stall: AdminStall,
  ) => {
    setEditing(stall);

    setForm({
      numeroPuesto:
        stall.numeroPuesto,

      encargado:
        stall.encargado,

      celular:
        stall.celular,

      password: "",

      platosAsignados:
        String(
          stall.platosAsignados,
        ),
    });

    setNewPassword("");
    setMessage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEditing = () => {
    setEditing(null);
    setForm(emptyForm);
    setNewPassword("");
  };

  const updateStall = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!editing) {
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await adminStallService.update(
        editing.id,
        {
          encargado:
            form.encargado.trim(),

          celular:
            form.celular.trim(),

          platosAsignados:
            Number(
              form.platosAsignados,
            ),
        },
      );

      setMessage({
        type: "success",
        text:
          "El puesto fue actualizado correctamente.",
      });

      cancelEditing();
      await loadStalls();
    } catch (error) {
      setMessage({
        type: "error",

        text:
          axios.isAxiosError(
            error,
          )
            ? error.response
                ?.data
                ?.message ??
              "No se pudo actualizar el puesto."
            : "No se pudo actualizar el puesto.",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword =
    async () => {
      if (!editing) {
        return;
      }

      if (
        newPassword.length < 6
      ) {
        setMessage({
          type: "error",
          text:
            "La contraseña debe tener al menos 6 caracteres.",
        });

        return;
      }

      try {
        setSaving(true);

        await adminStallService.changePassword(
          editing.id,
          newPassword,
        );

        setNewPassword("");

        setMessage({
          type: "success",
          text:
            "La contraseña fue actualizada correctamente.",
        });

        await loadStalls();
      } catch (error) {
        setMessage({
          type: "error",

          text:
            axios.isAxiosError(
              error,
            )
              ? error.response
                  ?.data
                  ?.message ??
                "No se pudo actualizar la contraseña."
              : "No se pudo actualizar la contraseña.",
        });
      } finally {
        setSaving(false);
      }
    };

  const toggleStatus =
    async (
      stall: AdminStall,
    ) => {
      const newStatus =
        stall.estado ===
        "INACTIVO"
          ? "ACTIVO"
          : "INACTIVO";

      try {
        await adminStallService.changeStatus(
          stall.id,
          newStatus,
        );

        setMessage({
          type: "success",

          text:
            newStatus ===
            "ACTIVO"
              ? "Puesto activado correctamente."
              : "Puesto desactivado correctamente.",
        });

        await loadStalls();
      } catch (error) {
        setMessage({
          type: "error",

          text:
            axios.isAxiosError(
              error,
            )
              ? error.response
                  ?.data
                  ?.message ??
                "No se pudo cambiar el estado."
              : "No se pudo cambiar el estado.",
        });
      }
    };

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">
            Gestión de puestos
          </h1>

          <p className="mt-1 text-slate-600">
            Cree los puestos y sus
            credenciales de acceso.
          </p>
        </div>

        <Link
          to="/admin/reportes"
          className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
        >
          Volver a reportes
        </Link>
      </div>

      {message && (
        <div className="mt-6">
          <Alert
            type={message.type}
          >
            {message.text}
          </Alert>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="text-xl font-black">
            {editing
              ? `Editar puesto ${editing.numeroPuesto}`
              : "Crear nuevo puesto"}
          </h2>

          <form
            className="mt-5 space-y-4"
            onSubmit={
              editing
                ? updateStall
                : createStall
            }
          >
            <div>
              <label className="mb-2 block font-semibold">
                Número de puesto
              </label>

              <Input
                value={
                  form.numeroPuesto
                }
                disabled={Boolean(
                  editing,
                )}
                onChange={(event) =>
                  updateField(
                    "numeroPuesto",
                    event.target.value,
                  )
                }
                placeholder="Ejemplo: 1"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Encargado
              </label>

              <Input
                value={
                  form.encargado
                }
                onChange={(event) =>
                  updateField(
                    "encargado",
                    event.target.value,
                  )
                }
                placeholder="Nombre del encargado"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Celular
              </label>

              <Input
                value={form.celular}
                onChange={(event) =>
                  updateField(
                    "celular",
                    event.target.value
                      .replace(
                        /\D/g,
                        "",
                      )
                      .slice(0, 9),
                  )
                }
                maxLength={9}
                inputMode="numeric"
                placeholder="9XXXXXXXX"
                required
              />
            </div>

            {!editing && (
              <div>
                <label className="mb-2 block font-semibold">
                  Contraseña
                </label>

                <Input
                  type="text"
                  value={
                    form.password
                  }
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Contraseña del puesto"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-2 block font-semibold">
                Platos asignados
              </label>

              <Input
                type="number"
                min={0}
                value={
                  form.platosAsignados
                }
                onChange={(event) =>
                  updateField(
                    "platosAsignados",
                    event.target.value,
                  )
                }
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving
                  ? "Guardando..."
                  : editing
                    ? "Actualizar"
                    : "Crear puesto"}
              </Button>

              {editing && (
                <button
                  type="button"
                  onClick={
                    cancelEditing
                  }
                  className="rounded-xl border px-4 font-bold"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {editing && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-black">
                Restablecer contraseña
              </h3>

              <Input
                type="text"
                className="mt-3"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value,
                  )
                }
                placeholder="Nueva contraseña"
              />

              <Button
                type="button"
                className="mt-3 w-full"
                disabled={saving}
                onClick={
                  updatePassword
                }
              >
                Cambiar contraseña
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">
              Puestos registrados
            </h2>

            <button
              type="button"
              onClick={() =>
                void loadStalls()
              }
              className="rounded-lg px-3 py-2 font-bold text-blue-700 hover:bg-blue-50"
            >
              Actualizar
            </button>
          </div>

          <div className="mt-5 overflow-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">
                    Puesto
                  </th>

                  <th className="p-3">
                    Encargado
                  </th>

                  <th className="p-3">
                    Celular
                  </th>

                  <th className="p-3">
                    Contraseña
                  </th>

                  <th className="p-3">
                    Asignados
                  </th>

                  <th className="p-3">
                    Entregados
                  </th>

                  <th className="p-3">
                    Disponibles
                  </th>

                  <th className="p-3">
                    Estado
                  </th>

                  <th className="p-3">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-6 text-center text-slate-500"
                    >
                      Cargando puestos...
                    </td>
                  </tr>
                )}

                {!loading &&
                  stalls.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-6 text-center text-slate-500"
                      >
                        No existen puestos
                        registrados.
                      </td>
                    </tr>
                  )}

                {stalls.map(
                  (stall) => (
                    <tr
                      key={stall.id}
                      className="border-b"
                    >
                      <td className="p-3 font-black">
                        {
                          stall.numeroPuesto
                        }
                      </td>

                      <td className="p-3">
                        {
                          stall.encargado
                        }
                      </td>

                      <td className="p-3">
                        {
                          stall.celular
                        }
                      </td>

                      <td className="p-3 font-mono font-bold">
                        {stall.passwordReferencia ??
                          "No disponible"}
                      </td>

                      <td className="p-3">
                        {
                          stall.platosAsignados
                        }
                      </td>

                      <td className="p-3">
                        {
                          stall.platosEntregados
                        }
                      </td>

                      <td className="p-3 font-black text-blue-700">
                        {
                          stall.platosDisponibles
                        }
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            stall.estado ===
                            "ACTIVO"
                              ? "bg-green-100 text-green-700"
                              : stall.estado ===
                                  "SIN_DISPONIBILIDAD"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {
                            stall.estado
                          }
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                stall,
                              )
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 font-bold text-blue-700"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void toggleStatus(
                                stall,
                              )
                            }
                            className={`rounded-lg px-3 py-2 font-bold ${
                              stall.estado ===
                              "INACTIVO"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {stall.estado ===
                            "INACTIVO"
                              ? "Activar"
                              : "Desactivar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}