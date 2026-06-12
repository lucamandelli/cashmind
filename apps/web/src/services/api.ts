import type { ApiErrorResponse } from "@/types/api";

export async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const json = (await res.json()) as ApiErrorResponse;
    if (json.error) return json.error;
  } catch {
    // ignore parse error — keep fallback
  }
  return fallback;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const hasBody = init?.body !== undefined;
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const message = await extractErrorMessage(res, `Request failed: ${res.status}`);
    throw new Error(message);
  }
  return res;
}
