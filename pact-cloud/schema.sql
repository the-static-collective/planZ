-- THE PACT v0.2 schema. Create only; do not seed or commit live bearer secrets.
CREATE TABLE IF NOT EXISTS public.pact_v1_rooms (
  id uuid PRIMARY KEY,
  title text NOT NULL DEFAULT 'THE PACT',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.pact_v1_seats (
  room_id uuid NOT NULL REFERENCES public.pact_v1_rooms(id) ON DELETE CASCADE,
  seat text NOT NULL CHECK (seat IN ('you','paula')),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 30),
  key_hash text NOT NULL UNIQUE CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(room_id,seat)
);
CREATE TABLE IF NOT EXISTS public.pact_v1_events (
  seq bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id uuid NOT NULL UNIQUE,
  room_id uuid NOT NULL REFERENCES public.pact_v1_rooms(id) ON DELETE CASCADE,
  actor text NOT NULL CHECK (actor IN ('you','paula')),
  type text NOT NULL CHECK (type IN ('quest.create','quest.edit','quest.remove','quest.submit','quest.verify','quest.reopen','quest.refuse','impact.report','impact.review','stake.propose','stake.accept','grace.use','cheer.add','help.offer')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(data) = 'object'),
  week text NOT NULL CHECK (week ~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$'),
  at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (room_id,actor) REFERENCES public.pact_v1_seats(room_id,seat)
);
CREATE INDEX IF NOT EXISTS pact_v1_events_room_seq_idx ON public.pact_v1_events(room_id, seq);
CREATE INDEX IF NOT EXISTS pact_v1_events_room_actor_at_idx ON public.pact_v1_events(room_id, actor, at);
ALTER TABLE public.pact_v1_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pact_v1_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pact_v1_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pact_v1_rooms, public.pact_v1_seats, public.pact_v1_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.pact_v1_events_seq_seq FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pact_v1_rooms, public.pact_v1_seats, public.pact_v1_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.pact_v1_events_seq_seq TO service_role;
