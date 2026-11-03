-- 003-account-completion.sql
-- Application-only schema for SoloDesk Phase 1 account completion and security events.
-- Leaves neon_auth, public.solodesk_email_deliveries, and migrations 001/002 intact.

CREATE SCHEMA IF NOT EXISTS solodesk;

-- 1. solodesk.account_preferences
-- Account-owned revisioned preferences (language, recognized IANA timezone, optional mail).
-- Does not mirror or store managed user names or workspace memberships.
CREATE TABLE solodesk.account_preferences (
  user_id uuid PRIMARY KEY,
  locale text NOT NULL CHECK (locale IN ('en', 'ar')),
  timezone text NOT NULL CHECK (char_length(trim(timezone)) >= 1 AND char_length(timezone) <= 100),
  optional_account_email boolean NOT NULL DEFAULT false,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

-- 2. solodesk.account_security_events
-- Attributable, append-only operational security events with strict redaction.
-- Oplog fields only; never accepts arbitrary provider JSON, credentials, or client secrets.
CREATE TABLE solodesk.account_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  event_type text NOT NULL CHECK (char_length(trim(event_type)) >= 1 AND char_length(event_type) <= 64),
  outcome text NOT NULL CHECK (outcome IN ('started', 'confirmed', 'denied', 'unknown')),
  actor_id uuid NULL,
  correlation_id text NULL CHECK (correlation_id IS NULL OR (char_length(trim(correlation_id)) >= 1 AND char_length(correlation_id) <= 128)),
  action text NULL CHECK (action IS NULL OR (char_length(trim(action)) >= 1 AND char_length(action) <= 64)),
  target_reference text NULL CHECK (target_reference IS NULL OR (char_length(trim(target_reference)) >= 1 AND char_length(target_reference) <= 128)),
  policy_version text NOT NULL DEFAULT '1.0' CHECK (char_length(trim(policy_version)) >= 1 AND char_length(policy_version) <= 32)
);

CREATE INDEX idx_account_security_events_occurred ON solodesk.account_security_events (occurred_at, id);
CREATE INDEX idx_account_security_events_actor ON solodesk.account_security_events (actor_id, occurred_at, id) WHERE actor_id IS NOT NULL;

-- 3. Expiration cleanup index on shared rate limit counter store
CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_expires ON solodesk.rate_limit_buckets (expires_at);

-- 4. Revoke all privileges from PUBLIC on new application tables
REVOKE ALL ON solodesk.account_preferences FROM PUBLIC;
REVOKE ALL ON solodesk.account_security_events FROM PUBLIC;

-- Narrow server runtime grants to be applied under restricted runtime role:
-- GRANT SELECT, INSERT, UPDATE ON solodesk.account_preferences TO solodesk_app;
-- GRANT SELECT, INSERT ON solodesk.account_security_events TO solodesk_app;
-- GRANT SELECT, INSERT, UPDATE ON solodesk.rate_limit_buckets TO solodesk_app;
