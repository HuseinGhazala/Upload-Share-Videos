-- باقات رفع مدفوعة (ريال) — أعمدة plan_key و upload_credits_remaining
-- غير محدود: plan_key = unlimited و upload_credits_remaining = -1

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_key text NOT NULL DEFAULT 'none'
    CHECK (plan_key IN ('none', 'single', 'triple', 'unlimited'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS upload_credits_remaining integer NOT NULL DEFAULT 0;

-- ترحيل من نظام tier القديم
UPDATE public.profiles
SET plan_key = 'unlimited', upload_credits_remaining = -1
WHERE subscription_tier = 'pro';

UPDATE public.profiles
SET plan_key = 'none', upload_credits_remaining = 0
WHERE subscription_tier = 'free';

CREATE OR REPLACE FUNCTION public.consume_upload_credit()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  c int;
  p text;
BEGIN
  IF uid IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT upload_credits_remaining, plan_key INTO c, p
  FROM public.profiles WHERE id = uid FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'no_profile');
  END IF;

  IF p = 'unlimited' THEN
    RETURN json_build_object('ok', true);
  END IF;

  IF c <= 0 THEN
    RETURN json_build_object('ok', false, 'error', 'no_credits');
  END IF;

  UPDATE public.profiles
  SET
    upload_credits_remaining = GREATEST(c - 1, 0),
    plan_key = CASE WHEN c - 1 <= 0 THEN 'none' ELSE p END,
    updated_at = now()
  WHERE id = uid;

  RETURN json_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_upload_credit() TO authenticated;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM PUBLIC;
GRANT SELECT ON public.profiles TO authenticated;
