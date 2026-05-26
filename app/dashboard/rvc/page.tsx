'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import {
  Sparkles,
  Upload,
  Play,
  Pause,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  AudioWaveform,
  Info,
  FolderOpen,
} from 'lucide-react';

interface VoiceModel {
  id: string;
  name: string;
  description: string;
  model_type: 'clone' | 'rvc' | 'preset';
  model_url: string | null;
  is_public: boolean;
  created_at: string;
}

interface Job {
  id: string;
  status: string;
  input_data: any;
  output_url: string | null;
  created_at: string;
  credits_used: number;
}

const presetModels = [
  { id: 'model-1', name: 'Singer A', type: 'Preset' },
  { id: 'model-2', name: 'Narrator Pro', type: 'Preset' },
  { id: 'model-3', name: 'Character Voice', type: 'Preset' },
  { id: 'model-4', name: 'Radio Host', type: 'Preset' },
];

export default function RVCPage() {
  const [sourceAudio, setSourceAudio] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [pitchShift, setPitchShift] = useState(0);
  const [mixRatio, setMixRatio] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [userModels, setUserModels] = useState<VoiceModel[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetchUserModels();
    fetchJobs();
  }, []);

  const fetchUserModels = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('voice_models')
      .select('*')
      .eq('user_id', user.id)
      .eq('model_type', 'rvc')
      .order('created_at', { ascending: false });

    if (data) setUserModels(data as unknown as VoiceModel[]);
  };

  const fetchJobs = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .eq('job_type', 'rvc')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setJobs(data as unknown as Job[]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert('File size must be less than 100MB');
        return;
      }
      if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file');
        return;
      }
      setSourceAudio(file);
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
    }
  };

  const handleConvert = async () => {
    if (!sourceAudio || !selectedModel) return;

    setLoading(true);
    setStatus('Preparing audio...');
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append('audio', sourceAudio);
      formData.append('modelId', selectedModel);
      formData.append('pitchShift', String(pitchShift));
      formData.append('mixRatio', String(mixRatio));

      setProgress(40);
      setStatus('Loading voice model...');

      const response = await fetch('/api/rvc', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);
      setStatus('Converting voice...');

      const data = await response.json();

      setProgress(100);

      if (response.ok) {
        setStatus('Conversion complete!');
        setOutputUrl(data.audioUrl);
        fetchJobs();
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('RVC Error:', error);
      setStatus('An error occurred during conversion');
    } finally {
      setLoading(false);
      setProgress(0);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const allModels = [
    ...presetModels,
    ...userModels.map((m) => ({
      id: m.id,
      name: m.name,
      type: 'Custom',
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main RVC Interface */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-card/50 border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">RVC Converter</h2>
                <p className="text-sm text-muted-foreground">
                  Transform your voice into any character
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Source Audio Upload */}
              <div className="space-y-4">
                <Label>Source Audio</Label>
                <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="rvc-audio-upload"
                  />
                  <label
                    htmlFor="rvc-audio-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {sourceAudio ? sourceAudio.name : 'Upload source audio'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        MP3, WAV, M4A up to 100MB
                      </p>
                    </div>
                  </label>
                </div>

                {/* Audio Preview */}
                {audioPreview && (
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Original Audio
                    </Label>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => {
                          const audio = document.getElementById(
                            'source-audio'
                          ) as HTMLAudioElement;
                          if (playing === 'source') {
                            audio.pause();
                            setPlaying(null);
                          } else {
                            audio.play();
                            setPlaying('source');
                          }
                        }}
                        size="icon"
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                      >
                        {playing === 'source' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </Button>
                      <div className="flex-1 h-8 bg-background/50 rounded-lg flex items-center px-4">
                        <div className="flex-1 flex items-center gap-1">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-emerald-500/50 rounded-full"
                              style={{
                                height: `${Math.random() * 16 + 8}px`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <audio
                      id="source-audio"
                      src={audioPreview}
                      onEnded={() => setPlaying(null)}
                    />
                  </div>
                )}
              </div>

              {/* Voice Model Selection */}
              <div className="space-y-2">
                <Label>Voice Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice model" />
                  </SelectTrigger>
                  <SelectContent>
                    {allModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {model.name}
                          <Badge variant="outline" className="ml-2">
                            {model.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Settings */}
              <div className="p-4 rounded-lg bg-secondary/30 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Info className="w-4 h-4" />
                  Conversion Settings
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pitch Shift: {pitchShift >= 0 ? '+' : ''}{pitchShift} semitones</Label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={pitchShift}
                      onChange={(e) => setPitchShift(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Lower</span>
                      <span>Higher</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Voice Mix: {Math.round(mixRatio * 100)}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={mixRatio}
                      onChange={(e) => setMixRatio(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Original</span>
                      <span>Converted</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              {loading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {status}
                  </p>
                </div>
              )}

              {/* Status */}
              {status && !loading && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    status.includes('Error')
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {status.includes('Error') ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {status}
                </div>
              )}

              {/* Convert Button */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  5 credits per minute
                </Badge>
                <Button
                  onClick={handleConvert}
                  disabled={loading || !sourceAudio || !selectedModel}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Convert Voice
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Output Player */}
          {outputUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-card/50 border border-border/50 p-6"
            >
              <h3 className="font-semibold mb-4">Converted Audio</h3>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => {
                    const audio = document.getElementById(
                      'output-audio'
                    ) as HTMLAudioElement;
                    if (playing === 'output') {
                      audio.pause();
                      setPlaying(null);
                    } else {
                      audio.play();
                      setPlaying('output');
                    }
                  }}
                  size="icon"
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                >
                  {playing === 'output' ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
                <div className="flex-1 h-12 bg-secondary/30 rounded-lg flex items-center px-4">
                  <div className="flex-1 flex items-center gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-emerald-500/50 rounded-full"
                        style={{
                          height: `${Math.random() * 24 + 8}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = outputUrl;
                    a.download = `rvc-${Date.now()}.wav`;
                    a.click();
                  }}
                  size="icon"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <audio
                id="output-audio"
                src={outputUrl}
                onEnded={() => setPlaying(null)}
              />
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-card/50 border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AudioWaveform className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Recent Conversions</h3>
            </div>
            <div className="space-y-3">
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No conversions yet
                </p>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {job.input_data?.modelId || 'Unknown Model'}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          job.status === 'COMPLETED'
                            ? 'text-emerald-400 border-emerald-500/30'
                            : 'text-muted-foreground'
                        }
                      >
                        {job.status.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      <span>{job.credits_used} credits</span>
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
            className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold">Tips</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Lower pitch for deeper voices</li>
              <li>Higher mix ratio for stronger effect</li>
              <li>Clean audio works best</li>
              <li>Experiment with pitch shift</li>
            </ul>
          </motion.div>

          {/* Upload Custom Model */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-card/50 border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Custom Models</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your own RVC models for conversion.
            </p>
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Import Model
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
