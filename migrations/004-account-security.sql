-- 004-account-security.sql
-- Application-only schema for action-bound confirmation and session revocation.
-- Enforces immutable target snapshots, strictly bounded 5-minute proof window,
-- atomic operation reservation, and closed-shape target outcomes.
-- Leaves neon_auth, solodesk_email_deliveries, and migrations 001/002/003 intact.

CREATE SCHEMA IF NOT EXISTS solodesk;

-- 1. solodesk.reauth_intents
-- Server-owned confirmation proof bound to original caller identity and session.
-- Never inferred from client-supplied actor IDs. No bearer authority by itself.
CREATE TABLE solodesk.reauth_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  original_session_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('revoke_session', 'revoke_other_sessions')),
  target_snapshot jsonb NOT NULL CHECK (jsonb_typeof(target_snapshot) = 'array'),
  target_digest text NOT NULL CHECK (target_digest ~ '^[a-f0-9]{64}$'),
  method text NOT NULL CHECK (method IN ('password', 'google', 'github')),
  challenge_state_digest text NULL CHECK (challenge_state_digest IS NULL OR char_length(challenge_state_digest) <= 128),
  challenge_expires_at timestamptz NULL,
  verified_at timestamptz NULL,
  expires_at timestamptz NULL,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'verified', 'reserved', 'consumed', 'cancelled', 'expired', 'unavailable')),
  reserved_operation_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT check_intent_expiry CHECK (
    (verified_at IS NULL AND expires_at IS NULL) OR
    (verified_at IS NOT NULL AND expires_at IS NOT NULL AND expires_at = verified_at + INTERVAL '5 minutes')
  )
);

CREATE INDEX idx_reauth_intents_lookup ON solodesk.reauth_intents (user_id, original_session_id, state);
CREATE INDEX idx_reauth_intents_expires ON solodesk.reauth_intents (expires_at) WHERE expires_at IS NOT NULL;

-- 2. solodesk.revocation_operations
-- Command state and per-target execution receipts.
-- Bound to original identity and owning proof. No provider tokens or arbitrary payloads.
CREATE TABLE solodesk.revocation_operations (
  operation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  original_session_id uuid NOT NULL,
  intent_id uuid NOT NULL REFERENCES solodesk.reauth_intents(id) ON DELETE RESTRICT,
  payload_digest text NOT NULL CHECK (payload_digest ~ '^[a-f0-9]{64}$'),
  state text NOT NULL DEFAULT 'prepared' CHECK (state IN ('prepared', 'executing', 'accepted', 'rejected', 'partial', 'unknown')),
  target_results jsonb NOT NULL CHECK (jsonb_typeof(target_results) = 'array' AND pg_column_size(target_results) <= 8192),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  completed_at timestamptz NULL,
  PRIMARY KEY (user_id, original_session_id, operation_id),
  CONSTRAINT check_operation_completed CHECK (
    (state IN ('prepared', 'executing') AND completed_at IS NULL) OR
    (state IN ('accepted', 'rejected', 'partial', 'unknown') AND completed_at IS NOT NULL)
  )
);

CREATE INDEX idx_revocation_operations_intent ON solodesk.revocation_operations (intent_id);

-- 3. Revoke all privileges from PUBLIC on new application security tables
REVOKE ALL ON solodesk.reauth_intents FROM PUBLIC;
REVOKE ALL ON solodesk.revocation_operations FROM PUBLIC;

-- Narrow server runtime grants to be applied under restricted runtime role:
-- GRANT SELECT, INSERT, UPDATE ON solodesk.reauth_intents TO solodesk_app;
-- GRANT SELECT, INSERT, UPDATE ON solodesk.revocation_operations TO solodesk_app;
