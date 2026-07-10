import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Lock, Plus, Trash2, Unlock, X } from 'lucide-react';
import type { Goal } from '../../stores/useAppStore';
import type { Journey, JourneyNode, NodePriority, NodeStatus } from '../../lib/journey';
import { branchProgress } from '../../lib/journey';
import { TYPE_ICON, FALLBACK_ICON, TYPE_LABEL, STATUS_LABEL, STATUS_COLOR, PRIORITY_LABEL } from './journeyNodeVisuals';

const STATUSES: NodeStatus[] = ['todo', 'in-progress', 'done', 'blocked'];
const PRIORITIES: NodePriority[] = ['low', 'medium', 'high'];

export default function JourneyInspector({
  node,
  journey,
  goal,
  onClose,
  onUpdateNode,
  onDelete,
  onDuplicate,
}: {
  node: JourneyNode;
  journey: Journey;
  goal: Goal;
  onClose: () => void;
  onUpdateNode: (patch: Partial<JourneyNode>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [labelDraft, setLabelDraft] = useState(node.label);
  const [tagDraft, setTagDraft] = useState('');
  const [linkDraft, setLinkDraft] = useState('');

  const Icon = TYPE_ICON[node.type] ?? FALLBACK_ICON;
  const progress = branchProgress(journey, node.id);
  const milestone = node.milestoneId ? goal.roadmap.milestones.find((m) => m.id === node.milestoneId) : null;

  const commitRename = () => {
    if (labelDraft.trim()) onUpdateNode({ label: labelDraft.trim() });
    setRenaming(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-4 right-4 z-30 w-[300px] max-h-[calc(100%-32px)] overflow-y-auto rounded-2xl p-5 glass-strong"
      style={{ boxShadow: 'var(--shadow-lift)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <Icon size={12} color="var(--text-faint)" />
          <span className="font-mono text-[9.5px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{TYPE_LABEL[node.type]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onUpdateNode({ locked: !node.locked })} aria-label={node.locked ? 'Unlock' : 'Lock'} style={{ color: 'var(--text-faint)' }}>
            {node.locked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
          <button onClick={onClose} aria-label="Close" style={{ color: 'var(--text-faint)' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {renaming ? (
        <input
          autoFocus
          value={labelDraft}
          onChange={(e) => setLabelDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => e.key === 'Enter' && commitRename()}
          className="w-full rounded-lg px-2.5 py-1.5 text-[16px] font-display font-semibold outline-none mb-3"
          style={{ background: 'var(--glass)', border: '1px solid var(--violet)', color: 'var(--text)' }}
        />
      ) : (
        <h3
          onDoubleClick={() => setRenaming(true)}
          className="font-display font-semibold text-[16px] leading-snug mb-3 cursor-text"
          style={{ color: 'var(--text)' }}
          title="Double-click to rename"
        >
          {node.label}
        </h3>
      )}

      {progress != null && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: progress >= 100 ? 'var(--gold)' : 'var(--violet)' }} />
          </div>
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{progress}%</span>
        </div>
      )}

      <Field label="Status">
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => onUpdateNode({ status: s })}
              className="px-2.5 py-1 rounded-lg text-[11px] transition-colors"
              style={
                node.status === s
                  ? { background: STATUS_COLOR[s], color: s === 'todo' ? 'var(--ink)' : 'white' }
                  : { background: 'var(--glass)', color: 'var(--text-muted)' }
              }
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Priority">
        <div className="flex gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => onUpdateNode({ priority: p })}
              className="flex-1 px-2 py-1 rounded-lg text-[11px] transition-colors"
              style={node.priority === p ? { background: 'var(--glass-strong)', color: 'var(--text)', border: '1px solid var(--violet)' } : { background: 'var(--glass)', color: 'var(--text-muted)', border: '1px solid transparent' }}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
      </Field>

      {milestone && (
        <Field label="Tasks">
          <div className="flex flex-col gap-1">
            {milestone.tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: t.done ? 'var(--text-faint)' : 'var(--text-muted)', textDecoration: t.done ? 'line-through' : 'none' }}>
                {t.done ? <Check size={10} color="var(--gold)" /> : <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ border: '1.5px solid var(--line-strong)' }} />}
                {t.title}
              </div>
            ))}
          </div>
        </Field>
      )}

      <Field label="Description">
        <textarea
          value={node.description}
          onChange={(e) => onUpdateNode({ description: e.target.value })}
          rows={2}
          placeholder="What is this?"
          className="w-full rounded-lg px-2.5 py-2 text-[12px] outline-none resize-none"
          style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
        />
      </Field>

      <Field label="Notes">
        <textarea
          value={node.notes}
          onChange={(e) => onUpdateNode({ notes: e.target.value })}
          rows={3}
          placeholder="Add a note&hellip;"
          className="w-full rounded-lg px-2.5 py-2 text-[12px] outline-none resize-none"
          style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
        />
      </Field>

      <Field label="Tags">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {node.tags.map((tag) => (
            <span key={tag} className="pill px-2 py-0.5 text-[10.5px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              {tag}
              <button onClick={() => onUpdateNode({ tags: node.tags.filter((t) => t !== tag) })} aria-label={`Remove ${tag}`}>
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!tagDraft.trim()) return;
            onUpdateNode({ tags: [...node.tags, tagDraft.trim()] });
            setTagDraft('');
          }}
          className="flex gap-1.5"
        >
          <input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            placeholder="Add tag"
            className="flex-1 rounded-lg px-2.5 py-1.5 text-[11.5px] outline-none"
            style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
          />
          <button type="submit" className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}>
            <Plus size={12} />
          </button>
        </form>
      </Field>

      <Field label="Links">
        <div className="flex flex-col gap-1 mb-2">
          {node.links.map((link) => (
            <div key={link} className="flex items-center gap-1.5">
              <a href={link} target="_blank" rel="noreferrer" className="text-[11px] truncate flex-1" style={{ color: 'var(--violet)' }}>{link}</a>
              <button onClick={() => onUpdateNode({ links: node.links.filter((l) => l !== link) })} aria-label="Remove link" style={{ color: 'var(--text-faint)' }}>
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!linkDraft.trim()) return;
            onUpdateNode({ links: [...node.links, linkDraft.trim()] });
            setLinkDraft('');
          }}
          className="flex gap-1.5"
        >
          <input
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            placeholder="https://&hellip;"
            className="flex-1 rounded-lg px-2.5 py-1.5 text-[11.5px] outline-none"
            style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
          />
          <button type="submit" className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}>
            <Plus size={12} />
          </button>
        </form>
      </Field>

      <Field label="Due date">
        <input
          type="date"
          value={node.dueDate ?? ''}
          onChange={(e) => onUpdateNode({ dueDate: e.target.value || null })}
          className="w-full rounded-lg px-2.5 py-1.5 text-[12px] outline-none"
          style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
        />
      </Field>

      <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
        <button onClick={onDuplicate} className="flex-1 h-8 rounded-lg text-[11.5px] flex items-center justify-center gap-1.5" style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}>
          <Copy size={12} /> Duplicate
        </button>
        <button onClick={onDelete} className="flex-1 h-8 rounded-lg text-[11.5px] flex items-center justify-center gap-1.5" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[9.5px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-faint)' }}>{label}</div>
      {children}
    </div>
  );
}
