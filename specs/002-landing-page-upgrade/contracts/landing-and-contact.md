# Interface & Navigation Contract: Landing Upgrade and Contact Service

**Date**: 2026-10-30 | **Spec**: [spec.md](../spec.md) | **Model**: [data-model.md](../data-model.md)

---

## 1. Landing Page Section Layout & Anchor Registry

The landing page MUST present sections in the exact sequence defined below. Each section MUST have a
stable HTML `id` used for deep-linking, active-section observation, and keyboard skip-links.

| Order | Section ID      | Heading Level | Purpose & Component                                                           |
| ----- | --------------- | ------------- | ----------------------------------------------------------------------------- |
| 0     | `#main-content` | (skip target) | Main document wrapper                                                         |
| 1     | `#hero`         | `h1`          | Primary value statement, highlights, CTA buttons, visual hero                 |
| 2     | `#highlights`   | `h2` (sr)     | Supporting highlight metrics / value pillars                                  |
| 3     | `#tour`         | `h2`          | Interactive 5-area product tour (Clients, Projects, Time, Invoices, Insights) |
| 4     | `#features`     | `h2`          | 8-item detailed technical capability grid                                     |
| 5     | `#how-it-works` | `h2`          | 4-step progressive journey from account to invoice                            |
| 6     | `#why-solodesk` | `h2`          | 4 core product principles (exactness, speed, state, privacy)                  |
| 7     | `#security`     | `h2`          | Plain-language security, privacy, and isolation commitments                   |
| 8     | `#audience`     | `h2`          | 3 distinct professional developer use cases                                   |
| 9     | `#roadmap`      | `h2`          | Current availability matrix (Available, In Development, Planned)              |
| 10    | `#faq`          | `h2`          | Collapsible question & answer accordion                                       |
| 11    | `#contact`      | `h2`          | Secure visitor contact form with consent                                      |
| 12    | `#closing`      | `h2`          | Final call-to-action banner leading to `/sign-up`                             |
| 13    | (footer)        | `h3`          | Grouped navigation (Product, Company, Account, Preferences, Legal)            |

---

## 2. Contact API Contract (`POST /api/contact`)

### Ingress Requirements

- **URL**: `/api/contact`
- **Method**: `POST`
- **Supported Content-Types**:
  - `application/json`
  - `application/x-www-form-urlencoded` (native HTML form submission)
- **Origin Validation**: Request MUST come from same origin (`Sec-Fetch-Site: same-origin` or matching host).

### Request Payload Schema

```json
{
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "topic": "team",
  "message": "We have 4 engineers and need to know about team workspace availability.",
  "consent": true,
  "website_url": "",
  "_token": "ts_1730248800_signature"
}
```

### Field Constraints

| Field         | Type      | Required | Constraints                                                                    |
| ------------- | --------- | -------- | ------------------------------------------------------------------------------ |
| `name`        | `string`  | Yes      | 1–100 characters. Trimmed. No control characters.                              |
| `email`       | `string`  | Yes      | 5–254 characters. Standard email syntax regex. Normalized lowercase.           |
| `topic`       | `string`  | Yes      | Must be one of: `"general"`, `"team"`, `"billing"`, `"security"`, `"feedback"` |
| `message`     | `string`  | Yes      | 10–2000 characters. Plain text only.                                           |
| `consent`     | `boolean` | Yes      | Must be strictly `true`.                                                       |
| `website_url` | `string`  | No       | Honeypot field. Must be empty. If non-empty, submission is rejected.           |
| `_token`      | `string`  | Yes      | Generated time-token. Submissions < 3.0s or > 3600s rejected.                  |

### Response Schemas

#### 1. Success (`200 OK`)

```json
{
  "ok": true,
  "status": "accepted",
  "message": "Your message has been received."
}
```

#### 2. Validation Failure (`400 Bad Request`)

```json
{
  "ok": false,
  "error": "validationFailed",
  "fields": {
    "email": "invalidEmail",
    "consent": "consentRequired"
  }
}
```

#### 3. Rate Limited (`429 Too Many Requests`)

