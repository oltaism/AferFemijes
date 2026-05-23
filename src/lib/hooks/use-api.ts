"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../api/client";
import { useSession } from "../store";

export function useApiQuery<T>(
  fetcher: (token: string) => Promise<T>,
  deps: unknown[] = [],
) {
  const token = useSession((s) => s.accessToken);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setFromApi(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetcher(token)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setFromApi(true);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setFromApi(false);
        setError(
          e instanceof ApiError
            ? e.message
            : "S’u lidh me API-n (porti 4000).",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // fetcher is a stable import; deps are extra triggers (e.g. child id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ...deps]);

  const reload = useCallback(() => {
    if (!token) return;
    fetcher(token)
      .then((d) => {
        setData(d);
        setFromApi(true);
        setError(null);
      })
      .catch((e) => {
        setFromApi(false);
        setError(
          e instanceof ApiError
            ? e.message
            : "S’u lidh me API-n (porti 4000).",
        );
      });
  }, [token, fetcher]);

  return { data, error, loading, fromApi, token, reload, setData };
}
