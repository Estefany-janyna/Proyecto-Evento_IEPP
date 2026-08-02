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
  adminCollaboratorService,
  type AdminCollaborator,
} from "../../services";

interface FormData {
  nombres: string;
  apellidos: string;
  celular: string;
  password: string;
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
};

export function AdminCollaboratorsPage() {
  const [
    collaborators,
    setCollaborators,
  ] = useState<
    AdminCollaborator[]
  >([]);

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
    AdminCollaborator | null
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

  const getErrorMessage = (
    error: unknown,
    fallback: string,
  ): string => {
    if (
      axios.isAxiosError(
        error,
      )
    ) {
      return (
        error.response?.data
          ?.message ??
        fallback
      );
    }

    return fallback;
  };

  const loadCollaborators =
    async () => {
      try {
        setLoading(true);

        const result =
          await adminCollaboratorService.list();

        setCollaborators(
          result,
        );
      } catch (error) {
        setMessage({
          type: "error",

          text:
            getErrorMessage(
              error,
              "No se pudieron cargar los colaboradores.",
            ),
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadCollaborators();
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

  const cancelEditing = () => {
    setEditing(null);
    setForm(emptyForm);
    setNewPassword("");
  };

  const startEditing = (
    collaborator:
      AdminCollaborator,
  ) => {
    setEditing(
      collaborator,
    );

    setForm({
      nombres:
        collaborator.nombres,

      apellidos:
        collaborator.apellidos,

      celular:
        collaborator.celular,

      password: "",
    });

    setNewPassword("");
    setMessage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const submitForm = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage(null);

      if (editing) {
        await adminCollaboratorService.update(
          editing.id,
          {
            nombres:
              form.nombres.trim(),

            apellidos:
              form.apellidos.trim(),

            celular:
              form.celular.trim(),
          },
        );

        setMessage({
          type: "success",
          text:
            "El colaborador fue actualizado correctamente.",
        });
      } else {
        await adminCollaboratorService.create(
          {
            nombres:
              form.nombres.trim(),

            apellidos:
              form.apellidos.trim(),

            celular:
              form.celular.trim(),

            password:
              form.password,
          },
        );

        setMessage({
          type: "success",
          text:
            "El colaborador y sus credenciales fueron creados correctamente.",
        });
      }

      cancelEditing();

      await loadCollaborators();
    } catch (error) {
      setMessage({
        type: "error",

        text:
          getErrorMessage(
            error,
            editing
              ? "No se pudo actualizar el colaborador."
              : "No se pudo crear el colaborador.",
          ),
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword =
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
        setMessage(null);

        await adminCollaboratorService.changePassword(
          editing.id,
          newPassword,
        );

        setNewPassword("");

        setMessage({
          type: "success",
          text:
            "La contraseña fue actualizada correctamente.",
        });

        await loadCollaborators();
      } catch (error) {
        setMessage({
          type: "error",

          text:
            getErrorMessage(
              error,
              "No se pudo actualizar la contraseña.",
            ),
        });
      } finally {
        setSaving(false);
      }
    };

  const toggleStatus =
    async (
      collaborator:
        AdminCollaborator,
    ) => {
      const newStatus =
        collaborator.estado ===
        "ACTIVO"
          ? "INACTIVO"
          : "ACTIVO";

      try {
        await adminCollaboratorService.changeStatus(
          collaborator.id,
          newStatus,
        );

        setMessage({
          type: "success",

          text:
            newStatus ===
            "ACTIVO"
              ? "Colaborador activado correctamente."
              : "Colaborador desactivado correctamente.",
        });

        await loadCollaborators();
      } catch (error) {
        setMessage({
          type: "error",

          text:
            getErrorMessage(
              error,
              "No se pudo cambiar el estado.",
            ),
        });
      }
    };

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div>
        <h1 className="text-3xl font-black">
          Gestión de colaboradores
        </h1>

        <p className="mt-1 text-slate-600">
          Cree los colaboradores y
          sus credenciales de acceso.
        </p>
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
              ? "Editar colaborador"
              : "Crear colaborador"}
          </h2>

          <form
            className="mt-5 space-y-4"
            onSubmit={
              submitForm
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
                onChange={(event) =>
                  updateField(
                    "nombres",
                    event.target.value,
                  )
                }
                placeholder="Nombres del colaborador"
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
                onChange={(event) =>
                  updateField(
                    "apellidos",
                    event.target.value,
                  )
                }
                placeholder="Apellidos del colaborador"
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
                      event.target.value,
                    )
                  }
                  placeholder="Contraseña del colaborador"
                  required
                />
              </div>
            )}

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
                    : "Crear colaborador"}
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
                  changePassword
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
              Colaboradores registrados
            </h2>

            <button
              type="button"
              onClick={() =>
                void loadCollaborators()
              }
              className="rounded-lg px-3 py-2 font-bold text-blue-700 hover:bg-blue-50"
            >
              Actualizar
            </button>
          </div>

          <div className="mt-5 overflow-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
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
                      colSpan={7}
                      className="p-6 text-center text-slate-500"
                    >
                      Cargando colaboradores...
                    </td>
                  </tr>
                )}

                {!loading &&
                  collaborators.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-6 text-center text-slate-500"
                      >
                        No existen colaboradores registrados.
                      </td>
                    </tr>
                  )}

                {collaborators.map(
                  (collaborator) => (
                    <tr
                      key={
                        collaborator.id
                      }
                      className="border-b"
                    >
                      <td className="p-3 font-bold">
                        {
                          collaborator.nombres
                        }
                      </td>

                      <td className="p-3">
                        {
                          collaborator.apellidos
                        }
                      </td>

                      <td className="p-3">
                        {
                          collaborator.celular
                        }
                      </td>

                      <td className="p-3 font-mono font-bold">
                        {collaborator.passwordReferencia ??
                          "No disponible"}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            collaborator.estado ===
                            "ACTIVO"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {
                            collaborator.estado
                          }
                        </span>
                      </td>

                      <td className="p-3">
                        {collaborator.ultimoAcceso ??
                          "Sin acceso"}
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                collaborator,
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
                                collaborator,
                              )
                            }
                            className={`rounded-lg px-3 py-2 font-bold ${
                              collaborator.estado ===
                              "ACTIVO"
                                ? "bg-red-50 text-red-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {collaborator.estado ===
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