import "dotenv/config";
import * as bcrypt from "bcryptjs";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/db.js";

interface UsuarioRow
  extends RowDataPacket {
  id: number;
}

async function createAdmin(): Promise<void> {
  const usuario =
    process.env.ADMIN_USER?.trim() ||
    "ADMIN";

  const password =
    process.env.ADMIN_PASSWORD?.trim() ||
    "IEPP2026-08";

  console.log(
    "Creando administrador:",
    usuario,
  );

  const passwordHash =
    await bcrypt.hash(
      password,
      12,
    );

  const [rows] =
    await pool.execute<UsuarioRow[]>(
      `
        SELECT id
        FROM usuarios
        WHERE usuario = ?
        LIMIT 1
      `,
      [usuario],
    );

  const existingUser = rows[0];

  if (existingUser) {
    await pool.execute<ResultSetHeader>(
      `
        UPDATE usuarios
        SET
          password_hash = ?,
          perfil = 'ADMIN',
          estado = 'ACTIVO',
          updated_at = NOW()
        WHERE id = ?
      `,
      [
        passwordHash,
        existingUser.id,
      ],
    );

    console.log(
      "Administrador actualizado correctamente.",
    );
  } else {
    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO usuarios (
          usuario,
          password_hash,
          perfil,
          estado,
          ultimo_acceso,
          created_at,
          updated_at
        )
        VALUES (
          ?,
          ?,
          'ADMIN',
          'ACTIVO',
          NULL,
          NOW(),
          NOW()
        )
      `,
      [
        usuario,
        passwordHash,
      ],
    );

    console.log(
      "Administrador creado correctamente.",
    );
  }

  console.log(
    `Usuario: ${usuario}`,
  );

  console.log(
    `Contraseña: ${password}`,
  );

  await pool.end();
}

createAdmin().catch(
  async (error) => {
    console.error(
      "Error creando administrador:",
      error,
    );

    try {
      await pool.end();
    } catch {
      // La conexión pudo no haberse iniciado.
    }

    process.exit(1);
  },
);