import { useState } from 'react';
import { Check, Copy, Download, RefreshCcw, Share2 } from 'lucide-react';
import { GlassCard } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';
import type { BuildInPublicPost } from '../../stores/useAppStore';
import { downloadCard } from '../../lib/downloadCard';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function BuildInPublic() {
  const posts = useAppStore((s) => s.buildInPublicPosts);

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--text)' }}>Build in Public</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Every post Shift has generated from your work. Edit, regenerate, or copy before sharing.
        </p>
      </div>

      {posts.length === 0 ? (
        <GlassCard className="text-center py-14">
          <Share2 size={22} className="mx-auto mb-3" color="var(--text-faint)" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Finish today&rsquo;s task to generate your first post.
          </p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-5">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: BuildInPublicPost }) {
  const updatePost = useAppStore((s) => s.updatePost);
  const regeneratePost = useAppStore((s) => s.regeneratePost);

  const [editing, setEditing] = useState(false);
  const [twitter, setTwitter] = useState(post.twitter);
  const [linkedin, setLinkedin] = useState(post.linkedin);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  const save = () => {
    updatePost(post.id, { twitter, linkedin });
    setEditing(false);
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {formatDate(post.date)} &middot; {post.goalTitle}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => regeneratePost(post.id)} className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5">
            <RefreshCcw size={12} /> Regenerate
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
