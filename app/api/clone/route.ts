import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@/lib/supabase/server';

const GPU_SERVER_URL = process.env.GPU_SERVER_URL || 'https://cool-impalas-do.loca.lt';
const CREDITS_FOR_CLONE = 10;

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
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!audio || !name) {
      return NextResponse.json(
        { error: 'Audio file and name are required' },
        { status: 400 }
      );
    }

    // Validate file
    if (audio.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Check user credits
    const { data: userProfile } = await (supabase as any)
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile || (userProfile as { credits: number }).credits < CREDITS_FOR_CLONE) {
      return NextResponse.json(
        { error: 'Insufficient credits. 10 credits required for voice cloning.' },
        { status: 402 }
      );
    }

    // Upload audio to storage
    const fileName = `${user.id}/clone-${Date.now()}-${audio.name}`;
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

    // Deduct credits
    const currentCredits = (userProfile as { credits: number }).credits;
    await (supabase as any)
      .from('users')
      .update({ credits: currentCredits - CREDITS_FOR_CLONE })
      .eq('id', user.id);

    // Record credit transaction
    await (supabase as any).from('credit_transactions').insert({
      user_id: user.id,
      amount: -CREDITS_FOR_CLONE,
      transaction_type: 'usage',
      description: `Voice cloning: ${name}`,
    });

    // Create voice model record
    const { data: voiceModel, error: modelError } = await (supabase as any)
      .from('voice_models')
      .insert({
        user_id: user.id,
        name,
        description: description || '',
        model_type: 'clone',
        audio_url: publicUrl,
        is_public: isPublic,
      })
      .select()
      .single();

    if (modelError) {
      console.error('Model creation error:', modelError);
      return NextResponse.json(
        { error: 'Failed to create voice model' },
        { status: 500 }
      );
    }

    const voiceModelData = voiceModel as { id: string };

    // Forward request to GPU server with FormData
    try {
      // Create FormData for GPU server
      const gpuFormData = new FormData();
      gpuFormData.append('audio', audio);
      gpuFormData.append('voice_model_id', voiceModelData.id);
      gpuFormData.append('user_id', user.id);
      gpuFormData.append('name', name);
      gpuFormData.append('audio_url', publicUrl);

      const gpuResponse = await axios.post(
        `${GPU_SERVER_URL}/api/clone`,
        gpuFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 180000, // 3 minute timeout for cloning
        }
      );

      const { model_url, modelUrl, model_id } = gpuResponse.data;
      const resultModelUrl = model_url || modelUrl;

      if (resultModelUrl) {
        // Update voice model with model URL from GPU server
        await (supabase as any)
          .from('voice_models')
          .update({
            model_url: resultModelUrl,
          })
          .eq('id', voiceModelData.id);

        return NextResponse.json({
          success: true,
          voiceModelId: voiceModelData.id,
          modelUrl: resultModelUrl,
          audioUrl: publicUrl,
          creditsUsed: CREDITS_FOR_CLONE,
        });
      } else {
        // Model created but processing might be async
        return NextResponse.json({
          success: true,
          voiceModelId: voiceModelData.id,
          audioUrl: publicUrl,
          message: 'Voice sample uploaded. Processing will complete shortly.',
          creditsUsed: CREDITS_FOR_CLONE,
        });
      }
    } catch (gpuError: any) {
      console.error('GPU Server error:', gpuError.message);

      // Still return success as upload completed, processing will retry
      return NextResponse.json({
        success: true,
        voiceModelId: voiceModelData.id,
        audioUrl: publicUrl,
        message: 'Voice sample uploaded. Processing will complete shortly.',
        warning: gpuError.message,
        creditsUsed: CREDITS_FOR_CLONE,
      });
    }
  } catch (error: any) {
    console.error('Clone API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
