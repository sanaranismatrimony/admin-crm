import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { extractBiodata, ExtractionError } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminSettings } = await supabase
    .from('admin_settings')
    .select('admin_email')
    .single();
  if (!adminSettings || adminSettings.admin_email !== user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const supported = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'webp'];

    if (!ext || !supported.includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, JPG, JPEG, PNG, or WEBP.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    const pipelineResult = await extractBiodata(buffer, file.type, file.name);

    return NextResponse.json({
      success: true,
      data: pipelineResult.result,
      normalized: pipelineResult.normalized,
      source: pipelineResult.source,
      confidence: pipelineResult.confidence,
      warnings: pipelineResult.warnings,
    });
  } catch (error: any) {
    const message = error.message || 'Failed to parse biodata';

    if (error instanceof ExtractionError) {
      if (error.code === 'FILE_TOO_LARGE') {
        return NextResponse.json({ error: message }, { status: 413 });
      }
      if (error.code === 'UNSUPPORTED_FORMAT') {
        return NextResponse.json({ error: message }, { status: 400 });
      }
      if (error.code === 'OCR_FAILED') {
        return NextResponse.json({ error: message }, { status: 422 });
      }
      return NextResponse.json({ error: message }, { status: 422 });
    }

    if (message.includes('GROQ_API_KEY') || message.includes('API key')) {
      return NextResponse.json({ error: 'AI service is not configured. Please contact the administrator.' }, { status: 500 });
    }

    if (message.includes('429') || message.includes('rate limit')) {
      return NextResponse.json({ error: 'AI service is busy. Please try again in a few seconds.' }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
