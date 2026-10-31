import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { createElement } from "react";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { render, toPlainText } from "react-email";
import nodemailer from "nodemailer";
import nextServer from "next/server";
import ContactMessage from "../emails/contact-message";
import AuthMessage from "../emails/auth-message";
import {
  generateTimestampToken,
  verifyTimestampToken,
  resetRateLimitsForTesting,
} from "../lib/contact";
import {
  parseEmailEvent,
  verifyEmailWebhook,
  deliverAuthEmailOnce,
} from "../lib/auth/email-webhook";
import { GET, POST } from "../app/api/contact/route";
import { POST as authPOST } from "../app/api/webhooks/neon-auth/route";
import { db } from "../lib/db";

Object.assign(process.env, {
  BETTER_AUTH_SECRET: "synthetic-contact-signing-secret-at-least-32",
  SOLODESK_CONTACT_ENABLED: "true",
  SMTP_HOST: "smtp.example.invalid",
  SMTP_PORT: "465",
  SMTP_SECURE: "true",
  SMTP_USER: "sender@example.com",
  SMTP_PASSWORD: "synthetic-password",
  SMTP_FROM: "sender@example.com",
  SOLODESK_CONTACT_RECIPIENT_EMAIL: "inbox@example.com",
  NEON_AUTH_BASE_URL: "https://auth.example.com",
});

const input = {
  name: "Alex",
  email: "alex@example.com",
  topic: "general",
  message: "Please tell me more about SoloDesk.",
  consent: true,
  website_url: "",
};
const future = new Date(Date.now() + 600_000).toISOString();
const event = {
  event_id: "a182d8ae-d11c-4ef3-a7df-c2979312be22",
  event_type: "send.otp",
  user: { name: "Alex", email: "alex@example.com" },
  event_data: {
    otp_type: "email-verification",
    otp_code: "123456",
    expires_at: future,
  },
};

function request(body, overrides = {}) {
  return new Request("https://solodesk.example/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://solodesk.example",
      "x-real-ip": "192.0.2.1",
      ...overrides,
    },
    body: JSON.stringify(body),
  });
}

test("auth subjects and headings use SoloDesk regardless of provider branding", async () => {
  for (const purpose of ["email-verification", "forget-password", "sign-in"]) {
    for (const eventType of ["send.otp", "send.magic_link"]) {
      const parsed = parseEmailEvent({
        ...event,
        event_type: eventType,
        context: { project_name: "Neon" },
        event_data: eventType === "send.otp"
          ? { ...event.event_data, otp_type: purpose }
          : {
              link_type: purpose,
              link_url: "https://auth.example.com/verify?token=test",
              expires_at: future,
            },
      });
      assert.match(parsed.subject, /SoloDesk/);
      assert.doesNotMatch(parsed.subject, /neon/i);
      const html = await render(createElement(AuthMessage, parsed.props));
      assert.match(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "", /SoloDesk/);
      assert.match(html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? "", /سولو ديسك/);
      assert.doesNotMatch(html, /neon/i);
    }
  }
});

test("templates escape visitor text and provide readable HTML and plain text", async () => {
  const html = await render(
    createElement(ContactMessage, {
      ...input,
      name: '<img src=x onerror="alert(1)">',
      message: "<script>alert(1)</script>\nمرحبا",
      email: "alex?subject=evil@example.com",
    }),
  );
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img src=x"));
  assert.match(html, /mailto:alex%3Fsubject%3Devil%40example.com/);
  assert.match(html, /dir="auto"/);
  assert.match(toPlainText(html), /مرحبا/);

  // AuthMessage with leading zeros, malicious name injection, and bilingual content
  const maliciousAuthName = '<script>alert("xss")</script> أحمد';
  const code = await render(
    createElement(AuthMessage, {
      name: maliciousAuthName,
      purpose: "email-verification",
      code: "001234",
      expiresAt: future,
    }),
  );
  const plainTextCode = toPlainText(code);

  // Escaped name, no raw script tag
  assert.ok(code.includes("&lt;script&gt;"));
  assert.ok(!code.includes('<script>alert("xss")</script>'));

  // Leading zeros preserved as exact 6-digit string
  assert.match(code, /001234/);
  assert.match(plainTextCode, /001234/);
  assert.match(code, /dir="ltr"/);

  // Bilingual content in HTML and plain text
  assert.match(code, /Verify your email address/);
  assert.match(code, /تأكيد عنوان بريدك الإلكتروني/);
  assert.match(plainTextCode, /تأكيد عنوان بريدك الإلكتروني/);
  assert.match(code, /مرحباً/);

  // Reset password bilingual message
  const reset = await render(
    createElement(AuthMessage, {
      name: "Alex",
      purpose: "forget-password",
      url: "https://auth.example.com/reset?token=test",
      expiresAt: future,
    }),
  );
  assert.match(reset, /Reset your password/);
  assert.match(reset, /إعادة تعيين كلمة المرور/);
  assert.match(
    toPlainText(reset),
    /https:\/\/auth.example.com\/reset\?token=test/,
  );

  // Reset password code-based bilingual message
  const resetCode = await render(
    createElement(AuthMessage, {
      name: "Tariq",
      purpose: "forget-password",
      code: "045678",
      expiresAt: future,
    }),
  );
  assert.match(resetCode, /Reset your password/);
  assert.match(resetCode, /إعادة تعيين كلمة المرور/);
  assert.match(resetCode, /045678/);
  assert.match(resetCode, /dir="ltr"/);
  assert.doesNotMatch(resetCode, /token=/);
});

