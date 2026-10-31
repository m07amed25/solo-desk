import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";
import type { ReactNode } from "react";

export default function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`@media (prefers-color-scheme: dark) {
          .email-body { background: #09090b !important; }
          .email-card { background: #18181b !important; border-color: #27272a !important; color: #f4f4f5 !important; }
          .email-muted { color: #a1a1aa !important; }
          .email-panel { background: #27272a !important; border-color: #3f3f46 !important; color: #fafafa !important; }
          .email-code-box { background: #09090b !important; border-color: #3f3f46 !important; color: #ffffff !important; }
          .email-button { background: #ffffff !important; color: #000000 !important; }
          .email-divider { border-color: #27272a !important; }
          .email-badge { background: #27272a !important; color: #e4e4e7 !important; border-color: #3f3f46 !important; }
          .email-security { background: #27272a !important; border-color: #3f3f46 !important; color: #f4f4f5 !important; }
        }`}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="email-body"
        style={{
          backgroundColor: "#f4f4f5",
          margin: 0,
          padding: "40px 12px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: "#09090b",
        }}
      >
        <Container
          className="email-card"
          style={{
            maxWidth: "560px",
            backgroundColor: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
          }}
        >
          <Section style={{ padding: "32px 32px 0" }}>
            <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
              <tbody>
                <tr>
                  <td align="left" style={{ verticalAlign: "middle" }}>
                    <Text
                      style={{
                        margin: 0,
                        fontSize: "22px",
                        fontWeight: 700,
                        letterSpacing: "-0.5px",
                        color: "#09090b",
                      }}
                    >
                      SoloDesk
                    </Text>
                  </td>
                  <td align="right" style={{ verticalAlign: "middle" }}>
                    <span
                      className="email-badge"
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: "#71717a",
                        backgroundColor: "#f4f4f5",
                        borderRadius: "9999px",
                        border: "1px solid #e4e4e7",
                      }}
                    >
                      Security · الأمان
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <Text
              className="email-muted"
              style={{
                color: "#71717a",
                fontSize: "13px",
                margin: "6px 0 24px",
              }}
            >
              Your work. Your space. · مساحة عملك المستقل
            </Text>
            <Hr
              className="email-divider"
              style={{ borderColor: "#e4e4e7", margin: 0 }}
            />
          </Section>
          <Section style={{ padding: "32px" }}>{children}</Section>
          <Section style={{ padding: "0 32px 28px" }}>
            <Hr
              className="email-divider"
              style={{ borderColor: "#e4e4e7", margin: "0 0 16px" }}
            />
            <Text
              className="email-muted"
              style={{
                color: "#71717a",
                fontSize: "12px",
                lineHeight: "20px",
                margin: 0,
              }}
            >
              Sent securely by SoloDesk. Keep your independent work moving.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