```json
{
  "ok": false,
  "error": "rateLimited",
  "retryAfter": 600,
  "message": "Too many requests. Please wait before submitting again."
}
```

#### 4. Service Unavailable / Feature Gated (`503 Service Unavailable`)

```json
{
  "ok": false,
  "error": "serviceUnavailable",
  "message": "The contact service is temporarily unavailable."
}
```

---

## 3. Single Source of Truth Contract (`lib/site-content.ts`)

Exported types and authoritative status definitions:

```typescript
export type AvailabilityStatus = "available" | "inDevelopment" | "planned";

export interface CapabilityAreaDefinition {
  readonly id: "clients" | "projects" | "time" | "invoices" | "insights";
  readonly status: AvailabilityStatus;
  readonly iconName: string;
  readonly detailCount: number;
}

export interface FeatureDefinition {
  readonly id: string;
  readonly status: AvailabilityStatus;
  readonly areaId:
    "clients" | "projects" | "time" | "invoices" | "insights" | "platform";
  readonly iconName: string;
}

export interface JourneyStepDefinition {
  readonly step: number;
  readonly id: string;
  readonly status: AvailabilityStatus;
}

export interface PrincipleDefinition {
  readonly id: "exactness" | "speed" | "transparency" | "privacy";
  readonly iconName: string;
}

export interface FaqDefinition {
  readonly id: string;
}

// Concrete single-source status registry
export const capabilityAreas: readonly CapabilityAreaDefinition[];
export const featureGrid: readonly FeatureDefinition[];
export const journeySteps: readonly JourneyStepDefinition[];
export const principles: readonly PrincipleDefinition[];
export const faqItems: readonly FaqDefinition[];
```

---

## 4. Translation & i18n Contract

All text in the upgraded landing page MUST be strictly localized under the `Landing` namespace in
`messages/en.json` and `messages/ar.json` with 100% key parity.

### Catalog Structure

```json
{
  "Landing": {
    "highlights": { ... },
    "tour": {
      "heading": "...",
      "clients": { "title": "...", "outcome": "...", "details": ["...", "..."] },
      ...
    },
    "features": {
      "heading": "...",
      "items": { ... }
    },
    "howItWorks": {
      "heading": "...",
      "steps": { ... }
    },
    "whySoloDesk": {
      "heading": "...",
      "principles": { ... }
    },
    "security": {
      "heading": "...",
      "commitments": { ... }
    },
    "audience": {
      "heading": "...",
      "profiles": { ... }
    },
    "roadmap": {
      "heading": "...",
      "columns": { "available": "...", "inDevelopment": "...", "planned": "..." }
    },
    "faq": {
      "heading": "...",
      "questions": { ... }
    },
    "contact": {
      "heading": "...",
      "form": {
        "nameLabel": "...",
        "emailLabel": "...",
        "topicLabel": "...",
        "messageLabel": "...",
        "consentLabel": "...",
        "submitButton": "...",
        "submitting": "...",
        "successMessage": "...",
        "rateLimited": "...",
        "unavailable": "...",
        "privacyNotice": "..."
      }
    }
  }
}
```

---

## 5. Security and Privacy Traceability Matrix

| Control ID | Specification Requirement | Architecture Implementation                                                         |
| ---------- | ------------------------- | ----------------------------------------------------------------------------------- |
| SEC-023    | Input Validation          | Server-side strict schema parsing and character boundary checks in `lib/contact.ts` |
| SEC-025    | Output Encoding           | React JSX auto-escaping; plain text storage; zero `dangerouslySetInnerHTML`         |
| SEC-027    | Origin / CSRF Check       | `Sec-Fetch-Site: same-origin` check and Origin header validation on `/api/contact`  |
| SEC-029    | Rate Limiting             | In-memory sliding-window limiter (3 submissions / 10 min / IP)                      |
| SEC-030    | Log Sanitation            | Zero message text or raw emails in logs; only redacted topic and status event tags  |
| SEC-063    | Anti-Abuse (Bot Defense)  | Honeypot field and signed render timestamp (<3.0s rejection)                        |
