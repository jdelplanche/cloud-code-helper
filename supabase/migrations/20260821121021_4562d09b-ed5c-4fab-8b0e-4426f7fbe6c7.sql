CREATE TABLE public.infra_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket TEXT NOT NULL UNIQUE,
  org TEXT NOT NULL,
  domain TEXT NOT NULL,
  stack TEXT NOT NULL,
  account_status TEXT NOT NULL DEFAULT 'existing',
  notes TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  locale text NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT infra_requests_locale_check CHECK (locale IN ('en','nl','fr'))
);
REVOKE ALL ON public.infra_requests FROM anon, authenticated;
GRANT ALL ON public.infra_requests TO service_role;
ALTER TABLE public.infra_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  locale text NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT contact_messages_locale_check CHECK (locale IN ('en','nl','fr'))
);
REVOKE ALL ON public.contact_messages FROM anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.affiliate_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_key text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX affiliate_clicks_target_key_idx ON public.affiliate_clicks (target_key, created_at DESC);
REVOKE ALL ON public.affiliate_clicks FROM anon, authenticated;
GRANT ALL ON public.affiliate_clicks TO service_role;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

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