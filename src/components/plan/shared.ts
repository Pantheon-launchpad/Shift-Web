import type { Goal, Milestone, Task } from '../../stores/useAppStore';

export function findTask(goal: Goal, taskId: string): { task: Task; milestone: Milestone } | null {
  for (const milestone of goal.roadmap.milestones) {
    const task = milestone.tasks.find((t) => t.id === taskId);
    if (task) return { task, milestone };
  }
  return null;
}

export function goalProgress(goal: Goal): number {
  const total = goal.roadmap.milestones.reduce((n, m) => n + m.tasks.length, 0);
  const done = goal.roadmap.milestones.reduce((n, m) => n + m.tasks.filter((t) => t.done).length, 0);
  return total ? Math.round((done / total) * 100) : 0;
}

export interface Attachment {
  id: string;
  kind: 'image' | 'document' | 'voice';
  name: string;
  size?: number;
  /** Object URL for images/voice so a small preview can render; revoked on removal. */
  previewUrl?: string;
  durationSeconds?: number;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
