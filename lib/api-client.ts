type Envelope<T> = { data: T; meta?: { nextCursor?: string | null } };
export class ApiError extends Error {
  constructor(message: string, public status: number, public fields?: Record<string, string>) { super(message); }
}

async function requestOnce<T>(url: string, options: RequestInit): Promise<Envelope<T>> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  options.signal?.addEventListener("abort", cancel, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timeout = setTimeout(cancel, 15000);
  try {
    const response = await fetch(url, {
      ...options, signal: controller.signal, cache: "no-store",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    const payload = await response.json();
    controller.signal.throwIfAborted();
    if (!response.ok) throw new ApiError(payload?.error?.message || "Request failed", response.status, payload?.error?.fields);
    if (!payload || typeof payload !== "object" || !("data" in payload)) throw new ApiError("Invalid server response", 502);
    return payload as Envelope<T>;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", cancel);
  }
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<Envelope<T>> {
  const attempts = !options.method || options.method === "GET" ? 3 : 1;
  for (let attempt = 0; ; attempt++) {
    try { return await requestOnce<T>(url, options); }
    catch (error) {
      if (options.signal?.aborted || attempt + 1 >= attempts ||
        (error instanceof ApiError && error.status < 500)) throw error;
      await new Promise<void>((resolve, reject) => {
        const signal = options.signal;
        const cancel = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
        const timer = setTimeout(() => { signal?.removeEventListener("abort", cancel); resolve(); }, 500 * 2 ** attempt);
        signal?.addEventListener("abort", cancel, { once: true });
        if (signal?.aborted) cancel();
      });
    }
  }
}

export function requestMessage(error: unknown): string {
  if (error instanceof ApiError) return error.status >= 500 ? "Could not access customer data. Please try again." : error.message;
  return "Could not connect to the server. Please try again.";
}
