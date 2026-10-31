import { Button, Heading, Hr, Link, Section, Text } from "react-email";
import EmailLayout from "./components/email-layout";

export const authSubjects = {
  "email-verification":
    "SoloDesk: Verify your email address · تأكيد عنوان بريدك الإلكتروني",
  "forget-password": "SoloDesk: Reset your password · إعادة تعيين كلمة المرور",
  "sign-in": "Sign in to SoloDesk · تسجيل الدخول إلى سولو ديسك",
};

const headingsEn = {
  "email-verification": "Verify your email address for SoloDesk",
  "forget-password": "Reset your password for SoloDesk",
  "sign-in": "Sign in to SoloDesk",
};

const headingsAr = {
  "email-verification": "تأكيد عنوان بريدك الإلكتروني في سولو ديسك",
  "forget-password": "إعادة تعيين كلمة المرور في سولو ديسك",
  "sign-in": "تسجيل الدخول إلى سولو ديسك",
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
  const subject = authSubjects[purpose];
  const headingEn = headingsEn[purpose];
  const headingAr = headingsAr[purpose];
  const expiryDate = new Date(expiresAt).toUTCString();

  return (
    <EmailLayout preview={subject}>
      {/* English Section (LTR) */}
      <Section dir="ltr" style={{ textAlign: "left", marginBottom: "20px" }}>
        <Heading
          as="h1"
          style={{
            margin: "0 0 12px",
            fontSize: "24px",
            lineHeight: "32px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "#09090b",
          }}
        >
          {headingEn}.
        </Heading>
        <Text
          style={{
            fontSize: "15px",
            lineHeight: "24px",
            margin: "0 0 8px",
            color: "#3f3f46",
          }}
        >
          Hi <bdi>{name || "there"}</bdi>,
        </Text>
        <Text
          style={{
            fontSize: "15px",
            lineHeight: "24px",
            margin: 0,
            color: "#3f3f46",
          }}
        >
          {code
            ? "Enter this verification code in SoloDesk to continue."
            : "Use the button below to continue securely to SoloDesk."}
        </Text>
      </Section>

      {/* Code / Action Section (Universal) */}
      {code ? (
        <Section
          className="email-panel"
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "24px 20px",
            textAlign: "center",
            margin: "24px 0",
          }}
        >
          <Text
            className="email-muted"
            style={{
              margin: "0 0 12px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#64748b",
            }}
          >
            Verification Code · رمز التحقق
          </Text>
          <div
            className="email-code-box"
            dir="ltr"
            style={{
              display: "inline-block",
              backgroundColor: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: "10px",
              padding: "12px 28px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
            }}
          >
            <Text
              dir="ltr"
              style={{
                margin: 0,
                fontFamily:
                  "ui-monospace, 'Geist Mono', 'SF Mono', Menlo, Consolas, monospace",
                fontSize: "38px",
                fontWeight: 700,
                letterSpacing: "10px",
                color: "#0f172a",
              }}
            >
              {code}
            </Text>
          </div>
          <Text
            className="email-muted"
            style={{
              margin: "14px 0 0",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            ⏱ Valid for 10 minutes · صالح لمدة 10 دقائق
          </Text>
        </Section>
      ) : (
        <Section style={{ textAlign: "center", margin: "28px 0" }}>
          <Button
            className="email-button"
            href={url}
            style={{
              padding: "14px 32px",
              backgroundColor: "#09090b",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            {headingEn} · {headingAr}
          </Button>
        </Section>
      )}

      {/* Arabic Section (RTL) */}
      <Section dir="rtl" style={{ textAlign: "right", margin: "20px 0" }}>
        <Heading
          as="h2"
          style={{
            margin: "0 0 12px",
            fontSize: "20px",
            lineHeight: "28px",
            fontWeight: 600,
            color: "#09090b",
          }}
        >
          {headingAr}.
        </Heading>
        <Text
          style={{
            fontSize: "15px",
            lineHeight: "24px",
            margin: "0 0 8px",
            color: "#3f3f46",
          }}
        >
          مرحباً <bdi>{name || "بك"}</bdi>،
        </Text>
        <Text
          style={{
            fontSize: "15px",
            lineHeight: "24px",
            margin: 0,
            color: "#3f3f46",
          }}
        >
          {code
            ? "أدخل رمز التحقق هذا في سولو ديسك للمتابعة."
            : "استخدم الزر أعلاه للمتابعة بأمان إلى سولو ديسك."}
        </Text>
      </Section>

      <Hr
        className="email-divider"
        style={{ borderColor: "#e4e4e7", margin: "24px 0 20px" }}
      />

      {/* Security Advisory Box (Bilingual) */}
      <Section
        className="email-security"
        style={{
          backgroundColor: "#f4f4f5",
          border: "1px solid #e4e4e7",
          borderRadius: "10px",
          padding: "16px",
          margin: "0 0 20px",
        }}
      >
        <Text
          dir="ltr"
          className="email-muted"
          style={{
            margin: "0 0 8px",
            fontSize: "12px",
            lineHeight: "18px",
            color: "#52525b",
            textAlign: "left",
          }}
        >
          🔒 <strong>Security Notice:</strong> Expires {expiryDate}. Never share
          this {code ? "code" : "link"} with anyone. SoloDesk staff will never
          ask for your verification code.
        </Text>
        <Text
          dir="rtl"
          className="email-muted"
          style={{
            margin: 0,
            fontSize: "12px",
            lineHeight: "18px",
            color: "#52525b",
            textAlign: "right",
          }}
        >
          🔒 <strong>تنبيه أمني:</strong> تنتهي الصلاحية في {expiryDate}. لا
          تشارك هذا {code ? "الرمز" : "الرابط"} مع أي شخص. لن يطلب منك فريق سولو
          ديسك هذا الرمز أبدًا.
        </Text>
      </Section>

      {url && (
        <Section dir="ltr" style={{ textAlign: "left", margin: "12px 0 20px" }}>
          <Text
            className="email-muted"
            style={{
              color: "#71717a",
              fontSize: "12px",
              lineHeight: "18px",
              overflowWrap: "anywhere",
              margin: 0,
            }}
          >
            Link not working? Open this address directly:
            <br />
            <Link
              href={url}
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              {url}
            </Link>
          </Text>
        </Section>
      )}

      {/* Ignore notice (Bilingual) */}
      <Section dir="ltr" style={{ textAlign: "left", margin: "16px 0 4px" }}>
        <Text
          className="email-muted"
          style={{
            color: "#a1a1aa",
            fontSize: "12px",
            lineHeight: "18px",
            margin: 0,
          }}
        >
          If you didn&apos;t request this email, you can safely ignore it.
        </Text>
      </Section>
      <Section dir="rtl" style={{ textAlign: "right", margin: "4px 0 0" }}>
        <Text
          className="email-muted"
          style={{
            color: "#a1a1aa",
            fontSize: "12px",
            lineHeight: "18px",
            margin: 0,
          }}
        >
          إذا لم تكن قد طلبت هذه الرسالة، يمكنك تجاهلها بأمان.
        </Text>
      </Section>
    </EmailLayout>
  );
}

AuthMessage.PreviewProps = {
  name: "Alex",
  purpose: "email-verification",
  code: "482913",
  expiresAt: "2030-01-01T12:10:00.000Z",
} satisfies AuthMessageProps;
