import http from "node:http";
import { Server } from "socket.io";

import { app } from "./app.js";
import { env } from "./config/env.js";
import { testDatabase } from "./config/db.js";

const server =
  http.createServer(app);

const io =
  new Server(server, {
    cors: {
      origin:
        env.FRONTEND_URL,

      credentials: true,
    },
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
      () => {
        console.log(
          `Socket desconectado: ${socket.id}`,
        );
      },
    );
  },
);

async function startServer():
  Promise<void> {
  try {
    /**
     * Verifica la base antes
     * de iniciar la API.
     */
    await testDatabase();

    server.listen(
      env.PORT,
      "0.0.0.0",
      () => {
        if (
          env.NODE_ENV ===
          "production"
        ) {
          console.log(
            `API iniciada en el puerto ${env.PORT}`,
          );
        } else {
          console.log(
            `API: http://localhost:${env.PORT}/api`,
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

void startServer();