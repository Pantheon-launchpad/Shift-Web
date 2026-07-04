import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, NotebookPen, Pause, Play, Square, X } from 'lucide-react';
import Background from './Background';
import { useAppStore } from '../../stores/useAppStore';

const DURATIONS = [15, 25, 45, 60];

/** A short two-tone chime using the Web Audio API \u2014 no audio asset needed. */
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [880, 1108.73].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.42);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Audio isn't available in every environment (e.g. some test runners) \u2014
    // the visual "time's up" state still communicates completion either way.
  }
}

export default function FocusSession() {
  const navigate = useNavigate();
  const activeGoal = useAppStore((s) => s.activeGoal());
  const todayTaskId = useAppStore((s) => s.todayTaskId());
  const endFocusSession = useAppStore((s) => s.endFocusSession);

  const currentMilestone = activeGoal?.roadmap.milestones.find((m) => m.status === 'current');
  const task = currentMilestone?.tasks.find((t) => t.id === todayTaskId);
  const taskTitle = task?.title ?? 'Focus on your next meaningful step';

  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [confirmingExit, setConfirmingExit] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chimedRef = useRef(false);

  function selectDuration(d: number) {
    setDuration(d);
    setRemaining(d * 60);
    chimedRef.current = false;
  }

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const timeUp = remaining === 0;

  useEffect(() => {
    if (timeUp && !chimedRef.current) {
      chimedRef.current = true;
      playChime();
    }
  }, [timeUp]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  const progress = ((duration * 60 - remaining) / (duration * 60)) * 100;
  const elapsedSeconds = duration * 60 - remaining;

  const handleEnd = () => {
    const elapsedMinutes = duration - Math.ceil(remaining / 60);
    endFocusSession(Math.max(1, elapsedMinutes));
    navigate('/app/debrief');
  };

  const requestExit = () => {
    if (elapsedSeconds < 10) {
      navigate('/app');
      return;
    }
    setConfirmingExit(true);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center" style={{ background: 'var(--ink)' }}>
      <Background />
      <div className="relative z-10 flex w-full h-full items-stretch justify-center">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-5 py-10 max-w-[420px] mx-auto">
          <div className="w-full flex items-center justify-between">
            <span className="eyebrow">Focus session</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotes((s) => !s)}
                aria-label="Toggle notes"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: showNotes ? 'var(--violet)' : 'var(--text-muted)' }}
              >
                <NotebookPen size={16} />
              </button>
              <button
                onClick={requestExit}
                aria-label="Exit focus session"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="88" fill="none" stroke="var(--line)" strokeWidth="4" />
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke={timeUp ? 'var(--gold)' : 'var(--violet)'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progress * 5.53} 553`}
                style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s ease' }}
              />
            </svg>
            <div
              className="absolute font-mono tabular-nums"
              style={{ fontSize: 'clamp(44px, 11vw, 64px)', color: timeUp ? 'var(--gold)' : 'var(--text)', animation: timeUp ? 'pulse 1.4s ease-in-out infinite' : undefined }}
            >
              {timeUp ? 'Time\u2019s up' : `${mins}:${secs}`}
            </div>
          </div>

          <p className="text-center text-sm leading-relaxed max-w-[360px]" style={{ color: 'var(--text-muted)' }}>{taskTitle}</p>

          {!timeUp && (
            <div className="flex gap-2 flex-wrap justify-center">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => selectDuration(d)}
                  className="pill px-3.5 py-1.5 font-mono text-xs transition-colors"
                  style={
                    d === duration
                      ? { color: 'var(--violet)', borderColor: 'var(--violet)', background: 'rgba(131,53,253,0.14)' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  {d}m
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 w-full">
            {!timeUp && (
              <button onClick={() => setIsPaused((p) => !p)} className="btn btn-ghost flex-1 justify-center gap-2">
                {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button onClick={handleEnd} className="btn btn-primary flex-1 justify-center gap-2">
              <Square size={13} fill="white" /> {timeUp ? 'Log what you did' : 'End session'}
            </button>
          </div>
        </div>

        {showNotes && (
          <>
            {/* Desktop: docked side panel */}
            <div
              className="hidden sm:flex flex-col w-[320px] p-5"
              style={{ borderLeft: '1px solid var(--line)', background: 'var(--ink-1)' }}
            >
              <span className="font-mono text-[10px] uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Notes</span>
              <textarea
                autoFocus
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down anything worth remembering during this session..."
                className="flex-1 rounded-xl px-3.5 py-3 text-sm outline-none resize-none"
                style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
              />
            </div>

            {/* Mobile: bottom sheet, since there's no room for a side panel */}
            <div className="sm:hidden fixed inset-0 z-40 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowNotes(false)}>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col p-5 rounded-t-2xl"
                style={{ background: 'var(--ink-1)', border: '1px solid var(--line)', borderBottom: 'none', maxHeight: '60vh', paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))' }}
              >
                <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--line)' }} />
                <span className="font-mono text-[10px] uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Notes</span>
                <textarea
                  autoFocus
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jot down anything worth remembering during this session..."
                  rows={5}
                  className="rounded-xl px-3.5 py-3 text-sm outline-none resize-none"
                  style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
                />
                <button onClick={() => setShowNotes(false)} className="btn btn-ghost justify-center mt-3">Done</button>
              </div>
            </div>
          </>
        )}

        {confirmingExit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="w-full max-w-[360px] rounded-2xl p-5" style={{ background: 'var(--ink-1)', border: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: '#f87171' }}>
                <AlertTriangle size={15} />
                <p className="text-sm font-medium">Leave this session?</p>
              </div>
              <p className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>
                You&rsquo;ve been focused for a few minutes. Leaving now won&rsquo;t log any progress for today&rsquo;s task.
              </p>
              <div className="flex gap-2">
                <button onClick={() => navigate('/app')} className="btn flex-1 justify-center" style={{ background: '#f87171', color: 'white' }}>Leave anyway</button>
                <button onClick={() => setConfirmingExit(false)} className="btn btn-ghost flex-1 justify-center">Keep going</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }`}</style>
    </div>
  );
}
