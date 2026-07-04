import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Background from '../../components/app/Background';
import { FocusedScreen, GlassCard } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';

export default function Debrief() {
  const navigate = useNavigate();
  const activeGoal = useAppStore((s) => s.activeGoal());
  const todayTaskId = useAppStore((s) => s.todayTaskId());
  const completeDebrief = useAppStore((s) => s.completeDebrief);

  const currentMilestone = activeGoal?.roadmap.milestones.find((m) => m.status === 'current');
  const task = currentMilestone?.tasks.find((t) => t.id === todayTaskId);
  const taskTitle = task?.title ?? 'today\u2019s task';

  const [rawText, setRawText] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const trimmed = rawText.trim();
      const snippet = trimmed.length > 70 ? `${trimmed.slice(0, 70).trimEnd()}\u2026` : trimmed;
      const summary = `Logged: \u201c${snippet}\u201d \u2014 marked "${taskTitle}" as done and moved your milestone forward.`;
      setAiSummary(summary);
      setLoading(false);
      setTimeout(() => {
        completeDebrief({ taskTitle, rawText, link: link.trim() || undefined, aiSummary: summary, focusMinutes: 0 });
        navigate('/app/share');
      }, 550);
    }, 1300);
  };

  if (aiSummary) {
    return (
      <FocusedScreen maxWidth={480}>
        <Background />
        <GlassCard>
          <div className="flex gap-3 items-start">
            <span className="text-2xl leading-none" style={{ color: 'var(--violet)' }}>&#10003;</span>
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text)' }}>{aiSummary}</p>
          </div>
          <p className="mt-5 text-center font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Continuing&hellip;</p>
        </GlassCard>
      </FocusedScreen>
    );
  }

  return (
    <FocusedScreen maxWidth={480}>
      <Background />
      <GlassCard>
        <h2 className="font-display font-semibold text-[22px]" style={{ color: 'var(--text)' }}>What did you get done?</h2>
        <p className="text-[13px] mt-1 mb-5" style={{ color: 'var(--text-muted)' }}>Tell Shift what you accomplished during the focus session.</p>

        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Your update</span>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g., Wrote the landing page copy and fixed the mobile nav"
              rows={4}
              className="rounded-xl px-3.5 py-3 text-sm outline-none resize-y"
              style={{ background: 'var(--glass)', border: '1.5px solid var(--line)', color: 'var(--text)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--violet)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Link (optional)</span>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://github.com/your-pr, etc."
              className="h-11 rounded-xl px-3.5 text-sm outline-none"
              style={{ background: 'var(--glass)', border: '1.5px solid var(--line)', color: 'var(--text)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--violet)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
            />
          </label>

          <button type="submit" disabled={!rawText.trim() || loading} className="btn btn-primary justify-center mt-1">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Submit update'}
          </button>
        </form>
      </GlassCard>
    </FocusedScreen>
  );
}