test("contact tokens reject test bypasses, tampering, instant and expired submissions", () => {
  assert.equal(verifyTimestampToken("ts_123_valid").valid, false);
  assert.equal(verifyTimestampToken(generateTimestampToken()).valid, false);
  assert.equal(
    verifyTimestampToken(generateTimestampToken(Date.now() - 4_000)).valid,
    true,
  );
  assert.equal(
    verifyTimestampToken(generateTimestampToken(Date.now() - 3_601_000)).valid,
    false,
  );
  assert.equal(
    verifyTimestampToken(generateTimestampToken(Date.now() - 4_000) + "_extra")
      .valid,
    false,
  );
  const token = generateTimestampToken(Date.now() - 4_000);
  assert.equal(
    verifyTimestampToken(token.slice(0, -1) + (token.endsWith("0") ? "1" : "0"))
      .valid,
    false,
  );
});

test("contact sends to the fixed inbox with Reply-To, and never invents delivery success", async () => {
  const sent = [];
  let rejectDelivery = false;
  const transport = mock.method(nodemailer, "createTransport", (options) => {
    assert.equal(options.secure, true);
    assert.equal(options.disableFileAccess, true);
    assert.equal(options.disableUrlAccess, true);
    return {
      sendMail: async (mail) => {
        if (rejectDelivery) throw new Error("SENSITIVE SMTP FAILURE");
        sent.push(mail);
        return { accepted: [mail.to.address], rejected: [] };
      },
    };
  });
  const logs = [];
  const info = mock.method(console, "info", (value) => logs.push(value));
  const error = mock.method(console, "error", (value) => logs.push(value));
  const connection = mock.method(nextServer, "connection", async () => {});
  try {
    resetRateLimitsForTesting();
    const tokenResponse = await GET();
    assert.equal(tokenResponse.headers.get("cache-control"), "no-store");
    assert.match((await tokenResponse.json()).token, /^ts_/);
    const body = {
      ...input,
      _token: generateTimestampToken(Date.now() - 4_000),
    };
    assert.equal((await POST(request(null))).status, 400);
    assert.equal(
      (await POST(request({ ...body, consent: false }))).status,
      400,
    );
    assert.equal(
      (await POST(request(body, { origin: "https://evil.example" }))).status,
      403,
    );
    assert.equal(
      (await POST(request({ ...body, message: "x".repeat(17_000) }))).status,
      413,
    );
    assert.equal(sent.length, 0);
    assert.equal((await POST(request(body))).status, 200);
    assert.equal(sent.length, 2);
    assert.equal(sent[0].to.address, "inbox@example.com");
    assert.equal(sent[0].replyTo.address, input.email);
    assert.equal(sent[0].from.address, "sender@example.com");
    assert.match(sent[0].text, /Please tell me more/);
    assert.equal(sent[1].to.address, input.email);
    assert.equal(sent[1].replyTo.address, "inbox@example.com");
    assert.match(sent[1].text, /Your message is with us/i);
    assert.match(sent[1].text, /Please tell me more/);
    rejectDelivery = true;
    const failure = await POST(request(body));
    assert.equal(failure.status, 503);
    assert.equal((await failure.json()).ok, false);
    const originalRecipient = process.env.SOLODESK_CONTACT_RECIPIENT_EMAIL;
    delete process.env.SOLODESK_CONTACT_RECIPIENT_EMAIL;
    assert.equal((await POST(request(body))).status, 503);
    process.env.SOLODESK_CONTACT_RECIPIENT_EMAIL = originalRecipient;
    assert.equal((await POST(request(body))).status, 429);
    assert.ok(!logs.join(" ").includes(input.email));
    assert.ok(!logs.join(" ").includes(input.message));
    assert.ok(!logs.join(" ").includes("SENSITIVE"));
  } finally {
    transport.mock.restore();
    info.mock.restore();
    error.mock.restore();
    connection.mock.restore();
  }
});

