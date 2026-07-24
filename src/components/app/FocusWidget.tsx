import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Pause, Play, Share2, SkipForward, Square } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import FloatingWindow from './FloatingWindow';

const DURATIONS = [15, 25, 45, 60];

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
      gain.gain.exponentialRampToValueAtTime(0.16, now + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.42);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // no-op if audio isn't available
  }
}

type Phase = 'timer' | 'quicklog' | 'done';

/**
 * The Focus timer's content only \u2014 all window chrome (drag, resize,
 * minimize, maximize, close, position/size persistence) lives in
 * FloatingWindow. Mounted once by AppLayout, keyed by the active task id,
 * so a fresh session always starts with clean local state without needing
 * a reset effect.
 */
export default function FocusWidget() {
  const navigate = useNavigate();
  const activeTask = useAppStore((s) => s.activeFocusTask);
  const closeWidget = useAppStore((s) => s.closeFocusWidget);
  const activeGoal = useAppStore((s) => s.activeGoal());
  const completeDebrief = useAppStore((s) => s.completeDebrief);
  const toggleDailyTask = useAppStore((s) => s.toggleDailyTask);

  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState<Phase>('timer');
  const [logText, setLogText] = useState('');
  const chimedRef = useRef(false);

  useEffect(() => {
    if (isPaused || phase !== 'timer') return;
    const t = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [isPaused, phase]);

  const timeUp = remaining === 0 && phase === 'timer';
  useEffect(() => {
    if (timeUp && !chimedRef.current) {
      chimedRef.current = true;
      playChime();
      setPhase('quicklog');
    }
  }, [timeUp]);

  if (!activeTask) return null;

  function selectDuration(d: number) {
    setDuration(d);
    setRemaining(d * 60);
    chimedRef.current = false;
  }

  function submitLog() {
    if (!activeTask) return;
    const elapsedMinutes = Math.max(1, duration - Math.ceil(remaining / 60));
    if (activeTask.isDailyTask) {
      toggleDailyTask(activeTask.id);
    } else if (activeGoal) {
      completeDebrief({
        taskTitle: activeTask.title,
        rawText: logText || 'Marked done from the Focus widget.',
        aiSummary: logText ? `Logged: "${logText.slice(0, 70)}${logText.length > 70 ? '\u2026' : ''}"` : `Marked "${activeTask.title}" done.`,
        focusMinutes: elapsedMinutes,
      });
    }
    setPhase('done');
    if (activeTask.isDailyTask) {
      setTimeout(() => closeWidget(), 2200);
    }
  }

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  const progress = ((duration * 60 - remaining) / (duration * 60)) * 100;
  const accentColor = timeUp ? 'var(--gold)' : phase === 'timer' && !isPaused ? 'var(--violet)' : 'var(--text-faint)';
  const title = phase === 'done' ? 'Logged' : phase === 'quicklog' ? 'Wrap up' : 'Focusing';

  const defaultRect = {
    x: Math.max(24, window.innerWidth - 320),
    y: Math.max(24, window.innerHeight - 420),
    width: 296,
    height: 300,
  };

  return (
    <FloatingWindow
      id="focus-window"
      isOpen
      onClose={closeWidget}
      title={title}
      accentColor={accentColor}
      defaultRect={defaultRect}
      minimizedWidth={230}
      minWidth={260}
      minHeight={220}
      maxWidth={420}
      maxHeight={520}
      minimizedContent={
        <div className="px-3.5 py-2.5 flex items-center gap-2.5">
          <span className="font-mono text-[13px] tabular-nums shrink-0" style={{ color: 'var(--text)' }}>{phase === 'timer' ? `${mins}:${secs}` : '\u2013'}</span>
          <span className="text-[11.5px] truncate flex-1" style={{ color: 'var(--text-muted)' }}>{activeTask.title}</span>
        </div>
      }
    >
      <div className="px-4 py-4">
        {phase === 'timer' && (
          <>
            <p className="text-[12.5px] leading-snug mb-3 line-clamp-2" style={{ color: 'var(--text)' }}>{activeTask.title}</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg width={56} height={56} className="-rotate-90">
                  <circle cx={28} cy={28} r={24} fill="none" stroke="var(--line)" strokeWidth={3.5} />
                  <circle
                    cx={28}
                    cy={28}
                    r={24}
                    fill="none"
                    stroke="var(--violet)"
                    strokeWidth={3.5}
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24 * (1 - progress / 100)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <span className="absolute font-mono text-[12px] tabular-nums" style={{ color: 'var(--text)' }}>{mins}:{secs}</span>
              </div>
              <div className="flex flex-wrap gap-1 flex-1">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => selectDuration(d)}
                    className="pill px-2 py-1 font-mono text-[10.5px]"
                    style={d === duration ? { color: 'var(--violet)', borderColor: 'var(--violet)', background: 'rgba(131,53,253,0.14)' } : { color: 'var(--text-muted)' }}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setIsPaused((p) => !p)} className="btn btn-ghost flex-1 justify-center gap-1.5 text-[11.5px] py-1.5">
                {isPaused ? <Play size={12} /> : <Pause size={12} />} {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button onClick={closeWidget} aria-label="Skip" className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}>
                <SkipForward size={13} />
              </button>
              <button onClick={() => setPhase('quicklog')} aria-label="End session" className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--danger)' }}>
                <Square size={11} />
              </button>
            </div>
          </>
        )}

        {phase === 'quicklog' && (
          <>
            <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text)' }}>What did you get done?</p>
            <p className="text-[11px] mb-2.5 line-clamp-1" style={{ color: 'var(--text-faint)' }}>{activeTask.title}</p>
            <textarea
              autoFocus
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="A quick note (optional)&hellip;"
              rows={2}
              className="w-full rounded-lg px-2.5 py-2 text-[12px] outline-none resize-none mb-2.5"
              style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
            />
            <div className="flex gap-1.5">
              <button onClick={submitLog} className="btn btn-primary flex-1 justify-center gap-1.5 text-[11.5px] py-1.5">
                <Check size={12} /> Log it
              </button>
              <button onClick={closeWidget} className="btn btn-ghost text-[11.5px] py-1.5 px-3">Discard</button>
            </div>
          </>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center mb-2" style={{ background: 'rgba(242,184,75,0.16)' }}>
              <Check size={16} color="var(--gold)" />
            </div>
            <p className="text-[12.5px] mb-3" style={{ color: 'var(--text)' }}>Nice work.</p>
            {!activeTask.isDailyTask && (
              <div className="flex gap-1.5 w-full">
                <button
                  onClick={() => {
                    closeWidget();
                    navigate('/app/share');
                  }}
                  className="btn btn-primary flex-1 justify-center gap-1.5 text-[11.5px] py-1.5"
                >
                  <Share2 size={12} /> Share it
                </button>
                <button onClick={closeWidget} className="btn btn-ghost text-[11.5px] py-1.5 px-3">Done</button>
              </div>
            )}
          </div>
        )}
      </div>
    </FloatingWindow>
  );
}
