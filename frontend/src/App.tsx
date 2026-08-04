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
  AttendeeReportPage,
} from "./pages/admin/AttendeeReportPage";

import {
  RegionReportPage,
} from "./pages/admin/RegionReportPage";

import {
  ChurchReportPage,
} from "./pages/admin/ChurchReportPage";

import {
  ChurchRankingPage,
} from "./pages/admin/ChurchRankingPage";

import {
  MealReportPage,
} from "./pages/admin/MealReportPage";

import {
  RedemptionReportPage,
} from "./pages/admin/RedemptionReportPage";

import {
  StallReportPage,
} from "./pages/admin/StallReportPage";

import {
  CollaboratorReportPage,
} from "./pages/admin/CollaboratorReportPage";

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
      {/* =====================================================
          RUTAS PÚBLICAS
      ====================================================== */}
      <Route element={<PublicLayout />}>
        <Route
          path="/registro"
          element={<RegisterPage />}
        />
      </Route>

      {/* =====================================================
          LOGIN DEL PERSONAL OPERATIVO
      ====================================================== */}
      <Route
        path="/personal/login"
        element={<StaffLoginPage />}
      />

      {/* =====================================================
          PERSONAL OPERATIVO
      ====================================================== */}
      <Route element={<StaffLayout />}>
        <Route
          path="/asistencia"
          element={
            <StaffRoute>
              <OperationPage
                key="ASISTENCIA"
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
                key="DESAYUNO"
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
                key="CENA"
                mode="CENA"
              />
            </StaffRoute>
          }
        />
      </Route>

      {/* =====================================================
          LOGINS
      ====================================================== */}
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

      {/* =====================================================
          PANEL ADMINISTRATIVO
      ====================================================== */}
      <Route element={<AdminLayout />}>
        {/* =========================
            INICIO DE REPORTES
        ========================== */}
        <Route
          path="/admin/reportes"
          element={
            <ProtectedRoute>
              <ReportsHomePage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            REPORTE DE ASISTENTES
        ========================== */}
        <Route
          path="/admin/reportes/asistentes"
          element={
            <ProtectedRoute>
              <AttendeeReportPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            REPORTE POR REGIONES
        ========================== */}
        <Route
          path="/admin/reportes/regiones"
          element={
            <ProtectedRoute>
              <RegionReportPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            REPORTE POR IGLESIAS
        ========================== */}
        <Route
          path="/admin/reportes/iglesias"
          element={
            <ProtectedRoute>
              <ChurchReportPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            RANKING DE IGLESIAS
        ========================== */}
        <Route
          path="/admin/reportes/ranking-iglesias"
          element={
            <ProtectedRoute>
              <ChurchRankingPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            REPORTE DE ALIMENTACIÓN
        ========================== */}
        <Route
          path="/admin/reportes/alimentacion"
          element={
            <ProtectedRoute>
              <MealReportPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            REPORTE DE CANJES
        ========================== */}
        <Route
          path="/admin/reportes/canjes"
          element={
            <ProtectedRoute>
              <RedemptionReportPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            REPORTE DE PUESTOS
        ========================== */}
        <Route
          path="/admin/reportes/puestos"
          element={
            <ProtectedRoute>
              <StallReportPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            REPORTE DE COLABORADORES
        ========================== */}
        <Route
          path="/admin/reportes/colaboradores"
          element={
            <ProtectedRoute>
              <CollaboratorReportPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            GESTIÓN DE PUESTOS
        ========================== */}
        <Route
          path="/admin/puestos"
          element={
            <ProtectedRoute>
              <AdminStallsPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            GESTIÓN DE COLABORADORES
        ========================== */}
        <Route
          path="/admin/colaboradores"
          element={
            <ProtectedRoute>
              <AdminCollaboratorsPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            PERSONAL OPERATIVO
        ========================== */}
        <Route
          path="/admin/personal"
          element={
            <ProtectedRoute>
              <AdminStaffPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            PANEL DEL COLABORADOR
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
            PANEL DEL PUESTO
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

      {/* =====================================================
          RUTA INICIAL
      ====================================================== */}
      <Route
        path="/"
        element={
          <Navigate
            to="/registro"
            replace
          />
        }
      />

      {/* =====================================================
          RUTA NO ENCONTRADA
      ====================================================== */}
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