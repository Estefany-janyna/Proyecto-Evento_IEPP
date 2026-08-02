import type {
  ReactNode,
} from "react";

import {
  Navigate,
} from "react-router-dom";

interface StaffRouteProps {
  children: ReactNode;
}

interface TokenPayload {
  id?: number;
  kind?: string;
  exp?: number;
}

function decodeToken():
  TokenPayload | null {
  const token =
    localStorage.getItem(
      "token",
    );

  if (!token) {
    return null;
  }

  try {
    const payloadPart =
      token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const normalized =
      payloadPart
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padded =
      normalized.padEnd(
        Math.ceil(
          normalized.length / 4,
        ) * 4,
        "=",
      );

    const payload =
      JSON.parse(
        atob(padded),
      ) as TokenPayload;

    if (
      payload.exp &&
      payload.exp * 1000 <
        Date.now()
    ) {
      localStorage.removeItem(
        "token",
      );

      localStorage.removeItem(
        "session",
      );

      return null;
    }

    return payload;
  } catch {
    localStorage.removeItem(
      "token",
    );

    localStorage.removeItem(
      "session",
    );

    return null;
  }
}

export function StaffRoute({
  children,
}: StaffRouteProps) {
  const payload =
    decodeToken();

  if (
    !payload ||
    payload.kind !== "STAFF"
  ) {
    return (
      <Navigate
        to="/personal/login"
        replace
      />
    );
  }

  return <>{children}</>;
}