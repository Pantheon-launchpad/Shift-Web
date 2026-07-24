import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Download, Loader2 } from 'lucide-react';
import Background from '../../components/app/Background';
import { FocusedScreen, GlassCard } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';
import { downloadCard } from '../../lib/downloadCard';
import { generateBuildInPublicContent, type BuildInPublicContent } from '../../lib/aiApi';

export default function ShareResult() {
  const navigate = useNavigate();
  const activeGoal = useAppStore((s) => s.activeGoal());
  const streak = useAppStore((s) => s.streak());
  const lastDebrief = useAppStore((s) => s.lastDebrief);
  const publishPost = useAppStore((s) => s.publishPost);
  const skipSharing = useAppStore((s) => s.skipSharing);

  const goalTitle = activeGoal?.title ?? 'my goal';
  const milestone = activeGoal?.roadmap.milestones.find((m) => m.status === 'current' || m.status === 'done')?.title ?? 'current milestone';
  const summary = lastDebrief?.aiSummary ?? '';
  // The debrief already logged today, so the streak reflects today's work.
  const day = streak || 1;

  const localPosts = useMemo<BuildInPublicContent>(
    () => ({
      twitter: `Just shipped a step toward ${goalTitle}. ${summary.slice(0, 60)}\u2026 #buildinpublic`,
      linkedin: `Today I made progress on ${goalTitle}. ${summary} This is part of the "${milestone}" milestone. Building in public keeps me honest about the work.`,
      instagram: `Progress on ${goalTitle} today \u2728 ${summary.slice(0, 80)} #buildinpublic #wip`,
      medium: `Here's where things stand on ${goalTitle} today: ${summary} There's more to come on the "${milestone}" milestone.`,
      cardHeadline: `Day ${day}: ${summary.split('.')[0] || 'Made progress'}`,
      cardSubline: `${goalTitle} \u00b7 ${milestone}`,
    }),
    [goalTitle, summary, milestone, day]
  );

  const [posts, setPosts] = useState<BuildInPublicContent>(localPosts);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsGenerating(true);
    generateBuildInPublicContent({
      goalTitle,
      milestoneTitle: milestone,
      taskTitle: lastDebrief?.taskTitle,
      summary,
      roadmapMilestones: activeGoal?.roadmap.milestones.map((m) => m.title),
    })
      .then((ai) => {
        if (!cancelled) setPosts(ai);
      })
      .catch(() => {
        // No backend / no API key / request failed \u2014 fall back to the local templates.
        if (!cancelled) setPosts(localPosts);
      })
      .finally(() => {
        if (!cancelled) setIsGenerating(false);
      });
    return () => {
      cancelled = true;
    };
    // Only regenerate when the underlying debrief changes, not on every localPosts recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalTitle, milestone, summary, lastDebrief?.taskTitle]);

  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleShareAndFinish = () => {
    publishPost({
      goalTitle,
      twitter: posts.twitter,
      linkedin: posts.linkedin,
      instagram: posts.instagram,
      medium: posts.medium,
      cardHeadline: posts.cardHeadline,
      cardSubline: posts.cardSubline,
    });
    navigate('/app');
  };

  const handleSkip = () => {
    skipSharing();
    navigate('/app');
  };

  return (
    <FocusedScreen maxWidth={560}>
      <Background />
      <GlassCard>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display font-semibold text-[22px]" style={{ color: 'var(--text)' }}>Build in public</h2>
          {isGenerating && (
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-faint)' }}>
              <Loader2 size={12} className="animate-spin" /> Drafting with Gemma&hellip;
            </span>
          )}
        </div>
        <p className="text-[13px] mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>
          Today&rsquo;s task is already marked done &mdash; sharing it is optional. Turn it into proof, or skip straight back to your dashboard.
        </p>

        <div className="flex flex-col gap-5">
          <PostBlock label="Twitter / X" text={posts.twitter} copied={copied === 'Twitter'} onCopy={() => copy(posts.twitter, 'Twitter')} />
          <PostBlock label="LinkedIn" text={posts.linkedin} copied={copied === 'LinkedIn'} onCopy={() => copy(posts.linkedin, 'LinkedIn')} />
          <PostBlock label="Instagram" text={posts.instagram} copied={copied === 'Instagram'} onCopy={() => copy(posts.instagram, 'Instagram')} />
          <PostBlock label="Medium (opening)" text={posts.medium} copied={copied === 'Medium'} onCopy={() => copy(posts.medium, 'Medium')} />

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
              <button
                onClick={() => downloadCard({ headline: posts.cardHeadline, subline: posts.cardSubline, filename: `shift-day-${day}.png` })}
                className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5"
              >
                <Download size={13} /> Download
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-7 flex-wrap">
          <button onClick={handleShareAndFinish} className="btn btn-primary flex-1 min-w-[180px] justify-center">Share &amp; finish</button>
          <button onClick={handleSkip} className="btn btn-ghost flex-1 min-w-[140px] justify-center">Skip sharing</button>
        </div>
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
