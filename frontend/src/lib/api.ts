import axios from "axios";

import {
  env,
} from "../config/env";

export const api =
  axios.create({
    baseURL:
      env.apiUrl,

    timeout:
      15000,

    headers: {
      Accept:
        "application/json",

      "Content-Type":
        "application/json",
    },
  });

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "token",
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    console.log(
      "Solicitud API:",
      {
        baseURL:
          config.baseURL,

        url:
          config.url,

        finalUrl:
          `${config.baseURL ?? ""}${config.url ?? ""}`,
      },
    );

    return config;
  },

  (error) =>
    Promise.reject(error),
);