-- طلبات تأكيد الدفع (إيصال PDF أو صورة) + تخزين في bucket خاص

CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  plan_key text NOT NULL
    CHECK (plan_key IN ('single', 'triple', 'unlimited')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  storage_path text NOT NULL,
  file_name text,
  mime_type text,
  user_note text,
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_submissions_status_created_idx
  ON public.payment_submissions (status, created_at DESC);

CREATE INDEX IF NOT EXISTS payment_submissions_user_idx
  ON public.payment_submissions (user_id);

ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

-- قراءة الطلبات الخاصة بالمستخدم فقط (للاستعلام من العميل إن لزم لاحقاً)
CREATE POLICY "Users can select own payment submissions"
  ON public.payment_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- الإدراج والتحديث من الخادم بمفتاح الخدمة فقط (لا سياسة insert/update لـ authenticated)

CREATE OR REPLACE FUNCTION public.payment_submissions_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_submissions_updated ON public.payment_submissions;
CREATE TRIGGER payment_submissions_updated
  BEFORE UPDATE ON public.payment_submissions
  FOR EACH ROW EXECUTE PROCEDURE public.payment_submissions_set_updated_at();

-- حاوية تخزين للإيصالات (رفع من الخادم بمفتاح الخدمة فقط)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;
