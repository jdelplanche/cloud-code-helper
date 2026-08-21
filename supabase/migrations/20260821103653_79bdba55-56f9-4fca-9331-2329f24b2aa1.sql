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