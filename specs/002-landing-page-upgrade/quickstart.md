# Quickstart Validation Guide: Detailed Public Landing Page Upgrade

**Date**: 2026-10-30 | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

This guide documents concrete, runnable verification steps for testing and validating the upgraded
landing page and the contact submission endpoint across browsers, viewports, locales, and themes.

---

## Prerequisites

1. **Development Server Running**:

   ```bash
   npm run dev
   ```

   Ensure server responds at `http://localhost:3000`.

2. **Environment Configuration**:
   - For contact form test acceptance, verify test flag in `.env.local`:
     ```bash
     SOLODESK_CONTACT_ENABLED=true
     SOLODESK_CONTACT_RECIPIENT_EMAIL=test-owner@example.com
     ```
   - When `SOLODESK_CONTACT_ENABLED` is omitted or `false`, the contact form verifies the graceful
     unavailable state.

---

## 1. Automated Verification Checks

### 1.1 Type & Lint Verification

Verify strict TypeScript compilation and lint rules pass cleanly with zero warnings:

```bash
npm run lint
npx tsc --noEmit
```

**Expected Outcome**: Clean exit with code 0.

### 1.2 Translation Key Parity Check

Verify that `messages/en.json` and `messages/ar.json` have identical key structures:

```bash
node -e '
  const en = JSON.parse(require("fs").readFileSync("messages/en.json"));
  const ar = JSON.parse(require("fs").readFileSync("messages/ar.json"));
  function getKeys(obj, prefix = "") {
    return Object.keys(obj).flatMap(k => typeof obj[k] === "object" && obj[k] !== null ? getKeys(obj[k], `${prefix}${k}.`) : `${prefix}${k}`);
  }
  const enKeys = new Set(getKeys(en.Landing));
  const arKeys = new Set(getKeys(ar.Landing));
  const diff1 = [...enKeys].filter(k => !arKeys.has(k));
  const diff2 = [...arKeys].filter(k => !enKeys.has(k));
  if (diff1.length || diff2.length) {
    console.error("Key mismatch:", { missingInAr: diff1, missingInEn: diff2 });
    process.exit(1);
  }
  console.log("Translation key parity confirmed:", enKeys.size, "keys checked.");
'
```

**Expected Outcome**: `Translation key parity confirmed: ... keys checked.`

### 1.3 Contact Endpoint HTTP Assertions (`/api/contact`)

Execute validation scenarios via `curl`:

#### A. Honeypot Rejection

```bash
curl -s -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -H "Sec-Fetch-Site: same-origin" \
  -d '{"name":"Bot","email":"bot@spam.com","topic":"general","message":"Buy now!","consent":true,"website_url":"http://spam.com","_token":"valid"}'
```

**Expected Outcome**: Rejection with status 400 or generic message without accepting submission.

#### B. Rate Limiting Test (Exceeding 3 submissions per IP)

```bash
for i in {1..4}; do
  curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -H "Sec-Fetch-Site: same-origin" \
    -d "{\"name\":\"User $i\",\"email\":\"test$i@example.com\",\"topic\":\"general\",\"message\":\"Valid inquiry $i\",\"consent\":true,\"_token\":\"ts_1730000000_valid\"}"
done
```

**Expected Outcome**: First 3 attempts return 200 (if enabled); 4th attempt returns `HTTP Status: 429` with `error: "rateLimited"`.

---

## 2. Interactive Browser Verification Scenarios

### Scenario 1: Product Tour & Keyboard Navigation (FR-004, SC-004)

1. Open `http://localhost:3000/` in desktop browser.
2. Scroll to `#tour` or click "Features" in header.
3. Use `Tab` key to focus the capability tabs (Clients, Projects & tasks, Time tracking, Invoices, Insights).
4. Use `ArrowRight` / `ArrowLeft` keys to switch active tabs.
5. **Verify**:
   - The selected tab updates the displayed outcome, bullet details, and synthetic mockup.
   - Screen reader attributes (`aria-selected="true"`, `role="tabpanel"`) update synchronously.
   - Focus outline is clearly visible (`ring-2 ring-ring`).

### Scenario 2: FAQ Accordion without JavaScript (FR-021)

1. In browser DevTools, disable JavaScript (Settings -> Preferences -> Disable JavaScript).
2. Reload `http://localhost:3000/`.
3. Scroll to `#faq`.
4. Click on `<summary>` headers of each question.
5. **Verify**:
   - Native `<details>` expands and collapses cleanly.
   - All questions and answers remain 100% readable.
   - No broken styling or clipped text.

### Scenario 3: Arabic (RTL) Layout & Mixed Direction (FR-018, SC-004)

1. In header, click the language switcher button to switch to Arabic (`/ar/dark`).
2. **Verify**:
   - `dir="rtl"` applied to `<html>`.
   - Navigation links, hero copy, and headings align to the right (`text-start`).
   - Arabic heading font (`Sahabah`) renders crisply without layout shifts.
   - Numeric quantities (e.g., `<bdi>1,250 د.إ</bdi>` or hours/minutes) retain correct bidirectional isolation.
   - Sticky header controls switch alignment logically without overlap.

### Scenario 4: Responsive Viewports & 320px Reflow (SC-005)

1. Open DevTools Device Mode:
   - Test at **320px width** (extreme small mobile).
   - Test at **390×844px** (standard mobile).
   - Test at **768×1024px** (tablet).
   - Test at **1440×900px** (desktop).
2. Zoom the page to **200%**.
3. **Verify**:
   - Zero horizontal page-level scrollbars.
   - Capability cards, feature grid, and contact form fields wrap cleanly.
   - Floating header stays within viewport bounds.

### Scenario 5: Contact Form Happy Path & Inline Errors (FR-013, SC-009, SC-010)

1. Scroll to `#contact`.
2. Leave required fields empty and click "Send message".
3. **Verify**: Inline field error indicators appear next to Name, Email, and Consent checkbox; focus shifts to the first invalid field.
4. Fill in valid name, valid email, select topic "Team inquiry", type a valid message, and check the consent box.
5. Submit form.
6. **Verify**: Button transitions to pending state ("Sending..."), then displays the accepted confirmation card. Input is cleared upon acceptance.
