import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Download } from 'lucide-react';
import Background from '../../components/app/Background';
import { FocusedScreen, GlassCard } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';

export default function ShareResult() {
  const navigate = useNavigate();
  const activeGoal = useAppStore((s) => s.activeGoal());
  const streak = useAppStore((s) => s.streak);
  const lastDebrief = useAppStore((s) => s.lastDebrief);
  const finishToday = useAppStore((s) => s.finishToday);

  const goalTitle = activeGoal?.title ?? 'my goal';
  const milestone = activeGoal?.roadmap.milestones.find((m) => m.status === 'current')?.title ?? 'current milestone';
  const summary = lastDebrief?.aiSummary ?? '';
  const day = streak + 1;

  const posts = useMemo(
    () => ({
      twitter: `Just shipped a step toward ${goalTitle}. ${summary.slice(0, 60)}\u2026 #buildinpublic`,
      linkedin: `Today I made progress on ${goalTitle}. ${summary} This is part of the "${milestone}" milestone. Building in public keeps me honest about the work.`,
      cardHeadline: `Day ${day}: ${summary.split('.')[0] || 'Made progress'}`,
      cardSubline: `${goalTitle} \u00b7 ${milestone}`,
    }),
    [goalTitle, summary, milestone, day]
  );

  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleDone = () => {
    finishToday({ goalTitle, twitter: posts.twitter, linkedin: posts.linkedin, cardHeadline: posts.cardHeadline, cardSubline: posts.cardSubline });
    navigate('/app');
  };

  return (
    <FocusedScreen maxWidth={560}>
      <Background />
      <GlassCard>
        <h2 className="font-display font-semibold text-[22px]" style={{ color: 'var(--text)' }}>Build in public</h2>
        <p className="text-[13px] mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>Your work is now proof. Share it with the world.</p>

        <div className="flex flex-col gap-5">
          <PostBlock label="Twitter / X" text={posts.twitter} copied={copied === 'Twitter'} onCopy={() => copy(posts.twitter, 'Twitter')} />
          <PostBlock label="LinkedIn" text={posts.linkedin} copied={copied === 'LinkedIn'} onCopy={() => copy(posts.linkedin, 'LinkedIn')} />

          <div className="rounded-2xl p-4" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
            <div className="font-mono text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Build in public card</div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--ink)', border: '1px solid var(--line)' }}>
              <div className="font-display font-semibold text-lg" style={{ color: 'var(--text)' }}>{posts.cardHeadline}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{posts.cardSubline}</div>
              <div className="mt-3 pt-2.5 font-mono text-[10px]" style={{ color: 'var(--violet)', borderTop: '1px solid var(--line)' }}>Built with Shift</div>
            </div>
            <div className="flex gap-3 items-center flex-wrap mt-3">
              <button onClick={() => copy(`${posts.cardHeadline}\n${posts.cardSubline}`, 'Card')} className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5">
                {copied === 'Card' ? <Check size={13} /> : <Copy size={13} />} {copied === 'Card' ? 'Copied' : 'Copy'}
              </button>
              <button className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5">
                <Download size={13} /> Download
              </button>
            </div>
          </div>
        </div>

        <button onClick={handleDone} className="btn btn-primary w-full justify-center mt-7">Done for today</button>
      </GlassCard>
    </FocusedScreen>
  );
}

function PostBlock({ label, text, copied, onCopy }: { label: string; text: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
      <div className="font-mono text-[10px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>{text}</p>
      <button onClick={onCopy} className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5">
        {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
