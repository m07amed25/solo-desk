import { Button, Heading, Link, Section, Text } from "react-email";
import EmailLayout from "./components/email-layout";

export const authSubjects = {
  "email-verification": "Verify your email address",
  "forget-password": "Reset your password",
  "sign-in": "Sign in to SoloDesk",
};

export type AuthMessageProps = {
  name: string;
  purpose: keyof typeof authSubjects;
  expiresAt: string;
} & ({ code: string; url?: never } | { url: string; code?: never });

export default function AuthMessage({
  name = AuthMessage.PreviewProps.name,
  purpose = AuthMessage.PreviewProps.purpose,
  url,
  code = url ? undefined : AuthMessage.PreviewProps.code,
  expiresAt = AuthMessage.PreviewProps.expiresAt,
}: AuthMessageProps) {
  const heading = authSubjects[purpose];
  return (
    <EmailLayout preview={heading}>
      <Heading
        as="h1"
        style={{
          margin: "0 0 20px",
          fontSize: "30px",
          lineHeight: "36px",
          letterSpacing: "-1px",
        }}
      >
        {heading}.
      </Heading>
      <Text style={{ fontSize: "16px", lineHeight: "26px" }}>
        Hi <bdi>{name || "there"}</bdi>,
      </Text>
      <Text style={{ fontSize: "16px", lineHeight: "26px" }}>
        {code
          ? "Enter this code in SoloDesk to continue."
          : "Use the button below to continue securely to SoloDesk."}
      </Text>
      {code ? (
        <Section
          className="email-panel"
          style={{
            backgroundColor: "#f7f7f7",
            borderRadius: "8px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <Text
            dir="ltr"
            style={{
              margin: 0,
              fontFamily: "Geist Mono, monospace",
              fontSize: "36px",
              fontWeight: 700,
              letterSpacing: "8px",
            }}
          >
            {code}
          </Text>
        </Section>
      ) : (
        <Button
          className="email-button"
          href={url}
          style={{
            padding: "14px 22px",
            backgroundColor: "#000000",
            color: "#ffffff",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          {heading}
        </Button>
      )}
      <Text
        className="email-muted"
        style={{ color: "#666666", fontSize: "13px", lineHeight: "22px" }}
      >
        Expires {new Date(expiresAt).toUTCString()}. Never share this{" "}
        {code ? "code" : "link"} with anyone.
      </Text>
      {url && (
        <Text
          className="email-muted"
          style={{
            color: "#666666",
            fontSize: "12px",
            lineHeight: "20px",
            overflowWrap: "anywhere",
          }}
        >
          Button not working? Open this link:
          <br />
          <Link
            href={url}
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            {url}
          </Link>
        </Text>
      )}
      <Text
        className="email-muted"
        style={{
          color: "#666666",
          fontSize: "13px",
          lineHeight: "22px",
          marginBottom: 0,
        }}
      >
        If you didn’t request this, you can ignore this email.
      </Text>
    </EmailLayout>
  );
}

AuthMessage.PreviewProps = {
  name: "Alex",
  purpose: "email-verification",
  code: "482913",
  expiresAt: "2030-01-01T12:10:00.000Z",
} satisfies AuthMessageProps;
