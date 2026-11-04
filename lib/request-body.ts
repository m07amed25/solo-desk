// Bound allocation even when a client omits or lies about Content-Length.
export async function readRequestBody(request: Request, maxBytes = 16_384) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        // A cloned request waits for its unread sibling when cancellation is awaited.
        void reader.cancel().catch(() => {});
        throw new RangeError("Request body too large");
      }
      chunks.push(value);
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
  } finally {
    reader.releaseLock();
  }
}
