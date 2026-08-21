CREATE TABLE public.failed_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  task_type TEXT NOT NULL,
  error_code TEXT NOT NULL,
  payload_reference TEXT NOT NULL,
  attempts SMALLINT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT failed_tasks_status_check CHECK (status IN ('pending','resolved','abandoned')),
  CONSTRAINT failed_tasks_task_type_check CHECK (task_type IN ('kchat_webhook','smtp_email'))
);

CREATE UNIQUE INDEX failed_tasks_unique_pending
  ON public.failed_tasks (task_type, payload_reference)
  WHERE status = 'pending';

CREATE INDEX failed_tasks_pending_idx
  ON public.failed_tasks (status, last_attempt_at);

GRANT ALL ON public.failed_tasks TO service_role;

ALTER TABLE public.failed_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "failed_tasks service role only"
  ON public.failed_tasks FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);