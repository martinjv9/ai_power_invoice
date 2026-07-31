// Minimal typed fetch wrapper for the backend. In dev the Vite proxy makes
// /api/* same-origin, so the session cookie rides along automatically;
// credentials is explicit anyway for when web and api are separate origins.
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
  // 204 No Content (e.g. logout) has no body to parse.
  return res.status === 204 ? (undefined as T) : res.json();
}
