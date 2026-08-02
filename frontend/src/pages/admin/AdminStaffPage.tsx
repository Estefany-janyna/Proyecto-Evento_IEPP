import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Alert,
  Button,
  Card,
  Input,
} from "../../components/ui";

import {
  adminStaffService,
  type AdminStaff,
  type StaffFunction,
} from "../../services";

interface FormData {
  nombres: string;
  apellidos: string;
  celular: string;
  password: string;
  funcion: StaffFunction;
}

interface Message {
  type:
    | "success"
    | "error";

  text: string;
}

const emptyForm: FormData = {
  nombres: "",
  apellidos: "",
  celular: "",
  password: "",
  funcion: "ASISTENCIA",
};

function getFunctionLabel(
  funcion: StaffFunction,
): string {
  if (
    funcion ===
    "ASISTENCIA"
  ) {
    return "Asistencia";
  }

  if (
    funcion ===
    "DESAYUNO"
  ) {
    return "Desayuno";
  }

  return "Cena";
}

export function AdminStaffPage() {
  const [
    staffList,
    setStaffList,
  ] = useState<AdminStaff[]>(
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
    AdminStaff | null
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

  /**
   * Cargar personal operativo.
   */
  const loadStaff =
    async () => {
      try {
        setLoading(true);

        const result =
          await adminStaffService.list();

        setStaffList(
          result,
        );
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
                "No se pudo cargar el personal operativo."
              : "No se pudo cargar el personal operativo.",
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadStaff();
  }, []);

  /**
   * Modificar campos del formulario.
   */
  const updateField = (
    field: keyof FormData,
    value: string,
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  };

  /**
   * Validar formulario.
   */
  const validateForm =
    (): string | null => {
      if (
        form.nombres.trim()
          .length < 2
      ) {
        return "Ingrese los nombres del personal.";
      }

      if (
        form.apellidos.trim()
          .length < 2
      ) {
        return "Ingrese los apellidos del personal.";
      }

      if (
        !/^9\d{8}$/.test(
          form.celular,
        )
      ) {
        return "El celular debe tener 9 dígitos e iniciar con 9.";
      }

      if (
        !editing &&
        form.password.length < 6
      ) {
        return "La contraseña debe tener al menos 6 caracteres.";
      }

      return null;
    };

  /**
   * Crear personal operativo.
   */
  const createStaff =
    async (
      event:
        React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const validationError =
        validateForm();

      if (validationError) {
        setMessage({
          type: "error",
          text: validationError,
        });

        return;
      }

      try {
        setSaving(true);
        setMessage(null);

        await adminStaffService.create(
          {
            nombres:
              form.nombres.trim(),

            apellidos:
              form.apellidos.trim(),

            celular:
              form.celular,

            password:
              form.password,

            funcion:
              form.funcion,
          },
        );

        setForm(
          emptyForm,
        );

        setMessage({
          type: "success",
          text:
            "El personal operativo fue creado correctamente.",
        });

        await loadStaff();
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
                "No se pudo crear el personal operativo."
              : "No se pudo crear el personal operativo.",
        });
      } finally {
        setSaving(false);
      }
    };

  /**
   * Seleccionar personal para editar.
   */
  const startEditing = (
    staff: AdminStaff,
  ) => {
    setEditing(
      staff,
    );

    setForm({
      nombres:
        staff.nombres,

      apellidos:
        staff.apellidos,

      celular:
        staff.celular,

      password: "",

      funcion:
        staff.funcion,
    });

    setNewPassword("");
    setMessage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * Cancelar edición.
   */
  const cancelEditing =
    () => {
      setEditing(null);

      setForm(
        emptyForm,
      );

      setNewPassword("");
      setMessage(null);
    };

  /**
   * Actualizar datos del personal.
   */
  const updateStaff =
    async (
      event:
        React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!editing) {
        return;
      }

      const validationError =
        validateForm();

      if (validationError) {
        setMessage({
          type: "error",
          text: validationError,
        });

        return;
      }

      try {
        setSaving(true);
        setMessage(null);

        await adminStaffService.update(
          editing.id,
          {
            nombres:
              form.nombres.trim(),

            apellidos:
              form.apellidos.trim(),

            celular:
              form.celular,

            funcion:
              form.funcion,
          },
        );

        setMessage({
          type: "success",
          text:
            "El personal operativo fue actualizado correctamente.",
        });

        setEditing(null);

        setForm(
          emptyForm,
        );

        setNewPassword("");

        await loadStaff();
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
                "No se pudo actualizar el personal operativo."
              : "No se pudo actualizar el personal operativo.",
        });
      } finally {
        setSaving(false);
      }
    };

  /**
   * Cambiar contraseña.
   */
  const updatePassword =
    async () => {
      if (!editing) {
        return;
      }

      if (
        newPassword.length <
        6
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
        setMessage(null);

        await adminStaffService.changePassword(
          editing.id,
          newPassword,
        );

        setNewPassword("");

        setMessage({
          type: "success",
          text:
            "La contraseña fue actualizada correctamente.",
        });

        await loadStaff();
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

  /**
   * Activar o desactivar personal.
   */
  const toggleStatus =
    async (
      staff: AdminStaff,
    ) => {
      const newStatus =
        staff.estado ===
        "ACTIVO"
          ? "INACTIVO"
          : "ACTIVO";

      try {
        setMessage(null);

        await adminStaffService.changeStatus(
          staff.id,
          newStatus,
        );

        setMessage({
          type: "success",

          text:
            newStatus ===
            "ACTIVO"
              ? "El personal fue activado correctamente."
              : "El personal fue desactivado correctamente.",
        });

        await loadStaff();
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
      <div>
        <h1 className="text-3xl font-black text-slate-950">
          Gestión de personal operativo
        </h1>

        <p className="mt-1 text-slate-600">
          Cree las cuentas responsables de asistencia,
          desayuno y cena.
        </p>
      </div>

      {message && (
        <div className="mt-6">
          <Alert
            type={
              message.type
            }
          >
            {
              message.text
            }
          </Alert>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* FORMULARIO */}
        <Card>
          <h2 className="text-xl font-black">
            {editing
              ? "Editar personal"
              : "Crear personal"}
          </h2>

          <form
            className="mt-5 space-y-4"
            onSubmit={
              editing
                ? updateStaff
                : createStaff
            }
          >
            <div>
              <label className="mb-2 block font-semibold">
                Nombres
              </label>

              <Input
                value={
                  form.nombres
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "nombres",
                    event.target
                      .value,
                  )
                }
                placeholder="Nombres del personal"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Apellidos
              </label>

              <Input
                value={
                  form.apellidos
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "apellidos",
                    event.target
                      .value,
                  )
                }
                placeholder="Apellidos del personal"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Celular
              </label>

              <Input
                value={
                  form.celular
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "celular",
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
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "password",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Contraseña del personal"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-2 block font-semibold">
                Función asignada
              </label>

              <select
                value={
                  form.funcion
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "funcion",
                    event.target
                      .value,
                  )
                }
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              >
                <option value="ASISTENCIA">
                  Asistencia
                </option>

                <option value="DESAYUNO">
                  Desayuno
                </option>

                <option value="CENA">
                  Cena
                </option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={
                  saving
                }
                className="flex-1"
              >
                {saving
                  ? "Guardando..."
                  : editing
                    ? "Actualizar"
                    : "Crear personal"}
              </Button>

              {editing && (
                <button
                  type="button"
                  onClick={
                    cancelEditing
                  }
                  className="rounded-xl border border-slate-300 px-4 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {editing && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="font-black">
                Cambiar contraseña
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Ingrese una nueva contraseña para este personal.
              </p>

              <Input
                type="text"
                className="mt-3"
                value={
                  newPassword
                }
                onChange={(
                  event,
                ) =>
                  setNewPassword(
                    event.target
                      .value,
                  )
                }
                placeholder="Nueva contraseña"
              />

              <Button
                type="button"
                className="mt-3 w-full"
                disabled={
                  saving
                }
                onClick={
                  updatePassword
                }
              >
                Cambiar contraseña
              </Button>
            </div>
          )}
        </Card>

        {/* TABLA */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">
              Personal registrado
            </h2>

            <button
              type="button"
              onClick={() =>
                void loadStaff()
              }
              className="rounded-lg px-3 py-2 font-bold text-blue-700 hover:bg-blue-50"
            >
              Actualizar
            </button>
          </div>

          <div className="mt-5 overflow-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">
                    Nombres
                  </th>

                  <th className="p-3">
                    Apellidos
                  </th>

                  <th className="p-3">
                    Celular
                  </th>

                  <th className="p-3">
                    Contraseña
                  </th>

                  <th className="p-3">
                    Función
                  </th>

                  <th className="p-3">
                    Estado
                  </th>

                  <th className="p-3">
                    Último acceso
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
                      colSpan={
                        8
                      }
                      className="p-6 text-center text-slate-500"
                    >
                      Cargando personal...
                    </td>
                  </tr>
                )}

                {!loading &&
                  staffList.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          8
                        }
                        className="p-6 text-center text-slate-500"
                      >
                        No existe personal operativo registrado.
                      </td>
                    </tr>
                  )}

                {staffList.map(
                  (staff) => (
                    <tr
                      key={
                        staff.id
                      }
                      className="border-b"
                    >
                      <td className="p-3 font-black">
                        {
                          staff.nombres
                        }
                      </td>

                      <td className="p-3">
                        {
                          staff.apellidos
                        }
                      </td>

                      <td className="p-3">
                        {
                          staff.celular
                        }
                      </td>

                      <td className="p-3 font-mono font-bold">
                        {staff.passwordReferencia ??
                          "No disponible"}
                      </td>

                      <td className="p-3">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                          {getFunctionLabel(
                            staff.funcion,
                          )}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            staff.estado ===
                            "ACTIVO"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {
                            staff.estado
                          }
                        </span>
                      </td>

                      <td className="p-3">
                        {staff.ultimoAcceso
                          ? new Date(
                              staff.ultimoAcceso,
                            ).toLocaleString(
                              "es-PE",
                            )
                          : "Nunca"}
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                staff,
                              )
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 font-bold text-blue-700 hover:bg-blue-100"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void toggleStatus(
                                staff,
                              )
                            }
                            className={`rounded-lg px-3 py-2 font-bold ${
                              staff.estado ===
                              "ACTIVO"
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {staff.estado ===
                            "ACTIVO"
                              ? "Desactivar"
                              : "Activar"}
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