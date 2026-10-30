import AuthMessage from "../../../../emails/auth-message";
import { deliverAuthEmailOnce, verifyEmailWebhook } from "../../../../lib/auth/email-webhook";
import { sendEmail } from "../../../../lib/email";
import { readRequestBody } from "../../../../lib/request-body";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (process.env.SOLODESK_AUTH_EMAIL_ENABLED !== "true") {
    return Response.json({ error: "serviceUnavailable" }, { status: 503, headers });
  }
  let rawBody: string;
  try {
    rawBody = await readRequestBody(request);
  } catch {
    return Response.json({ error: "invalidPayload" }, { status: 413, headers });
  }
  let event;
  try {
    event = await verifyEmailWebhook(rawBody, request.headers);
  } catch {
    return Response.json({ error: "invalidWebhook" }, { status: 400, headers });
  }
  try {
    await deliverAuthEmailOnce(rawBody, event.id, () => sendEmail({
      to: event.to,
      subject: event.subject,
      template: <AuthMessage {...event.props} />,
      messageId: `<${event.id}@solodesk.email>`,
    }));
    return Response.json({ ok: true }, { headers });
  } catch {
    console.error(JSON.stringify({ event: "auth_email", status: "delivery_failed", event_id: event.id }));
    return Response.json({ error: "deliveryUnavailable" }, { status: 503, headers });
  }
}
