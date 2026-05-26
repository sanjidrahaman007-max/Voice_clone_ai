import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@/lib/supabase/server';

const GPU_SERVER_URL = process.env.GPU_SERVER_URL || 'https://cool-impalas-do.loca.lt';
const CREDITS_PER_MINUTE = 5;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const audio = formData.get('audio') as File;
    const modelId = formData.get('modelId') as string;
    const pitchShift = parseInt(formData.get('pitchShift') as string) || 0;
    const mixRatio = parseFloat(formData.get('mixRatio') as string) || 0.5;

    if (!audio || !modelId) {
      return NextResponse.json(
        { error: 'Audio file and voice model are required' },
        { status: 400 }
      );
    }

    // Validate file
    if (audio.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 100MB' },
        { status: 400 }
      );
    }

    // Get audio duration for credit calculation (estimate based on file size)
    const estimatedMinutes = Math.max(1, Math.ceil(audio.size / (2 * 1024 * 1024)));
    const creditsNeeded = estimatedMinutes * CREDITS_PER_MINUTE;

    // Check user credits
    const { data: userProfile } = await (supabase as any)
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile || (userProfile as { credits: number }).credits < creditsNeeded) {
      return NextResponse.json(
        { error: `Insufficient credits. ${creditsNeeded} credits required.` },
        { status: 402 }
      );
    }

    // Verify voice model exists
    const { data: voiceModel } = await (supabase as any)
      .from('voice_models')
      .select('*')
      .eq('id', modelId)
      .maybeSingle();

    if (voiceModel) {
    } else {
    }

    // Upload audio to storage
    const fileName = `${user.id}/rvc-${Date.now()}-${audio.name}`;
    const { error: uploadError } = await supabase.storage
      .from('voice-samples')
      .upload(fileName, audio, {
        contentType: audio.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload audio' },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from('voice-samples').getPublicUrl(fileName);

    // Create job record
    const { data: job, error: jobError } = await (supabase as any)
      .from('jobs')
      .insert({
        user_id: user.id,
        job_type: 'rvc',
        status: 'PENDING',
        input_data: {
          modelId,
          pitchShift,
          mixRatio,
          audioUrl: publicUrl,
        },
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
      description: `RVC conversion - model: ${modelId}`,
    });

    // Update job status to PROCESSING
    await (supabase as any)
      .from('jobs')
      .update({ status: 'PROCESSING' })
      .eq('id', jobData.id);

    // Forward request to GPU server with FormData
    try {
      const gpuFormData = new FormData();
      gpuFormData.append('audio', audio);
      gpuFormData.append('model_id', modelId);
      gpuFormData.append('model_url', voiceModel ? (voiceModel as any).model_url || '' : '');
      gpuFormData.append('pitch_shift', String(pitchShift));
      gpuFormData.append('mix_ratio', String(mixRatio));
      gpuFormData.append('job_id', jobData.id);

      const gpuResponse = await axios.post(
        `${GPU_SERVER_URL}/api/rvc`,
        gpuFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minute timeout for RVC
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
    console.error('RVC API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
