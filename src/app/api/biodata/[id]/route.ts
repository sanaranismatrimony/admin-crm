import { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) {
    return new Response('Not found', { status: 404 });
  }

  const { data: siblings } = await supabase
    .from('siblings')
    .select('*')
    .eq('profile_id', id);

  const logoPath = path.join(process.cwd(), 'public', 'bio-data-logo.png');
  const logoMeta = await sharp(logoPath).metadata();
  const logoDisplayW = 300;
  const logoDisplayH = Math.round(logoDisplayW * (logoMeta.height! / logoMeta.width!));
  const logoBuffer = await sharp(logoPath)
    .resize({ width: logoDisplayW * 2 })
    .png()
    .toBuffer();
  const logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  const [{ renderToBuffer }, { BiodataCard }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/pdf/BiodataCard'),
  ]);

  const buffer = await renderToBuffer(
    (await import('react')).createElement(BiodataCard, {
      profile,
      siblings: siblings || [],
      logoSrc,
      logoWidth: logoDisplayW,
      logoHeight: logoDisplayH,
    }) as any
  );

  const name = (profile.full_name || 'Profile').replace(/[^\w\s-]/g, '').trim() || 'Profile';
  const filename = `${encodeURIComponent(name)}%20Biodata.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
