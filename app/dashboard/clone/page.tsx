'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import {
  Mic2,
  Upload,
  Play,
  Pause,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  History,
  Info,
  AudioWaveform,
} from 'lucide-react';

interface VoiceModel {
  id: string;
  name: string;
  description: string;
  model_type: 'clone' | 'rvc' | 'preset';
  audio_url: string | null;
  is_public: boolean;
  created_at: string;
}

export default function ClonePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [cloning, setCloning] = useState(false);
  const [cloneStatus, setCloneStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('voice_models')
      .select('*')
      .eq('user_id', user.id)
      .eq('model_type', 'clone')
      .order('created_at', { ascending: false });

    if (data) setModels(data as unknown as VoiceModel[]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file');
        return;
      }
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
    }
  };

  const handleClone = async () => {
    if (!audioFile || !name.trim()) return;

    setCloning(true);
    setCloneStatus('Uploading audio sample...');
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('isPublic', String(isPublic));

      setUploadProgress(40);
      setCloneStatus('Analyzing voice characteristics...');

      const response = await fetch('/api/clone', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(70);
      setCloneStatus('Building voice model...');

      const data = await response.json();

      setUploadProgress(100);

      if (response.ok) {
        setCloneStatus('Voice cloned successfully!');
        setName('');
        setDescription('');
        setAudioFile(null);
        setAudioPreview(null);
        setIsPublic(false);
        fetchModels();
      } else {
        setCloneStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Clone Error:', error);
      setCloneStatus('An error occurred during cloning');
    } finally {
      setCloning(false);
      setUploadProgress(0);
      setTimeout(() => setCloneStatus(null), 3000);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this voice model?')) return;

    await supabase.from('voice_models').delete().eq('id', modelId);
    fetchModels();
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Cloning Interface */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-card/50 border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Voice Cloning Studio</h2>
                <p className="text-sm text-muted-foreground">
                  Clone any voice with seconds of audio
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name">Voice Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Custom Voice"
                  className="max-w-md"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this voice..."
                  className="max-w-md"
                />
              </div>

              {/* Audio Upload */}
              <div className="space-y-4">
                <Label>Audio Sample</Label>
                <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-teal-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {audioFile ? audioFile.name : 'Drop audio file here'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        MP3, WAV, M4A up to 50MB. 10-30 seconds recommended.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Audio Preview */}
                {audioPreview && (
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => {
                          const audio = document.getElementById(
                            'preview-audio'
                          ) as HTMLAudioElement;
                          if (playingId === 'preview') {
                            audio.pause();
                            setPlayingId(null);
                          } else {
                            audio.play();
                            setPlayingId('preview');
                          }
                        }}
                        size="icon"
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                      >
                        {playingId === 'preview' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 h-8">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-teal-500/50 rounded-full"
                              style={{
                                height: `${Math.random() * 20 + 8}px`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setAudioFile(null);
                          setAudioPreview(null);
                          setPlayingId(null);
                        }}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <audio
                      id="preview-audio"
                      src={audioPreview}
                      onEnded={() => setPlayingId(null)}
                    />
                  </div>
                )}
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div>
                  <Label className="font-medium">Make Public</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to use this voice model
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              {/* Progress */}
              {cloning && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {cloneStatus}
                  </p>
                </div>
              )}

              {/* Status */}
              {cloneStatus && !cloning && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    cloneStatus.includes('Error')
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {cloneStatus.includes('Error') ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {cloneStatus}
                </div>
              )}

              {/* Clone Button */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-teal-400 border-teal-500/30">
                  10 credits
                </Badge>
                <Button
                  onClick={handleClone}
                  disabled={cloning || !audioFile || !name.trim()}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                >
                  {cloning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cloning...
                    </>
                  ) : (
                    <>
                      <Mic2 className="w-4 h-4 mr-2" />
                      Clone Voice
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* My Voices Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-card/50 border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AudioWaveform className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">My Cloned Voices</h3>
            </div>
            <div className="space-y-3">
              {models.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No cloned voices yet
                </p>
              ) : (
                models.map((model) => (
                  <div
                    key={model.id}
                    className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{model.name}</span>
                      {model.is_public && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {model.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(model.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        onClick={() => handleDeleteModel(model.id)}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-teal-400" />
              <h3 className="font-semibold">Tips for Best Results</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Use 10-30 seconds of clear audio</li>
              <li>Ensure no background noise</li>
              <li>Consistent volume throughout</li>
              <li>Single speaker only</li>
              <li>Natural speech patterns work best</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
