const LOCAL_API_URL =
  "http://localhost:4000/api";

const LOCAL_SOCKET_URL =
  "http://localhost:4000";

const PRODUCTION_API_URL =
  "https://backend-production-d586.up.railway.app/api";

const PRODUCTION_SOCKET_URL =
  "https://backend-production-d586.up.railway.app";

export const env = {
  apiUrl:
    import.meta.env.PROD
      ? PRODUCTION_API_URL
      : (
          import.meta.env.VITE_API_URL?.trim() ||
          LOCAL_API_URL
        ),

  socketUrl:
    import.meta.env.PROD
      ? PRODUCTION_SOCKET_URL
      : (
          import.meta.env.VITE_SOCKET_URL?.trim() ||
          LOCAL_SOCKET_URL
        ),
};

console.log(
  "Configuración del frontend:",
  {
    mode:
      import.meta.env.MODE,

    production:
      import.meta.env.PROD,

    apiUrl:
      env.apiUrl,

    socketUrl:
      env.socketUrl,
  },
);