import type { ReactNode } from 'react';
import { useState } from 'react';
import { BarChart3, Check, Copy, Download, Figma, Github, Loader2, Plug, RefreshCcw, Share2, Slack, Sparkles, Trello } from 'lucide-react';
import { GlassCard } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';
import type { BuildInPublicPost, Connections } from '../../stores/useAppStore';
import { downloadCard } from '../../lib/downloadCard';
import { generateBuildInPublicContent } from '../../lib/aiApi';

const DAY_MS = 86_400_000;

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

type Tab = 'posts' | 'analytics';

const CONNECT_APPS: { key: keyof Connections; label: string; blurb: string; icon: ReactNode }[] = [
  { key: 'github', label: 'GitHub', blurb: 'Turn merged PRs and commits into posts', icon: <Github size={17} /> },
  { key: 'figma', label: 'Figma', blurb: 'Turn new frames and file updates into posts', icon: <Figma size={17} /> },
  { key: 'slack', label: 'Slack', blurb: 'Pull shipped updates from your team channel', icon: <Slack size={17} /> },
  { key: 'trello', label: 'Trello', blurb: 'Turn cards moved to Done into posts', icon: <Trello size={17} /> },
];

export default function BuildInPublic() {
  const posts = useAppStore((s) => s.buildInPublicPosts);
  const [tab, setTab] = useState<Tab>('posts');

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--text)' }}>Build in Public</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Every post Shift has generated from your work, and how consistently you&rsquo;re actually showing up.
        </p>
      </div>

      <ConnectApps />

      <div className="flex items-center gap-1.5 p-1 rounded-xl w-fit" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
        <TabButton active={tab === 'posts'} onClick={() => setTab('posts')} icon={<Share2 size={13} />} label="Posts" />
        <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')} icon={<BarChart3 size={13} />} label="Analytics" />
      </div>

      {tab === 'posts' ? <PostsTab posts={posts} /> : <AnalyticsTab />}
    </div>
  );
}

