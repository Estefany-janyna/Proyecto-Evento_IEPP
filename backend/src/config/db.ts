import mysql from "mysql2/promise";

import {
  env,
} from "./env.js";

export const pool =
  mysql.createPool({
    host:
      env.DB_HOST,

    port:
      env.DB_PORT,

    user:
      env.DB_USER,

    password:
      env.DB_PASSWORD,

    database:
      env.DB_NAME,

    waitForConnections:
      true,

    connectionLimit:
      15,

    queueLimit:
      0,

    dateStrings:
      true,

    charset:
      "utf8mb4",

    timezone:
      "-05:00",

    enableKeepAlive:
      true,

    keepAliveInitialDelay:
      0,
  });

export async function testDatabase():
  Promise<void> {
  const connection =
    await pool.getConnection();

  try {
    const [rows] =
      await connection.query(
        `
          SELECT
            DATABASE() AS databaseName,
            NOW() AS currentTime
        `,
      );

    console.log(
      "MySQL conectado correctamente:",
      rows,
    );
  } finally {
    connection.release();
  }
}