import http from "node:http";
import { Server } from "socket.io";

import { app } from "./app.js";
import { env } from "./config/env.js";
import { testDatabase } from "./config/db.js";

const server =
  http.createServer(app);

/**
 * Permitir Socket.IO desde:
 * - frontend local
 * - frontend publicado en Railway
 */
const allowedOrigins = Array.from(
  new Set([
    "http://localhost:5173",
    env.FRONTEND_URL,
  ]),
);

const io =
  new Server(server, {
    cors: {
      origin:
        allowedOrigins,

      credentials: true,

      methods: [
        "GET",
        "POST",
      ],

      allowedHeaders: [
        "Content-Type",
        "Authorization",
      ],
    },

    transports: [
      "polling",
      "websocket",
    ],

    pingTimeout: 20000,
    pingInterval: 25000,
  });

app.set(
  "io",
  io,
);

io.on(
  "connection",
  (socket) => {
    console.log(
      `Socket conectado: ${socket.id}`,
    );

    socket.emit(
      "connected",
      {
        message:
          "Conectado a IEPP en tiempo real",
      },
    );

    socket.on(
      "disconnect",
      (reason) => {
        console.log(
          `Socket desconectado: ${socket.id}. Motivo: ${reason}`,
        );
      },
    );

    socket.on(
      "error",
      (error) => {
        console.error(
          `Error de socket ${socket.id}:`,
          error,
        );
      },
    );
  },
);

io.engine.on(
  "connection_error",
  (error) => {
    console.error(
      "Error de conexión Socket.IO:",
      {
        code:
          error.code,

        message:
          error.message,

        context:
          error.context,
      },
    );
  },
);

async function startServer():
  Promise<void> {
  try {
    await testDatabase();

    server.listen(
      env.PORT,
      "0.0.0.0",
      () => {
        console.log(
          `Entorno: ${env.NODE_ENV}`,
        );

        console.log(
          `Frontend permitido: ${env.FRONTEND_URL}`,
        );

        console.log(
          `API iniciada en el puerto ${env.PORT}`,
        );

        if (
          env.NODE_ENV !==
          "production"
        ) {
          console.log(
            `API local: http://localhost:${env.PORT}/api`,
          );
        }
      },
    );
  } catch (error) {
    console.error(
      "No se pudo iniciar el backend:",
      error,
    );

    process.exit(1);
  }
}

/**
 * Cierre ordenado del servidor.
 */
async function shutdown(
  signal: string,
): Promise<void> {
  console.log(
    `${signal} recibido. Cerrando servidor...`,
  );

  io.close();

  server.close(
    (error) => {
      if (error) {
        console.error(
          "Error al cerrar el servidor:",
          error,
        );

        process.exit(1);
      }

      console.log(
        "Servidor cerrado correctamente.",
      );

      process.exit(0);
    },
  );
}

process.on(
  "SIGTERM",
  () => {
    void shutdown(
      "SIGTERM",
    );
  },
);

process.on(
  "SIGINT",
  () => {
    void shutdown(
      "SIGINT",
    );
  },
);

void startServer();