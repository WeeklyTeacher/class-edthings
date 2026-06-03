<!-- docs/classroom-data-and-security-plan.md -->

# Classroom Data and Security Plan

## Baseline calendar strategy

- The public `/calendar/` page uses only the static LAUSD 2026–2027 school-year and CKLA seed data from TypeScript.
- The seed calendar remains the authoritative source for instructional dates, holidays, recesses, school weeks, and CKLA pacing on public pages.
- No teacher-authored D1 content is shown publicly on `/calendar/`.
- D1 is reserved for future protected family and teacher experiences:
  - lesson plans
  - calendar entries and reminders
  - worksheet metadata

## Cloudflare bindings

- D1 binding name: `CLASS_DB`
- D1 database name: `class-edthings-db`
- R2 binding name: `WORKSHEETS_BUCKET`
- R2 bucket name: `class-edthings-worksheets`
- The R2 bucket must remain private.

## Tables created in D1

- `lesson_plans`
- `calendar_entries`
- `worksheets`
- `document_access_log`

## Local migration workflow

- Create the database resource:
  - `npx wrangler d1 create class-edthings-db`
- Apply migrations locally only:
  - `npx wrangler d1 migrations apply class-edthings-db --local`
- Inspect tables locally:
  - `npx wrangler d1 execute class-edthings-db --local --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"`

## Future production migration

- Not performed in this phase.
- When the project is ready, production migrations should be applied intentionally after authentication and access control are in place.

## Future access rules

- Public pages never read D1 classroom data.
- Future protected family portal pages may read `Published` records from `lesson_plans`, `calendar_entries`, and `worksheets` after Cloudflare Access is configured.
- Future protected family portal pages may never read `NotPublished` records.
- Future teacher editing routes may read and edit both `Published` and `NotPublished` records, but only after Cloudflare Access identity is validated for the teacher.
- Future teacher access is intended for `jeremysayers@gmail.com`.
- Future authorization should use Cloudflare Access-authenticated identity before any production admin UI or protected worksheet serving is enabled.

## Future protected worksheet serving

- Worksheet files will remain private in R2.
- `WORKSHEETS_BUCKET` is only a storage binding for later protected file handling.
- No public download URLs should be created in this phase.
- A future authenticated Worker route may serve a file only after:
  1. Validating the Cloudflare Access identity.
  2. Verifying the user is allowed to view that worksheet record.
  3. Confirming the worksheet is `Published`, unless the requester is the superuser.
  4. Recording the authenticated document access in `document_access_log`.
