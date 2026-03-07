ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS google_place_id text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS yelp_alias text;

CREATE OR REPLACE FUNCTION public.get_review_company_info(p_token text)
RETURNS TABLE(google_place_id text, yelp_alias text)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT c.google_place_id, c.yelp_alias
  FROM public.location_review_requests rr
  JOIN public.locations l ON l.id = rr.location_id
  JOIN public.companies c ON c.id = l.company_id
  WHERE rr.token = p_token
  LIMIT 1;
END;
$$;