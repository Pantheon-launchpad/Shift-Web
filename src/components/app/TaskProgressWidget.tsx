import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ListChecks } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import FloatingWindow from './FloatingWindow';

/**
 * The task-progress content only \u2014 window chrome lives in FloatingWindow.
 * Reads directly from the store (today's roadmap task + daily tasks) so
 * it's always in sync with whatever completed a task, anywhere in the app.
 */
export default function TaskProgressWidget() {
  const enabled = useAppStore((s) => s.taskProgressWidgetEnabled);
  const currentMilestone = useAppStore((s) => s.currentMilestone());
  const todayTaskId = useAppStore((s) => s.todayTaskId());
  const dailyTasks = useAppStore((s) => s.dailyTasks);
  const toggleDailyTask = useAppStore((s) => s.toggleDailyTask);
  const toggleWidget = useAppStore((s) => s.toggleTaskProgressWidget);
  const navigate = useNavigate();

  const todayTask = currentMilestone?.tasks.find((t) => t.id === todayTaskId) ?? null;

  const items = useMemo(() => {
    const roadmapItem = todayTask
      ? [{ id: `roadmap-${todayTask.id}`, title: todayTask.title, done: false, isRoadmap: true }]
      : [];
    const custom = [...dailyTasks].sort((a, b) => a.order - b.order).map((t) => ({ id: t.id, title: t.title, done: t.done, isRoadmap: false }));
    return [...roadmapItem, ...custom];
  }, [todayTask, dailyTasks]);

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const current = items.find((i) => !i.done);
  const ringColor = progress >= 100 ? 'var(--gold)' : 'var(--info)';
  const r = 12;
  const circumference = 2 * Math.PI * r;

  if (!enabled || total === 0) return null;

  const defaultRect = {
    x: Math.max(24, 24),
    y: Math.max(24, window.innerHeight - 400),
    width: 288,
    height: 320,
  };

  return (
    <FloatingWindow
      id="progress-window"
      isOpen
      onClose={toggleWidget}
      title="Today's Progress"
      accentColor={ringColor}
      defaultRect={defaultRect}
      minimizedWidth={240}
      minWidth={240}
      minHeight={200}
      maxWidth={420}
      maxHeight={520}
      headerAccessory={<span className="font-mono text-[10px] mr-1" style={{ color: 'var(--text-faint)' }}>{completed}/{total}</span>}
      minimizedContent={
        <button onClick={() => navigate('/app')} className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left">
          <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
            <svg width={28} height={28} className="-rotate-90">
              <circle cx={14} cy={14} r={r} fill="none" stroke="var(--line)" strokeWidth={2.5} />
              <circle
                cx={14}
                cy={14}
                r={r}
                fill="none"
                stroke={ringColor}
                strokeWidth={2.5}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
            {progress >= 100 && <Check size={11} color="var(--gold)" className="absolute" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] truncate" style={{ color: 'var(--text)' }}>{current?.title ?? 'All done'}</p>
            <p className="font-mono text-[9.5px]" style={{ color: 'var(--text-faint)' }}>{completed}/{total}</p>
          </div>
        </button>
      }
    >
      <div className="px-3.5 py-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
            <svg width={44} height={44} className="-rotate-90">
              <circle cx={22} cy={22} r={18} fill="none" stroke="var(--line)" strokeWidth={3.5} />
              <circle
                cx={22}
                cy={22}
                r={18}
                fill="none"
                stroke={ringColor}
                strokeWidth={3.5}
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={2 * Math.PI * 18 * (1 - progress / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
            <span className="absolute font-mono text-[10px]" style={{ color: 'var(--text)' }}>{progress}%</span>
          </div>
          <div className="min-w-0 flex-1">
            <ListChecks size={12} color="var(--info)" className="mb-1" />
            <p className="font-mono text-[10px]" style={{ color: 'var(--text-faint)' }}>{completed} of {total} done</p>
            {current && (
              <button onClick={() => navigate('/app')} className="text-[12px] text-left leading-snug hover:underline block truncate w-full" style={{ color: 'var(--text)' }}>
                {current.title}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.isRoadmap) navigate('/app');
                else toggleDailyTask(item.id);
              }}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors"
              style={{ opacity: item.done ? 0.55 : 1 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--glass)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: item.done ? 'var(--success)' : 'transparent', border: item.done ? 'none' : '1.5px solid var(--line-strong)' }}
              >
                {item.done && <Check size={9} color="var(--ink)" />}
              </span>
              <span className="text-[11.5px] truncate" style={{ color: 'var(--text-muted)', textDecoration: item.done ? 'line-through' : 'none' }}>
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </FloatingWindow>
  );
}
