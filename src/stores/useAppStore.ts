import { create } from 'zustand';

export type MilestoneStatus = 'done' | 'current' | 'upcoming';

export interface Task {
  id: string;
  title: string;
  estimateMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  done: boolean;
}

export interface Milestone {
  id: string;
  week: number;
  title: string;
  status: MilestoneStatus;
  tasks: Task[];
}

export interface Roadmap {
  milestones: Milestone[];
}

export interface Goal {
  id: string;
  title: string;
  createdAt: number;
  archived: boolean;
  roadmap: Roadmap;
}

export interface ActivityEntry {
  id: string;
  date: number;
  taskTitle: string;
  rawText: string;
  aiSummary: string;
  link?: string;
  focusMinutes: number;
}

export interface BuildInPublicPost {
  id: string;
  date: number;
  goalTitle: string;
  twitter: string;
  linkedin: string;
  cardHeadline: string;
  cardSubline: string;
}

export interface AppNotification {
  id: string;
  date: number;
  title: string;
  body: string;
  read: boolean;
}

/** The ephemeral, distraction-free sequence layered above normal navigation. */
export type SessionFlow = 'idle' | 'goal' | 'focus' | 'debrief' | 'share';

interface AppState {
  // ---- Auth (mocked, frontend-only) ----
  isAuthenticated: boolean;
  userName: string;
  signIn: (name?: string) => void;
  signOut: () => void;
  updateUserName: (name: string) => void;

  // ---- Goals ----
  goals: Goal[];
  activeGoalId: string | null;
  activeGoal: () => Goal | null;
  createGoal: (title: string, roadmap: Roadmap) => void;
  setActiveGoal: (id: string) => void;
  archiveGoal: (id: string) => void;

  todayTaskId: () => string | null;
  currentMilestone: () => Milestone | null;

  // ---- Ephemeral daily loop ----
  sessionFlow: SessionFlow;
  setSessionFlow: (flow: SessionFlow) => void;
  streak: number;
  longestStreak: number;
  lastDebrief: ActivityEntry | null;

  startGoalCreation: () => void;
  startFocusSession: () => void;
  endFocusSession: (minutes: number) => void;
  completeDebrief: (entry: Omit<ActivityEntry, 'id' | 'date'>) => void;
  finishToday: (post: Omit<BuildInPublicPost, 'id' | 'date'>) => void;

  // ---- History ----
  activityLog: ActivityEntry[];
  buildInPublicPosts: BuildInPublicPost[];
  totalFocusMinutes: number;
  updatePost: (id: string, patch: Partial<Pick<BuildInPublicPost, 'twitter' | 'linkedin' | 'cardHeadline' | 'cardSubline'>>) => void;
  regeneratePost: (id: string) => void;

  // ---- Notifications ----
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // ---- Settings ----
  aiSuggestions: boolean;
  emailReminders: boolean;
  toggleAiSuggestions: () => void;
  toggleEmailReminders: () => void;
}

