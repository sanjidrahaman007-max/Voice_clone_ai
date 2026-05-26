'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import {
  AudioWaveform,
  Play,
  Pause,
  Download,
  Loader2,
  Volume2,
  Settings2,
  History,
  Trash2,
} from 'lucide-react';

interface Job {
  id: string;
  status: string;
  input_data: any;
  output_url: string | null;
  created_at: string;
  credits_used: number;
}

const voiceOptions = [
  { id: 'default', name: 'Default Voice', type: 'preset' },
  { id: 'male-1', name: 'James (Male)', type: 'preset' },
  { id: 'female-1', name: 'Sarah (Female)', type: 'preset' },
  { id: 'male-2', name: 'David (Male)', type: 'preset' },
  { id: 'female-2', name: 'Emma (Female)', type: 'preset' },
];

const emotionOptions = [
  { id: 'neutral', name: 'Neutral' },
  { id: 'happy', name: 'Happy' },
  { id: 'sad', name: 'Sad' },
  { id: 'angry', name: 'Angry' },
  { id: 'excited', name: 'Excited' },
];

export default function TTSPage() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('default');
  const [emotion, setEmotion] = useState('neutral');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    fetchJobs();
    fetchCredits();
  }, []);

  const fetchJobs = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .eq('job_type', 'tts')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setJobs(data as unknown as Job[]);
  };

  const fetchCredits = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .maybeSingle();

    if (data) setCredits((data as { credits: number }).credits);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice,
          emotion,
          speed,
          pitch,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAudioUrl(data.audioUrl);
        fetchJobs();
        fetchCredits();
      } else {
        console.error('TTS Error:', data.error);
      }
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `tts-${Date.now()}.wav`;
    a.click();
  };

  const handlePlay = () => {
    const audio = document.querySelector('audio');
    if (audio) {
      if (playing) {
        audio.pause();
      } else {
        audio.play();
      }
      setPlaying(!playing);
    }
  };

  const estimateCredits = () => {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 50));
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main TTS Interface */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-card/50 border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <AudioWaveform className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Text to Speech</h2>
                <p className="text-sm text-muted-foreground">
                  Convert text to natural-sounding speech
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Text Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Text to Convert</Label>
                  <span className="text-xs text-muted-foreground">
                    {text.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to convert to speech..."
                  className="min-h-[200px] resize-none"
                />
              </div>

              {/* Voice Selection */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4" />
                            {v.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Emotion</Label>
                  <Select value={emotion} onValueChange={setEmotion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emotionOptions.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="p-4 rounded-lg bg-secondary/30 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Settings2 className="w-4 h-4" />
                  Advanced Settings
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Speed: {speed.toFixed(1)}x</Label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pitch: {pitch.toFixed(1)}</Label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={pitch}
                      onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                  ~{estimateCredits()} credits
                </Badge>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !text.trim() || credits < estimateCredits()}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <AudioWaveform className="w-4 h-4 mr-2" />
                      Generate Speech
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Audio Player */}
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-card/50 border border-border/50 p-6"
            >
              <h3 className="font-semibold mb-4">Generated Audio</h3>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePlay}
                  size="icon"
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
                >
                  {playing ? (
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
                        className="w-1 bg-cyan-500/50 rounded-full"
                        style={{
                          height: `${Math.random() * 24 + 8}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleDownload} size="icon" variant="outline">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <audio src={audioUrl} onEnded={() => setPlaying(false)} />
            </motion.div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-card/50 border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <History className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Recent Generations</h3>
            </div>
            <div className="space-y-3">
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No generations yet
                </p>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate flex-1">
                        {job.input_data?.text?.slice(0, 30)}...
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          job.status === 'COMPLETED'
                            ? 'text-emerald-400 border-emerald-500/30'
                            : job.status === 'PROCESSING'
                            ? 'text-yellow-400 border-yellow-500/30'
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
            className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 p-6"
          >
            <h3 className="font-semibold mb-2">Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Use punctuation for natural pauses</li>
              <li>Try different emotions for expressive speech</li>
              <li>Adjust speed for better clarity</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
