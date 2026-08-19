const waitsMs = [0, 400, 1200, 2500];

function errorText(error: unknown, depth = 0): string {
  if (depth > 6 || error == null) {
    return "";
  }

  if (typeof error !== "object") {
    return String(error);
  }

  const record = error as {
    message?: unknown;
    cause?: unknown;
    sourceError?: unknown;
  };

  return [
    typeof record.message === "string" ? record.message : "",
    errorText(record.cause, depth + 1),
    errorText(record.sourceError, depth + 1),
  ].join(" ");
}

export function isTransientNeonConnectError(error: unknown): boolean {
  return /fetch failed|Error connecting to database|other side closed|ECONNRESET|UND_ERR_SOCKET/i.test(
    errorText(error),
  );
}

export async function withNeonRetry<T>(run: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (const wait of waitsMs) {
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (!isTransientNeonConnectError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}
