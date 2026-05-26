import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@/lib/supabase/server';

const GPU_SERVER_URL = process.env.GPU_SERVER_URL || 'https://cool-impalas-do.loca.lt';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, voice, emotion, speed, pitch } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Calculate credits needed (roughly based on word count)
    const wordCount = text.trim().split(/\s+/).length;
    const creditsNeeded = Math.max(1, Math.ceil(wordCount / 50));

    // Check user credits
    const { data: userProfile } = await (supabase as any)
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile || (userProfile as { credits: number }).credits < creditsNeeded) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    // Create job record
    const { data: job, error: jobError } = await (supabase as any)
      .from('jobs')
      .insert({
        user_id: user.id,
        job_type: 'tts',
        status: 'PENDING',
        input_data: { text, voice, emotion, speed, pitch },
        credits_used: creditsNeeded,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Job creation error:', jobError);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    const jobData = job as { id: string };

    // Deduct credits
    await (supabase as any)
      .from('users')
      .update({ credits: (userProfile as { credits: number }).credits - creditsNeeded })
      .eq('id', user.id);

    // Record credit transaction
    await (supabase as any).from('credit_transactions').insert({
      user_id: user.id,
      amount: -creditsNeeded,
      transaction_type: 'usage',
      description: `TTS generation - ${wordCount} words`,
    });

    // Update job status to PROCESSING
    await (supabase as any)
      .from('jobs')
      .update({ status: 'PROCESSING' })
      .eq('id', jobData.id);

    // Forward request to GPU server
    try {
      const gpuResponse = await axios.post(
        `${GPU_SERVER_URL}/api/tts`,
        {
          text,
          voice: voice || 'default',
          emotion: emotion || 'neutral',
          speed: speed || 1.0,
          pitch: pitch || 1.0,
          job_id: jobData.id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minute timeout for TTS
        }
      );

      const { audio_url, audioUrl, download_url, stream_url } = gpuResponse.data;
      const resultUrl = audio_url || audioUrl || download_url || stream_url;

      if (resultUrl) {
        // Update job status to COMPLETED
        await (supabase as any)
          .from('jobs')
          .update({
            status: 'COMPLETED',
            output_url: resultUrl,
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobData.id);

        return NextResponse.json({
          jobId: jobData.id,
          audioUrl: resultUrl,
          creditsUsed: creditsNeeded,
        });
      } else {
        throw new Error('No audio URL in response');
      }
    } catch (gpuError: any) {
      console.error('GPU Server error:', gpuError.message);

      // Update job status to FAILED
      await (supabase as any)
        .from('jobs')
        .update({
          status: 'FAILED',
          error_message: gpuError.message || 'GPU processing failed',
        })
        .eq('id', jobData.id);

      // Refund credits
      await (supabase as any)
        .from('users')
        .update({ credits: (userProfile as { credits: number }).credits })
        .eq('id', user.id);

      return NextResponse.json(
        { error: gpuError.message || 'GPU processing failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
