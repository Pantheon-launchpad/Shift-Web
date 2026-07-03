import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotebookPen, Pause, Play, Square, X } from 'lucide-react';
import Background from './Background';
import { useAppStore } from '../../stores/useAppStore';

const DURATIONS = [15, 25, 45, 60];

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function selectDuration(d: number) {
    setDuration(d);
    setRemaining(d * 60);
  }

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  const progress = ((duration * 60 - remaining) / (duration * 60)) * 100;

  const handleEnd = () => {
    const elapsedMinutes = duration - Math.ceil(remaining / 60);
    endFocusSession(Math.max(1, elapsedMinutes));
    navigate('/app/debrief');
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
                onClick={() => navigate('/app')}
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
                stroke="var(--violet)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progress * 5.53} 553`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute font-mono tabular-nums" style={{ fontSize: 'clamp(44px, 11vw, 64px)', color: 'var(--text)' }}>
              {mins}:{secs}
            </div>
          </div>

          <p className="text-center text-sm leading-relaxed max-w-[360px]" style={{ color: 'var(--text-muted)' }}>{taskTitle}</p>

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

          <div className="flex gap-3 w-full">
            <button onClick={() => setIsPaused((p) => !p)} className="btn btn-ghost flex-1 justify-center gap-2">
              {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={handleEnd} className="btn btn-primary flex-1 justify-center gap-2">
              <Square size={13} fill="white" /> End session
            </button>
          </div>
        </div>

        {showNotes && (
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
        )}
      </div>
    </div>
  );
}
