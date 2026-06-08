const LL2_UPSTREAM =
  process.env.LL2_API_BASE ?? "https://ll.thespacedevs.com/2.3.0";
const CLIENT_PROXY_BASE = "/api/ll2";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryable: boolean,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; detail?: string };
    return body.message ?? body.detail ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

function getApiBase(): string {
  if (typeof window === "undefined") {
    return LL2_UPSTREAM;
  }
  return CLIENT_PROXY_BASE;
}

function resolveUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBase()}${normalized}`;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  attempt = 0,
): Promise<T> {
  const url = resolveUrl(path);

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      const retryable = isRetryableStatus(response.status);

      if (retryable && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * 2 ** attempt;
        await sleep(delay);
        return apiFetch<T>(path, init, attempt + 1);
      }

      throw new ApiError(message, response.status, retryable);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * 2 ** attempt;
      await sleep(delay);
      return apiFetch<T>(path, init, attempt + 1);
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed",
      0,
      true,
    );
  }
}