function ConnectApps() {
  const connections = useAppStore((s) => s.connections);
  const toggleConnection = useAppStore((s) => s.toggleConnection);

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-1">
        <Plug size={14} color="var(--text-faint)" />
        <span className="font-mono text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Connect your tools
        </span>
      </div>
      <p className="text-[12.5px] mb-4" style={{ color: 'var(--text-faint)' }}>
        Hook up where your work happens so Shift can draft posts from it automatically.{' '}
        <span style={{ color: 'var(--text-faint)' }}>Demo only &mdash; nothing actually syncs yet.</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CONNECT_APPS.map((app) => {
          const connected = connections[app.key];
          return (
            <div
              key={app.key}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3"
              style={{ background: 'var(--glass-strong)', border: '1px solid var(--glass-border)' }}
            >
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{ width: 34, height: 34, background: 'var(--glass)', color: 'var(--text)' }}
              >
                {app.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{app.label}</div>
                <div className="text-[11px] truncate" style={{ color: 'var(--text-faint)' }}>{app.blurb}</div>
              </div>
              <button
                onClick={() => toggleConnection(app.key)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                style={
                  connected
                    ? { background: 'rgba(52, 211, 153, 0.12)', color: '#34d399' }
                    : { background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }
                }
              >
                {connected ? (
                  <>
                    <Check size={12} /> Connected
                  </>
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] transition-colors"
      style={active ? { background: 'var(--glass-strong)', color: 'var(--text)' } : { color: 'var(--text-muted)' }}
    >
      {icon} {label}
    </button>
  );
}

function PostsTab({ posts }: { posts: BuildInPublicPost[] }) {
  const activeGoal = useAppStore((s) => s.activeGoal());
  const publishPost = useAppStore((s) => s.publishPost);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateFromRoadmap() {
    if (!activeGoal) return;
    setIsGenerating(true);
    setError(null);
    const currentMilestone = activeGoal.roadmap.milestones.find((m) => m.status === 'current');
    const nextTask = currentMilestone?.tasks.find((t) => !t.done);
    try {
      const ai = await generateBuildInPublicContent({
        goalTitle: activeGoal.title,
        milestoneTitle: currentMilestone?.title,
        taskTitle: nextTask?.title,
        summary: nextTask ? `Working toward "${nextTask.title}" next.` : 'Reviewing overall roadmap progress.',
        roadmapMilestones: activeGoal.roadmap.milestones.map((m) => m.title),
      });
      publishPost({ goalTitle: activeGoal.title, ...ai });
    } catch {
      setError('Could not reach Gemma \u2014 check the server is running and GEMMA_API_KEY is set.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {activeGoal && (
        <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl p-4" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
          <div className="min-w-0">
            <div className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>Generate from your roadmap</div>
            <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Drafts a fresh post for {activeGoal.title} without waiting for a debrief.
            </div>
          </div>
          <button onClick={handleGenerateFromRoadmap} disabled={isGenerating} className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5 shrink-0">
            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {isGenerating ? 'Generating\u2026' : 'Generate post'}
          </button>
        </div>
      )}
      {error && (
        <p className="text-[11.5px] px-1" style={{ color: 'var(--danger)' }}>{error}</p>
      )}

      {posts.length === 0 ? (
        <GlassCard className="text-center py-14">
          <Share2 size={22} className="mx-auto mb-3" color="var(--text-faint)" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Finish today&rsquo;s task, or generate a post from your roadmap above, to get started.
          </p>
        </GlassCard>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}

function AnalyticsTab() {
  const goals = useAppStore((s) => s.goals);
  const activeGoal = useAppStore((s) => s.activeGoal());
  const activityLog = useAppStore((s) => s.activityLog);
  const streak = useAppStore((s) => s.streak());
  const longestStreak = useAppStore((s) => s.longestStreak);
  const totalFocusMinutes = useAppStore((s) => s.totalFocusMinutes);

  const tasksCompleted = activityLog.length;
  const milestonesCompleted = goals.reduce(
    (sum, g) => sum + g.roadmap.milestones.filter((m) => m.status === 'done').length,
    0
  );

  const allTasks = activeGoal?.roadmap.milestones.flatMap((m) => m.tasks) ?? [];
  const goalCompletion = allTasks.length
    ? Math.round((allTasks.filter((t) => t.done).length / allTasks.length) * 100)
    : 0;

  const today = startOfDay(Date.now());
  const activeDays = new Set(activityLog.map((a) => startOfDay(a.date)));

  const last7 = Array.from({ length: 7 }, (_, i) => today - (6 - i) * DAY_MS);
  const weeklyConsistency = Math.round((last7.filter((d) => activeDays.has(d)).length / 7) * 100);

  const last28 = Array.from({ length: 28 }, (_, i) => today - (27 - i) * DAY_MS);
  const monthlyConsistency = Math.round((last28.filter((d) => activeDays.has(d)).length / 28) * 100);

  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;
  const focusTimeLabel = totalFocusMinutes === 0 ? '0m' : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Current streak" value={`${streak}d`} />
        <StatTile label="Longest streak" value={`${longestStreak}d`} />
        <StatTile label="Total focus time" value={focusTimeLabel} />
        <StatTile label="Tasks completed" value={String(tasksCompleted)} />
        <StatTile label="Milestones done" value={String(milestonesCompleted)} />
        <StatTile label="Goal completion" value={`${goalCompletion}%`} />
        <StatTile label="This week" value={`${weeklyConsistency}%`} />
        <StatTile label="This month" value={`${monthlyConsistency}%`} />
      </div>

      <GlassCard>
        <span className="font-mono text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Last 28 days
        </span>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-4 max-w-[420px] mx-auto sm:mx-0">
          {last28.map((d) => (
            <div
              key={d}
              title={new Date(d).toLocaleDateString()}
              className="aspect-square rounded-[4px] min-w-[18px]"
              style={{
                background: activeDays.has(d) ? 'var(--violet)' : 'var(--line)',
                opacity: activeDays.has(d) ? 1 : 0.5,
              }}
            />
          ))}
        </div>
        <p className="text-[12px] mt-4" style={{ color: 'var(--text-faint)' }}>
          {tasksCompleted === 0
            ? 'Complete a task to start filling this in.'
            : `Active on ${last28.filter((d) => activeDays.has(d)).length} of the last 28 days.`}
        </p>
      </GlassCard>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
      <div className="font-display font-semibold text-xl" style={{ color: 'var(--text)' }}>{value}</div>
      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function PostCard({ post }: { post: BuildInPublicPost }) {
  const updatePost = useAppStore((s) => s.updatePost);
  const regeneratePost = useAppStore((s) => s.regeneratePost);

  const [editing, setEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [twitter, setTwitter] = useState(post.twitter);
  const [linkedin, setLinkedin] = useState(post.linkedin);
  const [instagram, setInstagram] = useState(post.instagram);
  const [medium, setMedium] = useState(post.medium);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  const save = () => {
    updatePost(post.id, { twitter, linkedin, instagram, medium });
    setEditing(false);
  };

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      const ai = await generateBuildInPublicContent({
        goalTitle: post.goalTitle,
        summary: `Previously shared: "${post.twitter}"`,
      });
      updatePost(post.id, ai);
      setTwitter(ai.twitter);
      setLinkedin(ai.linkedin);
      setInstagram(ai.instagram);
      setMedium(ai.medium);
    } catch {
      // No backend / no key / offline \u2014 fall back to the local template shuffle.
      regeneratePost(post.id);
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {formatDate(post.date)} &middot; {post.goalTitle}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={handleRegenerate} disabled={isRegenerating} className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5">
            {isRegenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} Regenerate
          </button>
          <button
            onClick={() => (editing ? save() : setEditing(true))}
            className="btn btn-ghost text-xs py-1.5 px-3"
          >
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <PostField
          label="Twitter / X"
          value={editing ? twitter : post.twitter}
          editing={editing}
          onChange={setTwitter}
          copied={copied === 'twitter'}
          onCopy={() => copy(post.twitter, 'twitter')}
        />
        <PostField
          label="LinkedIn"
          value={editing ? linkedin : post.linkedin}
          editing={editing}
          onChange={setLinkedin}
          copied={copied === 'linkedin'}
          onCopy={() => copy(post.linkedin, 'linkedin')}
        />
        <PostField
          label="Instagram"
          value={editing ? instagram : post.instagram}
          editing={editing}
          onChange={setInstagram}
          copied={copied === 'instagram'}
          onCopy={() => copy(post.instagram, 'instagram')}
        />
        <PostField
          label="Medium (opening)"
          value={editing ? medium : post.medium}
          editing={editing}
          onChange={setMedium}
          copied={copied === 'medium'}
          onCopy={() => copy(post.medium, 'medium')}
        />

        <div className="rounded-2xl p-4" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--ink)', border: '1px solid var(--line)' }}>
            <div className="font-display font-semibold text-lg" style={{ color: 'var(--text)' }}>{post.cardHeadline}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{post.cardSubline}</div>
            <div className="mt-3 pt-2.5 font-mono text-[10px]" style={{ color: 'var(--violet)', borderTop: '1px solid var(--line)' }}>
              Built with Shift
            </div>
          </div>
          <button
            onClick={() => downloadCard({ headline: post.cardHeadline, subline: post.cardSubline, filename: `shift-${formatDate(post.date).replace(/\s/g, '-')}.png` })}
            className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5 mt-3"
          >
            <Download size={13} /> Download card
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function PostField({
  label,
  value,
  editing,
  onChange,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
      <div className="font-mono text-[10px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-y mb-3"
          style={{ background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--text)' }}
        />
      ) : (
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>{value}</p>
      )}
      {!editing && (
        <button onClick={onCopy} className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5">
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
        </button>
      )}
    </div>
  );
}
