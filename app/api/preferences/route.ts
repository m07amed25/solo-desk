import { NextResponse } from "next/server";
import { createTranslator } from "next-intl";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import { parsePreferences, preferenceLimit } from "@/lib/site";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const fail = (status: number) => {
    const locale = request.headers.get("cookie")?.split(";").some((value) => value.trim() === "solodesk-locale=ar") ? "ar" : "en";
    const t = createTranslator({locale, messages: locale === "ar" ? ar : en, namespace: "Common"});
    return new Response(t("preferenceError"), { status, headers: { "Cache-Control": "private, no-store", "Content-Type": "text/plain; charset=utf-8" } });
  };
  if (request.headers.get("origin") !== origin) return fail(403);
  if (!/^application\/x-www-form-urlencoded(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "")) return fail(415);
  if (Number(request.headers.get("content-length")) > preferenceLimit) return fail(413);
  const reader = request.body?.getReader();
  if (!reader) return fail(400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > preferenceLimit) { await reader.cancel(); return fail(413); }
      chunks.push(value);
    }
  } catch { return fail(400); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let body;
  try { body = new TextDecoder("utf-8", {fatal: true}).decode(bytes); } catch { return fail(400); }
  const prefs = parsePreferences(body);
  if (!prefs) return fail(400);
  const response = NextResponse.redirect(new URL(prefs.returnTo, origin), 303);
  response.headers.set("Cache-Control", "private, no-store");
  for (const [name, value] of [["solodesk-locale", prefs.locale], ["solodesk-theme", prefs.theme]]) {
    response.cookies.set(name, value, { path: "/", maxAge: 31536000, httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:" });
  }
  return response;
}
