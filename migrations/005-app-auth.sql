-- App-operated Better Auth 1.7.15; additive schema, no managed auth writes.
create schema if not exists "solodesk_auth";

create table "solodesk_auth"."user" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null, "twoFactorEnabled" boolean, "banned" boolean not null, "recoveryRequired" boolean not null, "recoveryAcknowledged" boolean not null, "recoveryRemaining" integer not null, "recoveryGeneration" text, "setupSessionId" text, "setupExpiresAt" timestamptz);

create table "solodesk_auth"."session" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" uuid not null references "solodesk_auth"."user" ("id") on delete cascade, "mfaVerified" boolean not null, "recoveryOnly" boolean not null);

create table "solodesk_auth"."account" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "accountId" text not null, "providerId" text not null, "userId" uuid not null references "solodesk_auth"."user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);

create table "solodesk_auth"."verification" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create table "solodesk_auth"."twoFactor" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "secret" text not null, "backupCodes" text not null, "userId" uuid not null references "solodesk_auth"."user" ("id") on delete cascade, "verified" boolean, "failedVerificationCount" integer, "lockedUntil" timestamptz);

create table "solodesk_auth"."passkey" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "name" text, "publicKey" text not null, "userId" uuid not null references "solodesk_auth"."user" ("id") on delete cascade, "credentialID" text not null, "counter" integer not null, "deviceType" text not null, "backedUp" boolean not null, "transports" text, "createdAt" timestamptz, "aaguid" text);

create table "solodesk_auth"."rateLimit" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "key" text not null unique, "count" integer not null, "lastRequest" bigint not null);

create index "session_userId_idx" on "solodesk_auth"."session" ("userId");

create index "account_userId_idx" on "solodesk_auth"."account" ("userId");

create index "verification_identifier_idx" on "solodesk_auth"."verification" ("identifier");

create index "twoFactor_secret_idx" on "solodesk_auth"."twoFactor" ("secret");

create index "twoFactor_userId_idx" on "solodesk_auth"."twoFactor" ("userId");

create index "passkey_userId_idx" on "solodesk_auth"."passkey" ("userId");

create index "passkey_credentialID_idx" on "solodesk_auth"."passkey" ("credentialID");

REVOKE ALL ON SCHEMA solodesk_auth FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA solodesk_auth FROM PUBLIC;

-- Backstop credential uniqueness and atomic one-use verification consumption.
CREATE UNIQUE INDEX solodesk_auth_account_identity ON solodesk_auth.account ("providerId", "accountId");
CREATE UNIQUE INDEX solodesk_auth_factor_owner ON solodesk_auth."twoFactor" ("userId");
CREATE UNIQUE INDEX solodesk_auth_passkey_credential ON solodesk_auth.passkey ("credentialID");
CREATE UNIQUE INDEX solodesk_auth_verification_identifier ON solodesk_auth.verification (identifier);
