-- Apply on an isolated branch with the direct migration connection before enabling auth email webhooks.
CREATE TABLE public.solodesk_email_deliveries (
  event_id uuid PRIMARY KEY,
  payload_hash text NOT NULL CHECK (payload_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
REVOKE ALL ON public.solodesk_email_deliveries FROM PUBLIC;
-- Grant SELECT, INSERT, UPDATE only to the application's restricted server runtime role.
