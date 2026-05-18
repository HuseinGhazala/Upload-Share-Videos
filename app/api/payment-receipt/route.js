import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOptionalAuthUser } from '@/app/lib/authSession';
import { rateLimit } from '@/app/lib/rateLimit';
import { PLAN_KEYS } from '@/app/lib/plans';
import { randomUUID } from 'crypto';

const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = 'payment-receipts';
const VALID_PLANS = new Set([PLAN_KEYS.SINGLE, PLAN_KEYS.TRIPLE, PLAN_KEYS.UNLIMITED]);

const MIME_TO_EXT = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

/**
 * رفع إيصال دفع (PDF أو صورة) لطلب تفعيل باقة.
 * POST multipart: planKey, file, userNote (اختياري)
 */
export async function POST(request) {
  const user = await getOptionalAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'يلزم تسجيل الدخول لإتمام هذه العملية.' }, { status: 401 });
  }

  const limited = rateLimit(`payment-receipt:${user.id}`, { max: 8, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: 'تم تلقّي عدد كبير من الطلبات في وقت قصير، يرجى المحاولة بعد قليل.' }, { status: 429 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { success: false, error: 'الخادم غير مهيّأ بشكل صحيح (Supabase service role).' },
      { status: 501 }
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: 'نموذج الإرسال غير صالح.' }, { status: 400 });
  }

  const planKey = form.get('planKey')?.toString?.() ?? '';
  if (!VALID_PLANS.has(planKey)) {
    return NextResponse.json({ success: false, error: 'الباقة المختارة غير معتمدة.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!file || typeof file === 'string' || !file.size) {
    return NextResponse.json({ success: false, error: 'يرجى إرفاق ملف الإيصال.' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { success: false, error: 'حجم الملف يتجاوز الحد المسموح به (٥ ميجابايت).' },
      { status: 400 }
    );
  }

  const mimeType = file.type || 'application/octet-stream';
  const ext = MIME_TO_EXT[mimeType];
  if (!ext) {
    return NextResponse.json(
      { success: false, error: 'يُقبل ملف PDF أو صورة (JPG, PNG, WebP, GIF) فقط.' },
      { status: 400 }
    );
  }

  const userNoteRaw = form.get('userNote')?.toString?.() ?? '';
  const userNote =
    userNoteRaw.trim().length > 2000 ? userNoteRaw.trim().slice(0, 2000) : userNoteRaw.trim();

  const buffer = Buffer.from(await file.arrayBuffer());
  const submissionId = randomUUID();
  const storagePath = `${user.id}/${submissionId}${ext}`;

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (uploadError) {
    console.error('payment-receipt storage upload:', uploadError);
    return NextResponse.json(
      { success: false, error: 'تعذّر رفع الملف. تأكّد من إنشاء حاوية payment-receipts في Supabase.' },
      { status: 500 }
    );
  }

  const { error: insertError } = await admin.from('payment_submissions').insert({
    id: submissionId,
    user_id: user.id,
    plan_key: planKey,
    status: 'pending',
    storage_path: storagePath,
    file_name: file.name || `receipt${ext}`,
    mime_type: mimeType,
    user_note: userNote || null,
  });

  if (insertError) {
    await admin.storage.from(BUCKET).remove([storagePath]).catch(() => {});
    console.error('payment_submissions insert:', insertError);
    return NextResponse.json(
      { success: false, error: insertError.message || 'تعذّر حفظ الطلب، يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    submissionId,
    message: 'تم استلام الإيصال بنجاح. سنراجع الطلب وننتهي منه في أقرب وقت ممكن.',
  });
}

export const runtime = 'nodejs';
