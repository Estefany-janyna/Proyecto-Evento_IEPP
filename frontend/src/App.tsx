import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  PublicLayout,
} from "./components/layout/PublicLayout";

import {
  AdminLayout,
} from "./components/layout/AdminLayout";

import {
  StaffLayout,
} from "./components/layout/StaffLayout";

import {
  ProtectedRoute,
} from "./auth/ProtectedRoute";

import {
  StaffRoute,
} from "./auth/StaffRoute";

import {
  RegisterPage,
} from "./pages/public/RegisterPage";

import {
  OperationPage,
} from "./pages/OperationPage";

import {
  AdminLoginPage,
} from "./pages/admin/AdminLoginPage";

import {
  ReportsHomePage,
} from "./pages/admin/ReportsHomePage";

import {
  AdminStallsPage,
} from "./pages/admin/AdminStallsPage";

import {
  AdminCollaboratorsPage,
} from "./pages/admin/AdminCollaboratorsPage";

import {
  AdminStaffPage,
} from "./pages/admin/AdminStaffPage";

import {
  StaffLoginPage,
} from "./pages/staff/StaffLoginPage";

import {
  CollaboratorLoginPage,
} from "./pages/collaborator/CollaboratorLoginPage";

import {
  CollaboratorHomePage,
} from "./pages/collaborator/CollaboratorHomePage";

import {
  StallLoginPage,
} from "./pages/stall/StallLoginPage";

import {
  StallHomePage,
} from "./pages/stall/StallHomePage";

export default function App() {
  return (
    <Routes>
      {/* =========================
          RUTAS PÚBLICAS
      ========================== */}
      <Route element={<PublicLayout />}>
        <Route
          path="/registro"
          element={<RegisterPage />}
        />
      </Route>

      {/* =========================
          LOGIN PERSONAL OPERATIVO
      ========================== */}
      <Route
        path="/personal/login"
        element={<StaffLoginPage />}
      />

      {/* =========================
          PERSONAL OPERATIVO
      ========================== */}
    <Route element={<StaffLayout />}>
  <Route
    path="/asistencia"
    element={
      <StaffRoute>
        <OperationPage
          mode="ASISTENCIA"
        />
      </StaffRoute>
    }
  />

  <Route
    path="/desayuno"
    element={
      <StaffRoute>
        <OperationPage
          mode="DESAYUNO"
        />
      </StaffRoute>
    }
  />

  <Route
    path="/cena"
    element={
      <StaffRoute>
        <OperationPage
          mode="CENA"
        />
      </StaffRoute>
    }
  />
</Route>

      {/* =========================
          LOGINS
      ========================== */}
      <Route
        path="/admin/login"
        element={<AdminLoginPage />}
      />

      <Route
        path="/colaborador/login"
        element={<CollaboratorLoginPage />}
      />

      <Route
        path="/puesto/login"
        element={<StallLoginPage />}
      />

      {/* =========================
          PANEL ADMINISTRATIVO
      ========================== */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin/reportes"
          element={
            <ProtectedRoute>
              <ReportsHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/puestos"
          element={
            <ProtectedRoute>
              <AdminStallsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/colaboradores"
          element={
            <ProtectedRoute>
              <AdminCollaboratorsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/personal"
          element={
            <ProtectedRoute>
              <AdminStaffPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            PANEL COLABORADOR
        ========================== */}
        <Route
          path="/colaborador"
          element={
            <ProtectedRoute>
              <CollaboratorHomePage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            PANEL PUESTO
        ========================== */}
        <Route
          path="/puesto"
          element={
            <ProtectedRoute>
              <StallHomePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* =========================
          RUTA INICIAL
      ========================== */}
      <Route
        path="/"
        element={
          <Navigate
            to="/registro"
            replace
          />
        }
      />

      {/* =========================
          RUTA NO ENCONTRADA
      ========================== */}
      <Route
        path="*"
        element={
          <Navigate
            to="/registro"
            replace
          />
        }
      />
    </Routes>
  );
}