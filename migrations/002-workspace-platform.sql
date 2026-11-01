-- 002-workspace-platform.sql
-- Application-only schema for SoloDesk workspace platform and authorization.
-- Leaves neon_auth and public.solodesk_email_deliveries completely intact.

CREATE SCHEMA IF NOT EXISTS solodesk;

-- 1. solodesk.workspaces
CREATE TABLE solodesk.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) >= 1 AND char_length(name) <= 100),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' AND char_length(slug) BETWEEN 3 AND 63),
  owner_id uuid NOT NULL,
  timezone text NOT NULL,
  locale text NOT NULL CHECK (locale IN ('en', 'ar')),
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  legal_profile_status text NOT NULL DEFAULT 'unconfigured' CHECK (legal_profile_status = 'unconfigured'),
  revision bigint NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

-- 2. solodesk.workspace_memberships
CREATE TABLE solodesk.workspace_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES solodesk.workspaces(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  revision bigint NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  revoked_at timestamptz NULL,
  CONSTRAINT check_revoked_status CHECK (
    (status = 'active' AND revoked_at IS NULL) OR
    (status = 'revoked' AND revoked_at IS NOT NULL)
  ),
  CONSTRAINT uq_membership_user UNIQUE (workspace_id, user_id),
  CONSTRAINT uq_membership_scoped UNIQUE (workspace_id, id)
);

CREATE INDEX idx_memberships_user_status ON solodesk.workspace_memberships (user_id, status, workspace_id);
CREATE INDEX idx_memberships_workspace_status ON solodesk.workspace_memberships (workspace_id, status, role, id);

-- Trigger function to enforce active-Owner invariants deferred at transaction commit
CREATE OR REPLACE FUNCTION solodesk.fn_check_workspace_active_owner()
RETURNS trigger AS $$
DECLARE
  v_workspace_id uuid;
  v_owner_count int;
  v_designated_valid int;
BEGIN
  IF TG_TABLE_NAME = 'workspaces' THEN
    IF TG_OP = 'DELETE' THEN
      v_workspace_id := OLD.id;
    ELSE
      v_workspace_id := NEW.id;
    END IF;
  ELSE
    IF TG_OP = 'DELETE' THEN
      v_workspace_id := OLD.workspace_id;
    ELSE
      v_workspace_id := NEW.workspace_id;
    END IF;
  END IF;

  -- If workspace itself is deleted in this transaction, no invariant to enforce
  IF NOT EXISTS (SELECT 1 FROM solodesk.workspaces WHERE id = v_workspace_id) THEN
    RETURN NULL;
  END IF;

  -- Ensure we obtain a row lock on the workspace
  PERFORM 1 FROM solodesk.workspaces WHERE id = v_workspace_id FOR UPDATE;

  -- Check count of active owners
  SELECT count(*) INTO v_owner_count
  FROM solodesk.workspace_memberships
  WHERE workspace_id = v_workspace_id AND role = 'owner' AND status = 'active';

  IF v_owner_count < 1 THEN
    RAISE EXCEPTION 'Workspace % must have at least one active owner', v_workspace_id
      USING ERRCODE = 'check_violation';
  END IF;

  -- Check designated owner matches an active owner membership
  SELECT count(*) INTO v_designated_valid
  FROM solodesk.workspaces w
  JOIN solodesk.workspace_memberships m
    ON m.workspace_id = w.id AND m.id = w.owner_id
  WHERE w.id = v_workspace_id AND m.role = 'owner' AND m.status = 'active';

  IF v_designated_valid < 1 THEN
    RAISE EXCEPTION 'Workspace % owner_id must match an active owner membership', v_workspace_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_check_workspace_active_owner_memberships
AFTER INSERT OR UPDATE OR DELETE ON solodesk.workspace_memberships
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION solodesk.fn_check_workspace_active_owner();

CREATE CONSTRAINT TRIGGER trg_check_workspace_active_owner_workspaces
AFTER INSERT OR UPDATE ON solodesk.workspaces
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION solodesk.fn_check_workspace_active_owner();

-- 3. solodesk.workspace_grants
CREATE TABLE solodesk.workspace_grants (
  workspace_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  action text NOT NULL,
  scope_type text NOT NULL DEFAULT 'workspace' CHECK (scope_type = 'workspace'),
  scope_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (workspace_id, membership_id, action, scope_type, scope_id),
  FOREIGN KEY (workspace_id, membership_id) REFERENCES solodesk.workspace_memberships (workspace_id, id) ON DELETE RESTRICT,
  CONSTRAINT check_scope_match CHECK (scope_id = workspace_id)
);