const seedNotifications: AppNotification[] = [
  { id: 'n1', date: Date.now() - 3600_000, title: 'Daily reminder', body: 'You haven\u2019t started today\u2019s task yet.', read: false },
  { id: 'n2', date: Date.now() - 86_400_000, title: 'Milestone unlocked', body: 'You completed "Validate the idea".', read: true },
];

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  userName: '',
  signIn: (name = 'there') => set({ isAuthenticated: true, userName: name }),
  updateUserName: (name) => set({ userName: name }),
  signOut: () =>
    set({
      isAuthenticated: false,
      userName: '',
      goals: [],
      activeGoalId: null,
      sessionFlow: 'idle',
      streak: 0,
      longestStreak: 0,
      activityLog: [],
      buildInPublicPosts: [],
      totalFocusMinutes: 0,
      lastDebrief: null,
    }),

  goals: [],
  activeGoalId: null,
  activeGoal: () => get().goals.find((g) => g.id === get().activeGoalId) ?? null,
  createGoal: (title, roadmap) => {
    const id = `goal_${Date.now()}`;
    set((state) => ({
      goals: [...state.goals, { id, title, createdAt: Date.now(), archived: false, roadmap }],
      activeGoalId: id,
      sessionFlow: 'idle',
    }));
  },
  setActiveGoal: (id) => set({ activeGoalId: id }),
  archiveGoal: (id) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, archived: true } : g)),
      activeGoalId:
        state.activeGoalId === id ? (state.goals.find((g) => g.id !== id && !g.archived)?.id ?? null) : state.activeGoalId,
    })),

  todayTaskId: () => {
    const goal = get().activeGoal();
    if (!goal) return null;
    const current = goal.roadmap.milestones.find((m) => m.status === 'current');
    return current?.tasks.find((t) => !t.done)?.id ?? null;
  },
  currentMilestone: () => {
    const goal = get().activeGoal();
    return goal?.roadmap.milestones.find((m) => m.status === 'current') ?? null;
  },

  sessionFlow: 'idle',
  setSessionFlow: (flow) => set({ sessionFlow: flow }),
  streak: 0,
  longestStreak: 0,
  lastDebrief: null,

  startGoalCreation: () => set({ sessionFlow: 'goal' }),
  startFocusSession: () => set({ sessionFlow: 'focus' }),
  endFocusSession: (minutes) => set((state) => ({ sessionFlow: 'debrief', totalFocusMinutes: state.totalFocusMinutes + minutes })),
  completeDebrief: (entry) => {
    const full: ActivityEntry = { ...entry, id: `act_${Date.now()}`, date: Date.now() };
    set((state) => ({ lastDebrief: full, activityLog: [full, ...state.activityLog], sessionFlow: 'share' }));
  },
  finishToday: (post) => {
    const goal = get().activeGoal();
    const full: BuildInPublicPost = { ...post, id: `post_${Date.now()}`, date: Date.now() };
    set((state) => {
      const newStreak = state.streak + 1;
      const goals = state.goals.map((g) => {
        if (!goal || g.id !== goal.id) return g;
        const milestones = g.roadmap.milestones.map((m) => {
          if (m.status !== 'current') return m;
          const nextIdx = m.tasks.findIndex((t) => !t.done);
          if (nextIdx === -1) return m;
          const tasks = m.tasks.map((t, i) => (i === nextIdx ? { ...t, done: true } : t));
          return { ...m, tasks };
        });
        return { ...g, roadmap: { milestones } };
      });
      return {
        goals,
        streak: newStreak,
        longestStreak: Math.max(state.longestStreak, newStreak),
        buildInPublicPosts: [full, ...state.buildInPublicPosts],
        sessionFlow: 'idle' as const,
      };
    });
  },

  activityLog: [],
  buildInPublicPosts: [],
  totalFocusMinutes: 0,
  updatePost: (id, patch) =>
    set((state) => ({
      buildInPublicPosts: state.buildInPublicPosts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  regeneratePost: (id) =>
    set((state) => ({
      buildInPublicPosts: state.buildInPublicPosts.map((p) => {
        if (p.id !== id) return p;
        const variants = [
          `Another step toward ${p.goalTitle} is done. Small wins add up. #buildinpublic`,
          `Progress update on ${p.goalTitle}: shipped something today, however small. #buildinpublic`,
          `Kept the streak alive working on ${p.goalTitle} today. #buildinpublic`,
        ];
        const twitter = variants[Math.floor(Math.random() * variants.length)];
        return { ...p, twitter };
      }),
    })),

  notifications: seedNotifications,
  markNotificationRead: (id) =>
    set((state) => ({ notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotificationsRead: () => set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),

  aiSuggestions: true,
  emailReminders: true,
  toggleAiSuggestions: () => set((state) => ({ aiSuggestions: !state.aiSuggestions })),
  toggleEmailReminders: () => set((state) => ({ emailReminders: !state.emailReminders })),
}));

/**
 * Pure helper (not part of the store) for deriving the next few unfinished
 * tasks from a goal. Kept outside the store and called from components via
 * `useMemo` so it never becomes an unstable useSyncExternalStore snapshot.
 */
export function getUpcomingTasks(goal: Goal | null, limit = 3): { task: Task; milestone: Milestone }[] {
  if (!goal) return [];
  const result: { task: Task; milestone: Milestone }[] = [];
  for (const milestone of goal.roadmap.milestones) {
    if (milestone.status === 'done') continue;
    for (const task of milestone.tasks) {
      if (!task.done) result.push({ task, milestone });
      if (result.length >= limit) return result;
    }
  }
  return result;
}
