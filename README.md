# Sistema IEPP 2026

Proyecto integral para registro de participantes, asistencia diaria, desayuno y cena, colaboradores, códigos de canje, puestos de comida y reportes.

## Tecnologías
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Hook Form, Zod, Axios y Socket.IO Client.
- Backend: Node.js, Express, TypeScript, MySQL, JWT, bcrypt, Zod y Socket.IO.
- Base de datos: MySQL 8, importable desde phpMyAdmin.

## 1. Crear la base de datos
1. Abra `http://localhost/phpmyadmin`.
2. Seleccione **Importar**.
3. Importe `database/01_schema.sql`.
4. Luego importe `database/02_seed.sql`.

## 2. Backend
```bash
cd backend
copy .env.example .env
npm install
npm run seed:admin
npm run dev
```
Edite `.env` y coloque el token de API Perú en `API_PERU_TOKEN`.

## 3. Frontend
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

## Direcciones
- Formulario: http://localhost:5173/registro
- Asistencia: http://localhost:5173/asistencia
- Desayuno: http://localhost:5173/desayuno
- Cena: http://localhost:5173/cena
- Colaborador: http://localhost:5173/colaborador/login
- Puesto: http://localhost:5173/puesto/login
- Reportes: http://localhost:5173/admin/login
- Personal: http://localhost:5173/asistencia
- API: http://localhost:4000/api

## Credenciales iniciales
Se generan desde las variables `ADMIN_USER` y `ADMIN_PASSWORD` del backend. Valores sugeridos:
- Usuario: ADMIN
- Contraseña: IEPP2026-08

> El token de API Perú se usa únicamente en el backend y nunca se expone en el navegador.

## Estructura modular

Esta versión separa frontend y backend por responsabilidades. Las carpetas solicitadas se encuentran en `frontend/src` y `backend/src/modules`.

## Catálogo IEPP incluido

`database/02_seed.sql` contiene las 43 regiones eclesiásticas proporcionadas, la opción OTROS y los 15 cargos iniciales. Los nombres "Cordinador" fueron normalizados a "Coordinador"; si se requiere conservar literalmente la escritura original, puede cambiarse en ese archivo antes de importarlo.

Las iglesias todavía no se cargaron porque no se entregó el padrón de iglesias. La tabla y la API dependiente por región ya están preparadas.
