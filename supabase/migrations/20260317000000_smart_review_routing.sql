-- Smart Review Routing: add review settings to companies, visibility + soft-delete to reviews

-- 1. Add review routing settings to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS review_min_stars integer NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS review_trigger_words text[] NOT NULL DEFAULT '{}';

-- 2. Add visibility + soft-delete columns to location_reviews
ALTER TABLE public.location_reviews
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- 3. Update RLS: allow owners to UPDATE customer_link reviews (for is_visible and deleted_at only)
-- Drop the restrictive update policy that blocks customer_link reviews
DROP POLICY IF EXISTS "Owners can update editable location reviews" ON public.location_reviews;

-- New policy: owners can update ANY review on their locations (for toggling visibility / soft-delete)
CREATE POLICY "Owners can update location reviews"
ON public.location_reviews
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.locations
    JOIN public.companies ON companies.id = locations.company_id
    WHERE locations.id = location_reviews.location_id
      AND companies.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.locations
    JOIN public.companies ON companies.id = locations.company_id
    WHERE locations.id = location_reviews.location_id
      AND companies.owner_user_id = auth.uid()
  )
);

-- 4. Update public read policy to only show visible + non-deleted reviews
DROP POLICY IF EXISTS "Public can read location reviews rows" ON public.location_reviews;
CREATE POLICY "Public can read location reviews rows"
ON public.location_reviews
FOR SELECT
TO public
USING (
  is_visible = true
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.locations
    WHERE locations.id = location_reviews.location_id
  )
);

-- Keep owner read policy unchanged (owners see ALL reviews including hidden/deleted)
-- The existing "Owners can read location reviews" policy already covers this.

-- 5. Extend get_review_company_info to return review routing settings
CREATE OR REPLACE FUNCTION public.get_review_company_info(p_token text)
RETURNS TABLE(google_place_id text, yelp_alias text, review_min_stars integer, review_trigger_words text[])
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT c.google_place_id, c.yelp_alias, c.review_min_stars, c.review_trigger_words
  FROM public.location_review_requests rr
  JOIN public.locations l ON l.id = rr.location_id
  JOIN public.companies c ON c.id = l.company_id
  WHERE rr.token = p_token
  LIMIT 1;
END;
$$;

-- 6. Update create_or_get_location_review_token to only check active reviews
CREATE OR REPLACE FUNCTION public.create_or_get_location_review_token(p_location_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_token text;
  new_token text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.locations
    JOIN public.companies ON companies.id = locations.company_id
    WHERE locations.id = p_location_id
      AND companies.owner_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Location not found or forbidden';
  END IF;

  -- Only check active (non-deleted) reviews
  IF EXISTS (SELECT 1 FROM public.location_reviews WHERE location_id = p_location_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Location already has a review';
  END IF;

  SELECT token
  INTO existing_token
  FROM public.location_review_requests
  WHERE location_id = p_location_id
    AND consumed_at IS NULL
    AND expires_at > now()
  LIMIT 1;

  IF existing_token IS NOT NULL THEN
    RETURN existing_token;
  END IF;

  new_token := replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.location_review_requests (location_id, token, created_by_user_id)
  VALUES (p_location_id, new_token, auth.uid())
  ON CONFLICT (location_id)
  DO UPDATE
    SET token = excluded.token,
        created_by_user_id = excluded.created_by_user_id,
        consumed_at = NULL,
        expires_at = now() + interval '30 days',
        created_at = now();

  RETURN new_token;
END;
$$;

-- 7. Update submit_location_review to only check active reviews
CREATE OR REPLACE FUNCTION public.submit_location_review(
  p_token text,
  p_customer_name text,
  p_review_text text,
  p_stars integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_row public.location_review_requests%rowtype;
BEGIN
  IF p_stars IS NULL OR p_stars < 1 OR p_stars > 5 THEN
    RAISE EXCEPTION 'Invalid star rating';
  END IF;

  SELECT *
  INTO request_row
  FROM public.location_review_requests
  WHERE token = p_token
  LIMIT 1;

  IF request_row.id IS NULL THEN
    RAISE EXCEPTION 'Invalid review link';
  END IF;

  IF request_row.consumed_at IS NOT NULL THEN
    RAISE EXCEPTION 'This review link was already used';
  END IF;

  IF request_row.expires_at <= now() THEN
    RAISE EXCEPTION 'This review link has expired';
  END IF;

  -- Only check active (non-deleted) reviews
  IF EXISTS (SELECT 1 FROM public.location_reviews WHERE location_id = request_row.location_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'A review already exists for this location';
  END IF;

  INSERT INTO public.location_reviews (
    location_id,
    customer_name,
    review_text,
    stars,
    source,
    review_request_id
  )
  VALUES (
    request_row.location_id,
    nullif(trim(p_customer_name), ''),
    nullif(trim(p_review_text), ''),
    p_stars,
    'customer_link',
    request_row.id
  );

  UPDATE public.location_review_requests
  SET consumed_at = now()
  WHERE id = request_row.id;

  RETURN request_row.location_id;
END;
$$;
