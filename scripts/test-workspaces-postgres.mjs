import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import { pathToFileURL } from "node:url";
import pg from "pg";
import { applyMigrations, readMigrations } from "./migrate.mjs";
import { loadServerModule } from "./workspace-test-service.mjs";

export function runSelfCheck() {
  const sql = readFileSync(new URL("../migrations/002-workspace-platform.sql", import.meta.url), "utf8");
  for (const table of ["workspaces", "workspace_memberships", "workspace_grants", "command_receipts", "audit_events", "outbox_events"])
    assert.ok(sql.includes(`CREATE TABLE solodesk.${table}`));
  console.log("PASS: SQL source self-check only; no database or authorization acceptance.");
}

// A label/URL manifest cannot prove remote isolation. Remote acceptance needs T060.
export function validateTargetManifest() {
  throw new Error("BLOCKED: Remote target isolation is not independently verified; use --local for disposable PostgreSQL evidence only.");
}

export async function runLocalPostgresTests() {
  const bindir = execFileSync("pg_config", ["--bindir"], { encoding: "utf8" }).trim();
  const directory = mkdtempSync(join(tmpdir(), "solodesk-pg-"));
  const data = join(directory, "data");
  const migrationRole = "solodesk_test_migration";
  execFileSync(join(bindir, "initdb"), ["-D", data, "-U", migrationRole, "--auth-local=trust", "--auth-host=reject", "--no-locale"], { stdio: "pipe" });
  let started = false;
  let admin, runtime, sender;
  try {
    execFileSync(join(bindir, "pg_ctl"), ["-D", data, "-l", join(directory, "server.log"), "-o", `-F -k ${directory} -h ''`, "-w", "start"], { stdio: "pipe" });
    started = true;
    const config = { host: directory, database: "postgres", connectionTimeoutMillis: 5000, max: 5 };
    admin = new pg.Pool({ ...config, user: migrationRole });
    const before = await admin.query("SELECT version(), current_database(), current_user, to_regnamespace('neon_auth') as auth_schema, to_regnamespace('solodesk') as application_schema");
    assert.equal(before.rows[0].auth_schema, null);
    assert.equal(before.rows[0].application_schema, null);
    console.log(`LOCAL: ${before.rows[0].version}; independently initialized empty Unix-socket cluster, no TCP listener.`);
    // Synthetic provider schema exists only in this temporary test cluster; never a managed migration.
    await admin.query(`CREATE SCHEMA neon_auth;
      CREATE TABLE neon_auth."user" (id uuid PRIMARY KEY, name text NOT NULL, email text NOT NULL,
        "emailVerified" boolean NOT NULL DEFAULT true, banned boolean NOT NULL DEFAULT false, password_hash text);
      CREATE TABLE neon_auth.session (id uuid PRIMARY KEY, "userId" uuid NOT NULL REFERENCES neon_auth."user", "expiresAt" timestamptz NOT NULL, token text);
      CREATE ROLE solodesk_test_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
      CREATE ROLE solodesk_test_sender LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
      REVOKE CREATE ON SCHEMA public FROM PUBLIC;`);
    const migrationClient = await admin.connect();
    try { await applyMigrations(migrationClient, readMigrations(), console.log); }
    finally { migrationClient.release(); }
    await admin.query(`GRANT USAGE ON SCHEMA solodesk, neon_auth TO solodesk_test_runtime;
      GRANT SELECT, INSERT, UPDATE ON solodesk.workspaces, solodesk.workspace_memberships, solodesk.workspace_invitations, solodesk.rate_limit_buckets TO solodesk_test_runtime;
      GRANT SELECT, INSERT, DELETE ON solodesk.workspace_grants TO solodesk_test_runtime;
      GRANT SELECT, INSERT ON solodesk.command_receipts, solodesk.audit_events TO solodesk_test_runtime;
      GRANT SELECT, INSERT, UPDATE ON solodesk.outbox_events TO solodesk_test_runtime;
      GRANT SELECT (id,name,email,"emailVerified",banned) ON neon_auth."user" TO solodesk_test_runtime;
      GRANT SELECT (id,"userId","expiresAt") ON neon_auth.session TO solodesk_test_runtime;
      GRANT USAGE ON SCHEMA solodesk TO solodesk_test_sender;
      GRANT SELECT (id,workspace_id,event_type,target_id,generation,status,available_at,attempts,encrypted_delivery,key_id,lease_token,lease_until) ON solodesk.outbox_events TO solodesk_test_sender;
      GRANT UPDATE (status,lease_token,lease_until,attempts,sent_at,last_error_code,encrypted_delivery,available_at) ON solodesk.outbox_events TO solodesk_test_sender;`);
    runtime = new pg.Pool({ ...config, user: "solodesk_test_runtime" });
    sender = new pg.Pool({ ...config, user: "solodesk_test_sender" });
    const actors = new AsyncLocalStorage();
    const owner = randomUUID(), adminUser = randomUUID(), member = randomUUID(), outsider = randomUUID();
    const sessions = new Map();
    for (const id of [owner, adminUser, member, outsider]) {
      const sid = randomUUID(); sessions.set(id, sid);
      await admin.query(`INSERT INTO neon_auth."user" (id,name,email) VALUES ($1,$2,$3)`, [id, `Synthetic ${id}`, `${id}@example.test`]);
      await admin.query(`INSERT INTO neon_auth.session (id,"userId","expiresAt") VALUES ($1,$2,clock_timestamp()+interval '1 hour')`, [sid,id]);
    }
    const identity = loadServerModule("../lib/auth/server.ts", {
      "@neondatabase/auth/next/server": { createNeonAuth: () => ({
        getSession: async () => {
          const id = actors.getStore();
          if (!id) return { data: null, error: null };
          const { rows } = await runtime.query(`SELECT u.id,u.name,u.email,u."emailVerified",u.banned,s.id as session_id,s."expiresAt" FROM neon_auth."user" u JOIN neon_auth.session s ON s."userId"=u.id WHERE u.id=$1 AND s.id=$2`, [id, sessions.get(id)]);
          if (!rows.length) return { data: null, error: null };
          const row = rows[0];
          return { data: { user: row, session: { id: row.session_id, userId: row.id, expiresAt: row.expiresAt } }, error: null };
        },
      }) },
    });
    const capabilities = loadServerModule("../lib/auth/capabilities.ts", {}, { SOLODESK_WORKSPACES_ENABLED: "true" });
    const ws = loadServerModule("../lib/workspaces.ts", {
      "@/lib/db": { db: runtime }, "@/lib/auth/server": identity,
      "@/lib/auth/capabilities": capabilities, "@/lib/workspace-invitations": {},
    });
    const as = (id, fn) => actors.run(id, fn);
    const create = (slug) => ({ operationId: randomUUID(), name: slug, slug, timezone: "UTC", locale: "en", currency: "USD" });
    const alpha = await as(owner, () => ws.createWorkspace(create("alpha-team")));
    const beta = await as(outsider, () => ws.createWorkspace(create("beta-team")));
    for (const [user, role] of [[adminUser,"admin"],[member,"member"]]) {
      const membershipId = randomUUID();
      await admin.query(`INSERT INTO solodesk.workspace_memberships (id,workspace_id,user_id,role,status,created_by) VALUES ($1,$2,$3,$4,'active',$5)`, [membershipId, alpha.workspaceId, user, role, owner]);
      for (const action of ws.ROLE_GRANTS[role]) await admin.query(`INSERT INTO solodesk.workspace_grants (workspace_id,membership_id,action,scope_id) VALUES ($1,$2,$3,$1)`, [alpha.workspaceId,membershipId,action]);
    }
    assert.equal((await as(owner, () => ws.listWorkspaces())).items.length, 1);
    assert.equal((await as(outsider, () => ws.listWorkspaces())).items[0].id, beta.workspaceId);
    assert.equal((await as(member, () => ws.getWorkspaceContext(alpha.workspaceId))).membership.role, "member");
    await assert.rejects(as(outsider, () => ws.getWorkspaceContext(alpha.workspaceId)), e => e.code === "RESOURCE_UNAVAILABLE");
    await assert.rejects(as(member, () => ws.listWorkspaceMembers(alpha.workspaceId)), e => e.code === "FORBIDDEN");
    const members = await as(adminUser, () => ws.listWorkspaceMembers(alpha.workspaceId));
    assert.equal(members.length, 3);
    assert.ok(members.every(m => !Object.hasOwn(m,"password_hash") && !Object.hasOwn(m,"token")));
    const settings = { operationId: randomUUID(), workspaceId: alpha.workspaceId, expectedRevision: "1", name: "Updated Alpha", timezone: "UTC", locale: "ar", currency: "EGP" };
    const accepted = await as(adminUser, () => ws.updateWorkspaceSettings(settings));
    assert.equal(accepted.revision,"2");
    assert.equal((await as(adminUser, () => ws.updateWorkspaceSettings(settings))).replayed,true);
    await assert.rejects(as(adminUser, () => ws.updateWorkspaceSettings({ ...settings, name:"changed intent" })), e => e.code === "OPERATION_CONFLICT");
    await assert.rejects(as(adminUser, () => ws.updateWorkspaceSettings({ ...settings, operationId:randomUUID() })), e => e.code === "REVISION_CONFLICT");
    await assert.rejects(as(member, () => ws.updateWorkspaceSettings({ ...settings,operationId:randomUUID(),expectedRevision:"2" })), e => e.code === "FORBIDDEN");
    await assert.rejects(as(outsider, () => ws.getReceiptStatus(settings.operationId)), e => e.code === "RESOURCE_UNAVAILABLE");
    await admin.query(`DELETE FROM solodesk.workspace_grants WHERE workspace_id=$1 AND membership_id=$2 AND action='workspace.settings.update'`, [alpha.workspaceId,members.find(m=>m.userId===adminUser).id]);
    await assert.rejects(as(adminUser, () => ws.getReceiptStatus(settings.operationId)), e => e.code === "FORBIDDEN");
    await assert.rejects(as(adminUser, () => ws.updateWorkspaceSettings(settings)), e => e.code === "FORBIDDEN");
    console.log("PASS: two tenants, three roles, scoped lists/context/receipts, permitted updates, lost-reply replay, changed intent, stale revision and removed-grant denial.");

    // 100 separate-client duplicate trials; validate all persisted effects, not just replies.
    for (let trial=0;trial<100;trial++) {
      const input = create(`duplicate-${trial}`);
      const results = await Promise.all([as(owner,()=>ws.createWorkspace(input)),as(owner,()=>ws.createWorkspace(input))]);
      assert.equal(results[0].workspaceId,results[1].workspaceId);
      const counts = await admin.query(`SELECT
        (SELECT count(*)::int FROM solodesk.workspaces WHERE id=$1) as workspaces,
        (SELECT count(*)::int FROM solodesk.workspace_memberships WHERE workspace_id=$1) as members,
        (SELECT count(*)::int FROM solodesk.command_receipts WHERE actor_id=$2 AND operation_id=$3) as receipts,
        (SELECT count(*)::int FROM solodesk.audit_events WHERE actor_id=$2 AND operation_id=$3) as audits,
        (SELECT count(*)::int FROM solodesk.outbox_events WHERE actor_id=$2 AND operation_id=$3) as events`, [results[0].workspaceId,owner,input.operationId]);
      assert.deepEqual(counts.rows[0],{workspaces:1,members:1,receipts:1,audits:1,events:1});
    }
    console.log("PASS: 100 concurrent duplicate-create trials; one domain/membership/receipt/audit/outbox effect per operation.");
    // Fault after each domain/history write: the actual transaction must leave no partial state.
    for (const table of ["workspaces","workspace_memberships","workspace_grants","command_receipts","audit_events","outbox_events"]) {
      const input=create(`rollback-${table.replaceAll('_','-')}`);
      const faultPool={connect:async()=>{
        const client=await runtime.connect();
        return { release: broken=>client.release(broken), query:async(sql,params)=>{
          const result=await client.query(sql,params);
          if(sql.includes(`INSERT INTO solodesk.${table}`)) throw new Error("synthetic failure after write");
          return result;
        } };
      }};
      const faultService=loadServerModule("../lib/workspaces.ts", { "@/lib/db":{db:faultPool},"@/lib/auth/server":identity,"@/lib/auth/capabilities":capabilities,"@/lib/workspace-invitations":{} });
      await assert.rejects(as(owner,()=>faultService.createWorkspace(input)), /synthetic failure/);
      assert.equal((await admin.query("SELECT count(*)::int as count FROM solodesk.workspaces WHERE slug=$1",[input.slug])).rows[0].count,0);
      assert.equal((await admin.query("SELECT count(*)::int as count FROM solodesk.command_receipts WHERE operation_id=$1",[input.operationId])).rows[0].count,0);
    }
    // Same pool reused after all faults and for alternating tenants.
    for(let i=0;i<10;i++) {
      await assert.rejects(as(outsider,()=>ws.getWorkspaceContext(alpha.workspaceId)), e=>e.code==='RESOURCE_UNAVAILABLE');
      assert.equal((await as(member,()=>ws.getWorkspaceContext(alpha.workspaceId))).workspace.id,alpha.workspaceId);
    }
    assert.equal((await runtime.query("SHOW lock_timeout")).rows[0].lock_timeout,"0");
    console.log("PASS: failure after each of six write categories rolls back; pool reuse retains no tenant authority or timeout settings.");

    // Designated owner cannot leave, even when another active Owner exists.
    const secondOwner=randomUUID(), secondMembership=randomUUID(); sessions.set(secondOwner,randomUUID());
    await admin.query(`INSERT INTO neon_auth."user" (id,name,email) VALUES ($1,'Second Owner',$2)`,[secondOwner,`${secondOwner}@example.test`]);
    await admin.query(`INSERT INTO neon_auth.session (id,"userId","expiresAt") VALUES ($1,$2,clock_timestamp()+interval '1 hour')`,[sessions.get(secondOwner),secondOwner]);
    await admin.query(`INSERT INTO solodesk.workspace_memberships (id,workspace_id,user_id,role,status,created_by) VALUES ($1,$2,$3,'owner','active',$4)`,[secondMembership,alpha.workspaceId,secondOwner,owner]);
    for(const action of ws.ROLE_GRANTS.owner)await admin.query(`INSERT INTO solodesk.workspace_grants (workspace_id,membership_id,action,scope_id) VALUES ($1,$2,$3,$1)`,[alpha.workspaceId,secondMembership,action]);
    for(let trial=0;trial<100;trial++){
      const input={operationId:randomUUID(),workspaceId:alpha.workspaceId,expectedMembershipRevision:"1"};
      const results=await Promise.allSettled([as(owner,()=>ws.leaveWorkspace(input)),as(owner,()=>ws.leaveWorkspace({...input,operationId:randomUUID()}))]);
      assert.ok(results.every(r=>r.status==='rejected'&&r.reason.code==='LAST_OWNER'));
      const owners=await admin.query(`SELECT count(*)::int as count FROM solodesk.workspace_memberships WHERE workspace_id=$1 AND status='active' AND role='owner'`,[alpha.workspaceId]);
      assert.equal(owners.rows[0].count,2);
    }
    await assert.rejects(admin.query(`UPDATE solodesk.workspace_memberships SET status='revoked',revoked_at=clock_timestamp() WHERE workspace_id=$1 AND role='owner'`,[alpha.workspaceId]), e=>e.code==='23514');
    console.log("PASS: 100 concurrent designated-owner leave trials and direct constraint denial preserve designated/final ownership. Unsupported ownership transitions remain blocked.");

    const memberId=members.find(m=>m.userId===member).id;
    await assert.rejects(as(adminUser,()=>ws.changeWorkspaceMemberRole({operationId:randomUUID(),workspaceId:alpha.workspaceId,membershipId:memberId,expectedMembershipRevision:"1",role:"owner"})),e=>e.code==='FORBIDDEN');
    const removal=await as(owner,()=>ws.removeWorkspaceMember({operationId:randomUUID(),workspaceId:alpha.workspaceId,membershipId:memberId,expectedMembershipRevision:"1"}));
    assert.equal(removal.status,"accepted");
    await assert.rejects(as(member,()=>ws.getWorkspaceContext(alpha.workspaceId)),e=>e.code==='RESOURCE_UNAVAILABLE');
    for(const state of ["unverified","banned","expired","revoked"]){
      if(state==='unverified')await admin.query(`UPDATE neon_auth."user" SET "emailVerified"=false WHERE id=$1`,[outsider]);
      if(state==='banned')await admin.query(`UPDATE neon_auth."user" SET "emailVerified"=true,banned=true WHERE id=$1`,[outsider]);
      if(state==='expired') {await admin.query(`UPDATE neon_auth."user" SET banned=false WHERE id=$1`,[outsider]);await admin.query(`UPDATE neon_auth.session SET "expiresAt"=clock_timestamp()-interval '1 second' WHERE "userId"=$1`,[outsider]);}
      if(state==='revoked')await admin.query(`DELETE FROM neon_auth.session WHERE "userId"=$1`,[outsider]);
      await assert.rejects(as(outsider,()=>ws.listWorkspaces()),e=>e.code==='AUTH_REQUIRED');
    }
    for(const query of ['SELECT password_hash FROM neon_auth."user"','SELECT token FROM neon_auth.session','UPDATE solodesk.command_receipts SET result_code=\'forged\'','DELETE FROM solodesk.audit_events','CREATE TABLE solodesk.forbidden (id int)'])await assert.rejects(runtime.query(query),e=>e.code==='42501');
    for(const query of ['UPDATE solodesk.workspace_memberships SET role=\'owner\'','SELECT * FROM neon_auth."user"','INSERT INTO solodesk.command_receipts DEFAULT VALUES'])await assert.rejects(sender.query(query),e=>e.code==='42501');
    const role=await runtime.query("SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user");
    assert.deepEqual(role.rows[0],{rolsuper:false,rolbypassrls:false});
    console.log("PASS: revoked membership and unverified/banned/expired/revoked synthetic identity deny; restricted runtime/sender cannot mutate audit/receipts/auth credentials or DDL.");
    console.log("LIMIT: real PostgreSQL with mocked managed provider transport; no hosted Neon/auth, browser, sender, performance fixture, human or restore acceptance.");
  } finally {
    await Promise.allSettled([runtime?.end(),sender?.end(),admin?.end()]);
    if(started)execFileSync(join(bindir,"pg_ctl"),["-D",data,"-m","fast","-w","stop"],{stdio:"pipe"});
  }
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  try{
    if(process.argv.includes("--self-check"))runSelfCheck();
    else if(process.argv.length===3&&process.argv[2]==="--local")await runLocalPostgresTests();
    else {validateTargetManifest();}
  }catch(error){
    const blocked=error.message?.startsWith("BLOCKED:");
    console.error(blocked?error.message:`FAIL: local PostgreSQL checks${error.code?` (${error.code})`:""}; ${error.message}`);
    process.exitCode=blocked?2:1;
  }
}
