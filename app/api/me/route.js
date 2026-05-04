import { NextResponse } from 'next/server';
import { getAuthenticatedUploadContext } from '../../lib/authSession';
import { effectiveCreditsRemaining, planLabelAr } from '../../lib/plans';

export async function GET() {
  const { user, maxUploadBytes, profile, uploadAllowed } = await getAuthenticatedUploadContext();

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  const creditsRemaining = effectiveCreditsRemaining(profile);

  return NextResponse.json({
    authenticated: true,
    email: user.email,
    planKey: profile?.plan_key ?? 'none',
    planLabel: planLabelAr(profile?.plan_key),
    uploadAllowed,
    creditsRemaining,
    maxUploadBytes,
  });
}
