import { useState } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { Check, Flag, Play, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import type { Task, TaskPriority, DailyTask } from '../../stores/useAppStore';

const PRIORITY_COLOR: Record<TaskPriority, string> = { low: 'var(--text-faint)', medium: 'var(--warning)', high: 'var(--danger)' };
const PRIORITY_NEXT: Record<TaskPriority, TaskPriority> = { low: 'medium', medium: 'high', high: 'low' };

export default function DailyTodoList({ todayTask, goalId }: { todayTask: Task | null; goalId: string }) {
  const dailyTasks = useAppStore((s) => s.dailyTasks);
  const addDailyTask = useAppStore((s) => s.addDailyTask);
  const updateDailyTask = useAppStore((s) => s.updateDailyTask);
  const deleteDailyTask = useAppStore((s) => s.deleteDailyTask);
  const toggleDailyTask = useAppStore((s) => s.toggleDailyTask);
  const reorderDailyTasks = useAppStore((s) => s.reorderDailyTasks);
  const openFocusWidget = useAppStore((s) => s.openFocusWidget);
  const logProgressFromChat = useAppStore((s) => s.logProgressFromChat);

  const [input, setInput] = useState('');
  const aiTasks = dailyTasks.filter((t) => t.source === 'ai').sort((a, b) => a.order - b.order);
  const manualTasks = dailyTasks.filter((t) => t.source !== 'ai').sort((a, b) => a.order - b.order);
  const doneCount = dailyTasks.filter((t) => t.done).length;
  const totalCount = dailyTasks.length + (todayTask ? 1 : 0);

  function handleAdd() {
    if (!input.trim()) return;
    addDailyTask(input.trim());
    setInput('');
  }

  function completeRoadmapTask() {
    if (!todayTask) return;
    logProgressFromChat(goalId, {
      taskTitle: todayTask.title,
      rawText: 'Marked done from the Daily To-Do list.',
      aiSummary: `Marked "${todayTask.title}" done and advanced the roadmap.`,
    });
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-soft)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Daily To-Do</h3>
        <span className="font-mono text-[10.5px]" style={{ color: 'var(--text-faint)' }}>
          {doneCount}/{totalCount} done
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {todayTask && (
          <div
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 card-hover"
            style={{ background: 'rgba(131,53,253,0.08)', border: '1px solid rgba(131,53,253,0.2)' }}
          >
            <button
              onClick={completeRoadmapTask}
              aria-label="Complete roadmap task"
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ border: '1.5px solid var(--violet)' }}
            />
            <span className="text-[13px] flex-1 truncate" style={{ color: 'var(--text)' }}>{todayTask.title}</span>
            <span className="pill px-1.5 py-0 text-[9.5px]" style={{ color: 'var(--violet)', borderColor: 'rgba(131,53,253,0.35)' }}>Roadmap</span>
            <button
              onClick={() => openFocusWidget({ id: todayTask.id, title: todayTask.title, isDailyTask: false })}
              aria-label="Focus on this task"
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ color: 'var(--violet)' }}
            >
              <Play size={11} />
            </button>
          </div>
        )}

        {aiTasks.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 px-0.5" style={{ color: 'var(--gold)' }}>
              <Sparkles size={11} />
              <span className="font-mono text-[10px] uppercase tracking-wide">Suggested by Plan</span>
            </div>
            <TaskGroup
              tasks={aiTasks}
              onReorder={(next) => reorderDailyTasks(next.map((t) => t.id))}
              onToggle={toggleDailyTask}
              onCyclePriority={(id, next) => updateDailyTask(id, { priority: next })}
              onFocus={(t) => openFocusWidget({ id: t.id, title: t.title, isDailyTask: true })}
              onDelete={deleteDailyTask}
            />
          </div>
        )}

        {(manualTasks.length > 0 || aiTasks.length === 0) && (
          <div className="flex flex-col gap-1.5">
            {aiTasks.length > 0 && (
              <div className="px-0.5">
                <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Your tasks</span>
              </div>
            )}
            <TaskGroup
              tasks={manualTasks}
              onReorder={(next) => reorderDailyTasks(next.map((t) => t.id))}
              onToggle={toggleDailyTask}
              onCyclePriority={(id, next) => updateDailyTask(id, { priority: next })}
              onFocus={(t) => openFocusWidget({ id: t.id, title: t.title, isDailyTask: true })}
              onDelete={deleteDailyTask}
            />
            {manualTasks.length === 0 && aiTasks.length === 0 && !todayTask && (
              <p className="text-[12.5px] py-3 text-center" style={{ color: 'var(--text-faint)' }}>Nothing on the list yet.</p>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className="flex gap-2 mt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task&hellip;"
          className="flex-1 h-9 rounded-lg px-3 text-[12.5px] outline-none"
          style={{ background: 'var(--glass-strong)', border: '1px solid var(--line)', color: 'var(--text)' }}
        />
        <motion.button whileTap={{ scale: 0.94 }} type="submit" className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--violet)', color: 'white' }}>
          <Plus size={14} />
        </motion.button>
      </form>
    </div>
  );
}

function TaskGroup({
  tasks,
  onReorder,
  onToggle,
  onCyclePriority,
  onFocus,
  onDelete,
}: {
  tasks: DailyTask[];
  onReorder: (next: DailyTask[]) => void;
  onToggle: (id: string) => void;
  onCyclePriority: (id: string, next: TaskPriority) => void;
  onFocus: (t: DailyTask) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Reorder.Group axis="y" values={tasks} onReorder={onReorder} className="flex flex-col gap-1.5">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <Reorder.Item
            key={task.id}
            value={task}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-grab active:cursor-grabbing"
            style={{ background: 'var(--glass-strong)', opacity: task.done ? 0.6 : 1 }}
          >
            <button
              onClick={() => onToggle(task.id)}
              aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: task.done ? 'var(--success)' : 'transparent', border: task.done ? 'none' : '1.5px solid var(--line-strong)' }}
            >
              {task.done && <Check size={11} color="var(--ink)" />}
            </button>
            <span className="text-[13px] flex-1 truncate" style={{ color: 'var(--text)', textDecoration: task.done ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            <button
              onClick={() => onCyclePriority(task.id, PRIORITY_NEXT[task.priority])}
              aria-label={`Priority: ${task.priority}`}
              title={`Priority: ${task.priority} \u2014 click to change`}
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ color: PRIORITY_COLOR[task.priority] }}
            >
              <Flag size={11} fill={task.priority !== 'low' ? PRIORITY_COLOR[task.priority] : 'none'} />
            </button>
            {!task.done && (
              <button
                onClick={() => onFocus(task)}
                aria-label="Focus on this task"
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ color: 'var(--text-faint)' }}
              >
                <Play size={11} />
              </button>
            )}
            <button onClick={() => onDelete(task.id)} aria-label="Delete task" className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ color: 'var(--text-faint)' }}>
              <Trash2 size={11} />
            </button>
          </Reorder.Item>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
}
