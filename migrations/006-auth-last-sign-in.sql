-- Serialize removal across credentials, social accounts and passkeys.
CREATE FUNCTION solodesk_auth.keep_sign_in_route() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, solodesk_auth AS $$
DECLARE
  account_excluded uuid;
  passkey_excluded uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW."userId" IS DISTINCT FROM OLD."userId" THEN
    RAISE EXCEPTION 'Authentication ownership is immutable' USING ERRCODE = '23514';
  END IF;
  PERFORM 1 FROM solodesk_auth."user" WHERE id = OLD."userId" FOR UPDATE;
  IF NOT FOUND THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  IF TG_TABLE_NAME = 'account' THEN
    IF TG_OP = 'UPDATE' AND (NEW."providerId", NEW."accountId") IS DISTINCT FROM (OLD."providerId", OLD."accountId") THEN
      RAISE EXCEPTION 'Authentication identity is immutable' USING ERRCODE = '23514';
    END IF;
    IF TG_OP = 'UPDATE' AND (NEW."providerId" IN ('google', 'github') OR (NEW."providerId" = 'credential' AND NEW.password IS NOT NULL)) THEN RETURN NEW; END IF;
    account_excluded := OLD.id;
  ELSE
    IF TG_OP = 'UPDATE' THEN RETURN NEW; END IF;
    passkey_excluded := OLD.id;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM solodesk_auth.account a WHERE a."userId" = OLD."userId"
      AND a.id IS DISTINCT FROM account_excluded
      AND (a."providerId" IN ('google', 'github') OR (a."providerId" = 'credential' AND a.password IS NOT NULL))
    UNION ALL
    SELECT 1 FROM solodesk_auth.passkey p WHERE p."userId" = OLD."userId" AND p.id IS DISTINCT FROM passkey_excluded
  ) THEN
    RAISE EXCEPTION 'Keep at least one sign-in method' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;
REVOKE ALL ON FUNCTION solodesk_auth.keep_sign_in_route() FROM PUBLIC;
CREATE TRIGGER keep_account_sign_in BEFORE DELETE OR UPDATE ON solodesk_auth.account
  FOR EACH ROW EXECUTE FUNCTION solodesk_auth.keep_sign_in_route();
CREATE TRIGGER keep_passkey_sign_in BEFORE DELETE OR UPDATE ON solodesk_auth.passkey
  FOR EACH ROW EXECUTE FUNCTION solodesk_auth.keep_sign_in_route();
