import { ExternalLink, Github, Link2, MessageSquareText } from 'lucide-react';
import { GlassCard } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function linkIcon(link: string) {
  if (link.includes('github.com')) return Github;
  return Link2;
}

export default function Activity() {
  const activityLog = useAppStore((s) => s.activityLog);

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--text)' }}>Activity</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Every debrief, reflection, and link you&rsquo;ve logged &mdash; your long-term consistency record.
        </p>
      </div>

      {activityLog.length === 0 ? (
        <GlassCard className="text-center py-14">
          <MessageSquareText size={22} className="mx-auto mb-3" color="var(--text-faint)" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No sessions yet. Finish a focus session and debrief to start your history.
          </p>
        </GlassCard>
      ) : (
        <div className="relative pl-7">
          <div className="absolute left-[10px] top-2 bottom-2 w-px" style={{ background: 'var(--line)' }} />
          <div className="flex flex-col gap-4">
            {activityLog.map((a) => {
              const LinkIcon = a.link ? linkIcon(a.link) : Link2;
              return (
                <div key={a.id} className="relative">
                  <div
                    className="absolute -left-7 top-4 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--ink)', border: '1.5px solid var(--violet)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--violet)' }} />
                  </div>

                  <GlassCard className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                      <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(a.date)} &middot; {a.focusMinutes > 0 ? `${a.focusMinutes} min focused` : 'Logged manually'}
                      </span>
                    </div>
                    <p className="font-display font-semibold text-[15px] mb-1.5" style={{ color: 'var(--text)' }}>{a.taskTitle}</p>
                    <p className="text-[13px] leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>{a.rawText}</p>
                    <p
                      className="text-[13px] leading-relaxed rounded-xl px-3.5 py-2.5 mb-2"
                      style={{ background: 'rgba(131,53,253,0.08)', color: 'var(--text)' }}
                    >
                      {a.aiSummary}
                    </p>
                    {a.link && (
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] mt-1"
                        style={{ color: 'var(--violet)' }}
                      >
                        <LinkIcon size={13} /> {a.link} <ExternalLink size={11} />
                      </a>
                    )}
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
