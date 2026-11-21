# THE PACT — two-player cloud room (v0.2)

This directory contains the deployed source of THE PACT cloud extension, a cooperative/competitive two-player task planner.

## Live deployment

- Function: `pact-room` on the existing Supabase `pantry-gate` project, ref `kbhqacsdvjsstzyplqij`.
- Application URL (without private credentials): `https://kbhqacsdvjsstzyplqij.supabase.co/functions/v1/pact-room`.
- The Edge Function serves the entire HTML/CSS/JavaScript UI on GET and processes authenticated JSON operations on POST.
- Requires `verify_jwt=false` only because **the function uses its own secret-link authentication**.
- Secrets are read from server environment (`SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEYS`), never put in browser JavaScript.
- Database: `public.pact_v1_rooms`, `public.pact_v1_seats`, `public.pact_v1_events`. See `schema.sql`.

## Access model

Exactly two seats (`you` and `paula`) have independent, cryptographically random 256-bit bearer keys. The server hashes the supplied token using SHA-256 and matches only the hash stored in `pact_v1_seats`. Private links carry the token in the **URL fragment**, which is not sent in the HTTP GET request; JavaScript submits it in the POST body over HTTPS. Never put real bearer tokens or seed hashes in this public repository.

The client cannot impersonate the other player by switching roles. Every server-recorded event derives its actor from the authenticated seat. Server validation rejects self-witnessed quests, duplicate grace use, and accepting your own stake proposal. Staking is a **voluntary text agreement only** — no money movement, cannabis transaction, escrow, or enforceable debts.

A bearer link grants the seat until its hash is rotated. No account recovery or email login exists yet. Keep links private and save them securely.

## Testing and limitations (2026-11-21)

- Live HTTPS GET returned the THE PACT mobile page.
- A disposable two-seat room passed POST state retrieval and quest.create tests; disposable data deleted afterward.
- Database RLS is enabled and direct access is revoked from `anon` and `authenticated`; only server service role can access data.
- A full phone UI and self-witness/partner-witness end-to-end test was **not** independently completed. Do not treat unverified completion reports as proof of external reality.
- Automatic refresh occurs every 15 seconds only while the page is visible. No push notifications, offline write queue, photo uploads, payments, or real-time sockets.
- The v0.2 server caps the initial room at 800 events. Archive/pagination before expanding widely.
- The existing v0.1 HTML prototype saved progress locally; importing prior data into v0.2 is not implemented. Do not assume migration occurred.

## Re-deploy

Use Supabase's Edge Function deployment with `edge.ts` as `index.ts`, project `kbhqacsdvjsstzyplqij`, slug `pact-room`, and `verify_jwt=false`. Ensure server-only project secrets remain enabled.

The function source embeds the app HTML for portable recovery.
