import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { loadServerModule } from "./workspace-test-service.mjs";

test("session DTO: projects strict allowlist and redacts raw bearer tokens and IP addresses", () => {
  const accountSec = loadServerModule("../lib/auth/account-security.ts");
  const { projectSessionDto } = accountSec;

  const currentSessionId = randomUUID();
  const rawProviderSession = {
    id: currentSessionId,
    token: "secret-bearer-token-12345",
    userId: randomUUID(),
    ipAddress: "192.168.1.100",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    createdAt: new Date("2026-11-01T10:00:00Z"),
    updatedAt: new Date("2026-11-01T12:00:00Z"),
    expiresAt: new Date("2026-11-08T10:00:00Z"),
    customExtraField: "confidential-data",
  };

  const projected = projectSessionDto(rawProviderSession, currentSessionId);

  // Allowlisted properties ONLY
  const allowedKeys = new Set([
    "reference",
    "current",
    "createdAt",
    "lastActiveAt",
    "expiresAt",
    "deviceLabel",
  ]);

  for (const k of Object.keys(projected)) {
    assert.ok(
      allowedKeys.has(k),
      `Prohibited property exposed in session DTO: ${k}`,
    );
  }

  assert.equal(projected.reference, currentSessionId);
  assert.equal(projected.current, true);
  assert.equal(projected.createdAt, "2026-11-01T10:00:00.000Z");
  assert.equal(projected.lastActiveAt, "2026-11-01T12:00:00.000Z");
  assert.equal(projected.expiresAt, "2026-11-08T10:00:00.000Z");
  assert.ok(
    typeof projected.deviceLabel === "string" &&
      projected.deviceLabel.length > 0,
  );

  // Prohibited fields must be strictly omitted
  assert.equal("token" in projected, false);
  assert.equal("ipAddress" in projected, false);
  assert.equal("userId" in projected, false);
  assert.equal("customExtraField" in projected, false);
});

test("current session marker: derived strictly from caller session, never client input", () => {
  const accountSec = loadServerModule("../lib/auth/account-security.ts");
  const { projectSessionDto } = accountSec;

  const currentSessionId = randomUUID();
  const otherSessionId = randomUUID();

  const currentItem = projectSessionDto(
    {
      id: currentSessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(),
    },
    currentSessionId,
  );
  assert.equal(currentItem.current, true);

  const otherItem = projectSessionDto(
    {
      id: otherSessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(),
    },
    currentSessionId,
  );
  assert.equal(otherItem.current, false);
});

test("page & cursor bounds: defaults to 20, caps at 100, opaque cursor binds account", () => {
  const accountSec = loadServerModule("../lib/auth/account-security.ts");
  const { parseSessionPagination, encodeSessionCursor, decodeSessionCursor } =
    accountSec;

  // 1. Defaults
  const def = parseSessionPagination({});
  assert.equal(def.limit, 20);
  assert.equal(def.cursor, null);

  // 2. Custom valid limit
  const custom = parseSessionPagination({ limit: "50" });
  assert.equal(custom.limit, 50);

  // 3. Clamped / rejected limit over 100
  assert.throws(
    () => parseSessionPagination({ limit: "101" }),
    (err) => err.code === "VALIDATION" && err.statusHttp === 400,
  );
  assert.throws(
    () => parseSessionPagination({ limit: "-5" }),
    (err) => err.code === "VALIDATION" && err.statusHttp === 400,
  );
  assert.throws(
    () => parseSessionPagination({ limit: "abc" }),
    (err) => err.code === "VALIDATION" && err.statusHttp === 400,
  );

  // 4. Cursor roundtrip bound to account
  const userId = randomUUID();
  const foreignUserId = randomUUID();
  const cursorToken = encodeSessionCursor(userId, 20);

  const decoded = decodeSessionCursor(cursorToken, userId);
  assert.equal(decoded.offset, 20);

  // Foreign account cannot reuse cursor
  assert.throws(
    () => decodeSessionCursor(cursorToken, foreignUserId),
    (err) => err.code === "VALIDATION" && err.statusHttp === 400,
  );
});

test("upstream freshness failure: reports 503 UNAVAILABLE without leaking provider details", async () => {
  const accountSec = loadServerModule("../lib/auth/account-security.ts");
  const { listOwnSessions } = accountSec;

  const userId = randomUUID();
  const sessionId = randomUUID();

  // Adapter that throws an upstream failure
  const failingAdapter = {
    listSessions: async () => {
      throw new Error("Neon Better Auth connection timeout");
    },
  };

  await assert.rejects(
    async () => listOwnSessions({ userId, sessionId }, {}, failingAdapter),
    (err) => {
      assert.equal(err.code, "UNAVAILABLE");
      assert.equal(err.statusHttp, 503);
      assert.ok(!err.message.includes("Better Auth")); // Redacts internal provider names/stacks
      return true;
    },
  );
});
