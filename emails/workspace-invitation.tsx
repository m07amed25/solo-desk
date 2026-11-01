import { Button, Heading, Hr, Section, Text } from "react-email";
import EmailLayout from "./components/email-layout";

export const invitationSubject =
  "Invitation to join workspace on SoloDesk · دعوة للانضمام إلى مساحة عمل على سولو ديسك";

export interface WorkspaceInvitationEmailProps {
  inviterName: string;
  workspaceName: string;
  recipientEmail: string;
  role: "admin" | "member";
  inviteUrl: string;
  expiresAt: string;
}

const DEFAULT_PREVIEW_EXPIRY = "2026-11-04T00:00:00.000Z";

export default function WorkspaceInvitationEmail({
  inviterName = "A team member",
  workspaceName = "SoloDesk Team",
  recipientEmail = "colleague@example.com",
  role = "member",
  inviteUrl = "https://solodesk.com/app#invitation=preview-token",
  expiresAt = DEFAULT_PREVIEW_EXPIRY,
}: WorkspaceInvitationEmailProps) {
  const expiryUtc = new Date(expiresAt).toUTCString();

  return (
    <EmailLayout preview={invitationSubject}>
      {/* English Section (LTR) */}
      <Section dir="ltr" style={{ textAlign: "left", marginBottom: "24px" }}>
        <Heading
          as="h1"
          style={{
            margin: "0 0 12px",
            fontSize: "22px",
            lineHeight: "28px",
            fontWeight: 700,
            color: "#09090b",
          }}
        >
          Join {workspaceName} on SoloDesk
        </Heading>
        <Text
          style={{
            fontSize: "15px",
            lineHeight: "24px",
            color: "#3f3f46",
            margin: "0 0 16px",
          }}
        >
          <strong>{inviterName}</strong> has invited you (
          <strong>{recipientEmail}</strong>) to collaborate as an{" "}
          <strong>{role}</strong> in <strong>{workspaceName}</strong>.
        </Text>

        <Section style={{ margin: "20px 0" }}>
          <Button
            href={inviteUrl}
            className="email-button"
            style={{
              display: "inline-block",
              backgroundColor: "#09090b",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Accept Invitation
          </Button>
        </Section>

        <Text
          className="email-muted"
          style={{
            fontSize: "13px",
            lineHeight: "20px",
            color: "#71717a",
            margin: "0 0 8px",
          }}
        >
          This invitation expires at <strong>{expiryUtc}</strong> (72 hours from
          issue).
        </Text>
        <Text
          className="email-muted"
          style={{
            fontSize: "12px",
            lineHeight: "18px",
            color: "#a1a1aa",
            margin: 0,
          }}
        >
          If you were not expecting this invitation, you can safely ignore this
          email.
        </Text>
      </Section>

      <Hr
        className="email-divider"
        style={{ borderColor: "#e4e4e7", margin: "24px 0" }}
      />

      {/* Arabic Section (RTL) */}
      <Section dir="rtl" style={{ textAlign: "right" }}>
        <Heading
          as="h1"
          style={{
            margin: "0 0 12px",
            fontSize: "22px",
            lineHeight: "28px",
            fontWeight: 700,
            color: "#09090b",
          }}
        >
          انضم إلى {workspaceName} على سولو ديسك
        </Heading>
        <Text
          style={{
            fontSize: "15px",
            lineHeight: "24px",
            color: "#3f3f46",
            margin: "0 0 16px",
          }}
        >
          لقد قام <strong>{inviterName}</strong> بدعوتك (
          <strong>{recipientEmail}</strong>) للانضمام بصلاحية{" "}
          <strong>{role === "admin" ? "مسؤول" : "عضو"}</strong> في مساحة العمل{" "}
          <strong>{workspaceName}</strong>.
        </Text>

        <Section style={{ margin: "20px 0" }}>
          <Button
            href={inviteUrl}
            className="email-button"
            style={{
              display: "inline-block",
              backgroundColor: "#09090b",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            قبول الدعوة
          </Button>
        </Section>

        <Text
          className="email-muted"
          style={{
            fontSize: "13px",
            lineHeight: "20px",
            color: "#71717a",
            margin: "0 0 8px",
          }}
        >
          تنتهي صلاحية هذه الدعوة في <strong>{expiryUtc}</strong> (خلال 72 ساعة
          من إصدارها).
        </Text>
        <Text
          className="email-muted"
          style={{
            fontSize: "12px",
            lineHeight: "18px",
            color: "#a1a1aa",
            margin: 0,
          }}
        >
          إذا لم تكن تتوقع تلقي هذه الدعوة، يمكنك تجاهل هذه الرسالة بأمان.
        </Text>
      </Section>
    </EmailLayout>
  );
}
