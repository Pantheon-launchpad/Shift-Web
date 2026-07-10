import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Check, Lock } from 'lucide-react';
import { TYPE_ICON, FALLBACK_ICON, ACCENT_COLOR, STATUS_COLOR } from './journeyNodeVisuals';
import type { JourneyNodeType, NodeStatus, NodePriority, NodeAccent } from '../../lib/journey';

export interface JourneyNodeCardData extends Record<string, unknown> {
  label: string;
  description: string;
  type: JourneyNodeType;
  status: NodeStatus;
  priority: NodePriority;
  accent: NodeAccent;
  locked: boolean;
  dimmed: boolean;
  emphasized: boolean;
  progress: number | null;
  isVision: boolean;
}

const handleStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  background: 'var(--ink-2)',
  border: '1.5px solid var(--line-strong)',
};

function JourneyNodeCardImpl({ data, selected }: NodeProps) {
  const d = data as JourneyNodeCardData;
  const Icon = TYPE_ICON[d.type] ?? FALLBACK_ICON;
  const accentColor = ACCENT_COLOR[d.accent] ?? ACCENT_COLOR.neutral;

  return (
    <div
      className="rounded-2xl transition-all"
      style={{
        width: d.isVision ? 240 : 208,
        padding: d.isVision ? '18px 20px' : '13px 15px',
        background: d.isVision ? 'var(--glass-strong)' : 'var(--glass)',
        border: `1.5px solid ${selected ? 'var(--violet)' : 'var(--glass-border)'}`,
        boxShadow: d.isVision ? 'var(--shadow-lift)' : selected ? '0 0 0 3px rgba(131,53,253,0.14)' : 'var(--shadow-soft)',
        opacity: d.dimmed ? 0.32 : 1,
        outline: d.emphasized ? '1.5px solid var(--violet)' : 'none',
        outlineOffset: 2,
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      {(['top', 'right', 'bottom', 'left'] as const).map((pos) => {
        const position = pos === 'top' ? Position.Top : pos === 'right' ? Position.Right : pos === 'bottom' ? Position.Bottom : Position.Left;
        return (
          <div key={pos}>
            <Handle id={pos} type="source" position={position} style={handleStyle} />
            <Handle id={pos} type="target" position={position} style={handleStyle} />
          </div>
        );
      })}

      <div className="flex items-start gap-2">
        <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--glass-strong)' }}>
          <Icon size={12} color={accentColor} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={d.isVision ? 'font-display font-semibold text-[14.5px]' : 'text-[13px] font-medium'} style={{ color: 'var(--text)' }}>
              {d.label}
            </span>
            {d.locked && <Lock size={10} color="var(--text-faint)" className="shrink-0" />}
          </div>
          {d.description && (
            <p className="text-[10.5px] leading-snug mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
              {d.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2.5">
        {d.status === 'done' ? (
          <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--gold)' }}>
            <Check size={10} /> Done
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: STATUS_COLOR[d.status] }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[d.status] }} />
            {d.status === 'in-progress' ? 'In progress' : d.status === 'blocked' ? 'Blocked' : 'To do'}
          </span>
        )}
        {d.priority === 'high' && (
          <span className="pill px-1.5 py-0 text-[9.5px]" style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>High</span>
        )}
        {d.progress != null && (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-10 h-1 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
              <div className="h-full rounded-full" style={{ width: `${d.progress}%`, background: d.progress >= 100 ? 'var(--gold)' : 'var(--violet)' }} />
            </div>
            <span className="font-mono text-[9px]" style={{ color: 'var(--text-faint)' }}>{d.progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(JourneyNodeCardImpl);
