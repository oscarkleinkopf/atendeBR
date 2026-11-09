export const MAX_JSON_BODY_BYTES = 48_000;
export const MAX_TTS_AUDIO_BYTES = 256_000;

export async function readBodyWithLimit(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<{ ok: true; bytes: Uint8Array } | { ok: false }> {
  if (!body) return { ok: true, bytes: new Uint8Array() };
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return { ok: false };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false };
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, bytes: out };
}

export async function parseJsonBody(
  request: Request,
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<{ ok: true; value: unknown } | { ok: false; status: number; error: string }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const n = Number(contentLength);
    if (Number.isFinite(n) && n > maxBytes) {
      return { ok: false, status: 413, error: "Payload demasiado grande" };
    }
  }
  const read = await readBodyWithLimit(request.body, maxBytes);
  if (!read.ok) {
    return { ok: false, status: 413, error: "Payload demasiado grande" };
  }
  try {
    const text = new TextDecoder().decode(read.bytes);
    if (!text.trim()) {
      return { ok: false, status: 400, error: "JSON inválido" };
    }
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: "JSON inválido" };
  }
}