test("Neon webhook verifies the exact signed body and rejects replay/forgery", async () => {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const jwk = { ...publicKey.export({ format: "jwk" }), kid: "test-key" };
  const fetchMock = mock.method(globalThis, "fetch", async (url) => {
    assert.equal(url, "https://auth.example.com/.well-known/jwks.json");
    return Response.json({ keys: [jwk] });
  });
  function signedHeaders(
    raw,
    timestamp = String(Date.now()),
    algorithm = "EdDSA",
  ) {
    const header = Buffer.from(
      JSON.stringify({ alg: algorithm, kid: "test-key" }),
    ).toString("base64url");
    const payload = Buffer.from(
      `${timestamp}.${Buffer.from(raw).toString("base64url")}`,
    ).toString("base64url");
    const signature = sign(
      null,
      Buffer.from(`${header}.${payload}`),
      privateKey,
    ).toString("base64url");
    return new Headers({
      "x-neon-signature": `${header}..${signature}`,
      "x-neon-signature-kid": "test-key",
      "x-neon-timestamp": timestamp,
    });
  }
  try {
    const raw = JSON.stringify(event);
    assert.equal(
      (await verifyEmailWebhook(raw, signedHeaders(raw))).props.code,
      "123456",
    );
    await assert.rejects(verifyEmailWebhook(raw + " ", signedHeaders(raw)));
    await assert.rejects(verifyEmailWebhook(raw, new Headers()));
    await assert.rejects(
      verifyEmailWebhook(raw, signedHeaders(raw, String(Date.now() - 301_000))),
    );
    await assert.rejects(
      verifyEmailWebhook(raw, signedHeaders(raw, String(Date.now() + 301_000))),
    );
    await assert.rejects(
      verifyEmailWebhook(raw, signedHeaders(raw, String(Date.now()), "none")),
    );
    assert.throws(() =>
      parseEmailEvent({
        ...event,
        event_data: { ...event.event_data, delivery_preference: "sms" },
      }),
    );
    assert.throws(() =>
      parseEmailEvent({
        ...event,
        event_data: { ...event.event_data, expires_at: "2000-01-01" },
      }),
    );
    assert.throws(() =>
      parseEmailEvent({
        ...event,
        user: { email: "a@example.com\r\nBcc:x@example.com" },
      }),
    );
    const magic = {
      ...event,
      event_type: "send.magic_link",
      event_data: {
        link_type: "forget-password",
        link_url: "https://auth.example.com/reset?token=test",
        expires_at: future,
      },
    };
    assert.equal(parseEmailEvent(magic).props.purpose, "forget-password");
    assert.throws(() =>
      parseEmailEvent({
        ...magic,
        event_data: { ...magic.event_data, link_url: "javascript:alert(1)" },
      }),
    );
    assert.throws(() =>
      parseEmailEvent({
        ...magic,
        event_data: {
          ...magic.event_data,
          link_url: "https://evil.example/reset",
        },
      }),
    );
    delete process.env.SOLODESK_AUTH_EMAIL_ENABLED;
    assert.equal((await authPOST(request(event))).status, 503);
    process.env.SOLODESK_AUTH_EMAIL_ENABLED = "true";
    assert.equal((await authPOST(request(event))).status, 400);
  } finally {
    fetchMock.mock.restore();
  }
});

test("durable receipts deduplicate success and prevent automatic resends after uncertain failure", async () => {
  const receipts = new Map();
  const queryMock = mock.method(db, "query", async (sql, params) => {
    const id = params[0];
    if (sql.startsWith("INSERT")) {
      if (receipts.has(id)) return { rowCount: 0 };
      receipts.set(id, { payload_hash: params[1], sent_at: null });
      return { rowCount: 1 };
    }
    if (sql.startsWith("SELECT")) return { rows: [receipts.get(id)] };
    if (sql.startsWith("UPDATE")) receipts.get(id).sent_at = new Date();
    return { rowCount: 1 };
  });
  try {
    let sends = 0;
    const send = async () => {
      sends++;
    };
    await deliverAuthEmailOnce("payload", event.event_id, send);
    await deliverAuthEmailOnce("payload", event.event_id, send);
    assert.equal(sends, 1);
    assert.equal(
      receipts.get(event.event_id).payload_hash,
      createHash("sha256").update("payload").digest("hex"),
    );
    await assert.rejects(deliverAuthEmailOnce("altered", event.event_id, send));
    await assert.rejects(
      deliverAuthEmailOnce("payload", "uncertain", async () => {
        sends++;
        throw new Error("SMTP timeout");
      }),
    );
    await assert.rejects(deliverAuthEmailOnce("payload", "uncertain", send));
    assert.equal(sends, 2);
  } finally {
    queryMock.mock.restore();
  }
});