-- 4. solodesk.workspace_invitations
CREATE TABLE solodesk.workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES solodesk.workspaces(id) ON DELETE RESTRICT,
  recipient_email text NOT NULL CHECK (char_length(recipient_email) <= 254),
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  scope_type text NOT NULL DEFAULT 'workspace' CHECK (scope_type = 'workspace'),
  scope_id uuid NOT NULL,
  inviter_membership_id uuid NOT NULL,
  token_digest text NOT NULL UNIQUE CHECK (token_digest ~ '^[a-f0-9]{64}$'),
  generation bigint NOT NULL DEFAULT 1 CHECK (generation >= 1),
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'revoked')),
  revision bigint NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  token_created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz NULL,
  revoked_at timestamptz NULL,
  accepted_by uuid NULL,
  accepted_membership_id uuid NULL,
  FOREIGN KEY (workspace_id, inviter_membership_id) REFERENCES solodesk.workspace_memberships (workspace_id, id) ON DELETE RESTRICT,
  CONSTRAINT check_invitation_expiry CHECK (expires_at = token_created_at + INTERVAL '72 hours'),
  CONSTRAINT check_token_created CHECK (token_created_at >= created_at),
  CONSTRAINT check_invitation_scope CHECK (scope_id = workspace_id),
  CONSTRAINT check_invitation_status CHECK (
    (status = 'pending' AND accepted_at IS NULL AND revoked_at IS NULL AND accepted_by IS NULL AND accepted_membership_id IS NULL) OR
    (status = 'accepted' AND accepted_at IS NOT NULL AND revoked_at IS NULL AND accepted_by IS NOT NULL AND accepted_membership_id IS NOT NULL) OR
    (status = 'revoked' AND revoked_at IS NOT NULL AND accepted_at IS NULL)
  )
);

CREATE UNIQUE INDEX uq_invitation_pending_recipient ON solodesk.workspace_invitations (workspace_id, recipient_email) WHERE status = 'pending';
CREATE INDEX idx_invitations_workspace_status ON solodesk.workspace_invitations (workspace_id, status, id);

-- 5. solodesk.command_receipts
CREATE TABLE solodesk.command_receipts (
  actor_id uuid NOT NULL,
  operation_id uuid NOT NULL,
  workspace_id uuid NOT NULL REFERENCES solodesk.workspaces(id) ON DELETE RESTRICT,
  kind text NOT NULL,
  command_version integer NOT NULL CHECK (command_version = 1),
  intent_digest text NOT NULL CHECK (intent_digest ~ '^[a-f0-9]{64}$'),
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  result_code text NOT NULL,
  result_revision bigint NOT NULL CHECK (result_revision >= 1),
  result jsonb NOT NULL,
  correlation_id uuid NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (actor_id, operation_id),
  CONSTRAINT uq_receipt_scoped UNIQUE (workspace_id, actor_id, operation_id)
);

-- 6. solodesk.audit_events
CREATE TABLE solodesk.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES solodesk.workspaces(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL,
  operation_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  revision bigint NOT NULL CHECK (revision >= 1),
  action text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  correlation_id uuid NOT NULL,
  reason text NULL CHECK (reason IS NULL OR char_length(reason) <= 500),
  change_summary jsonb NOT NULL CHECK (pg_column_size(change_summary) <= 4096),
  FOREIGN KEY (workspace_id, actor_id, operation_id) REFERENCES solodesk.command_receipts (workspace_id, actor_id, operation_id) ON DELETE RESTRICT
);

CREATE INDEX idx_audit_workspace_occurred ON solodesk.audit_events (workspace_id, occurred_at, id);

-- 7. solodesk.outbox_events
CREATE TABLE solodesk.outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES solodesk.workspaces(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL,
  operation_id uuid NOT NULL,
  event_type text NOT NULL,
  target_id uuid NOT NULL,
  target_revision bigint NOT NULL CHECK (target_revision >= 1),
  generation bigint NOT NULL DEFAULT 0 CHECK (generation >= 0),
  payload jsonb NOT NULL CHECK (pg_column_size(payload) <= 4096),
  encrypted_delivery bytea NULL,
  key_id text NULL,
  status text NOT NULL CHECK (status IN ('pending', 'leased', 'sent', 'cancelled', 'unknown', 'dead')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  lease_token uuid NULL,
  lease_until timestamptz NULL,
  sent_at timestamptz NULL,
  last_error_code text NULL,
  FOREIGN KEY (workspace_id, actor_id, operation_id) REFERENCES solodesk.command_receipts (workspace_id, actor_id, operation_id) ON DELETE RESTRICT,
  CONSTRAINT uq_outbox_event UNIQUE (workspace_id, actor_id, operation_id, event_type, target_id, generation)
);

CREATE INDEX idx_outbox_status_available ON solodesk.outbox_events (status, available_at, id);
CREATE INDEX idx_outbox_workspace_target ON solodesk.outbox_events (workspace_id, target_id, generation);

-- 8. solodesk.rate_limit_buckets
CREATE TABLE solodesk.rate_limit_buckets (
  key_hash text NOT NULL CHECK (key_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 1 CHECK (count >= 0),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (key_hash, window_start)
);
