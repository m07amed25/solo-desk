# Database migrations

Use a reviewed **direct migration-role connection** in `DATABASE_URL_UNPOOLED`.
The runner loads `.env.local`, then `.env`; existing environment variables take
precedence. It never falls back to the runtime `DATABASE_URL` and rejects Neon
`-pooler` endpoints. Review the target and SQL before running: these commands
change the selected database.

```bash
# Apply every pending migration in numeric filename order.
npm run db:migrate

# Apply a specific migration by exact numeric prefix or filename.
npm run db:migrate -- 001
npm run db:migrate -- 002-workspace-platform.sql

# Select several migrations; execution still follows numeric order.
npm run db:migrate -- 001 002

npm run db:migrate -- --help
```

Only numbered files such as `001-email-deliveries.sql` in this directory are
executable. Selection does not automatically apply dependencies; apply their
prerequisites first. Already recorded files are skipped. There is no force-rerun
or destructive rollback command.

The runner serializes concurrent runs with a database advisory lock and records
filename, SHA-256 checksum and the database's application instant in
`public.solodesk_schema_migrations`. Each pending file and its history insert use
one transaction on one connection. A failed file rolls back and stops the run;
previously committed files remain applied. An unknown connection/commit outcome
can be reconciled by rerunning unchanged files. Changed or missing applied files
stop execution: restore the original file and add a new numbered migration.

Migration files must be reviewed, transaction-compatible PostgreSQL SQL. Do not
include top-level `BEGIN`, `COMMIT`, `ROLLBACK` or psql commands. Operations such as
`CREATE INDEX CONCURRENTLY` require a separately reviewed procedure. The runner
owns transaction boundaries; it does not parse arbitrary SQL or provision roles.
The migration role needs permission to create/manage the history table in
`public` as well as the objects declared in each migration. Keep it separate from
runtime/sender roles; do not grant managed auth schema write access for these
application migrations.

If a migration was previously applied manually, reconcile its actual schema and
history with the migration owner first. This runner does not infer that an
existing table means the full migration succeeded, auto-baseline it, or delete it
to make the migration pass.

Controls covered by the runner are SEC-041/043/044/056: direct migration-role
access, transactional history, credential-safe diagnostics and immutable applied
files. Review each SQL migration's compatibility/recovery separately; having a
runner does not approve its schema or prove hosted execution. The transaction
and connection rules follow [node-postgres](https://node-postgres.com/features/transactions)
and [Neon pooling guidance](https://neon.com/docs/connect/connection-pooling).

Run the local runner tests with:

```bash
node --test scripts/test-migrations.test.mjs
```
