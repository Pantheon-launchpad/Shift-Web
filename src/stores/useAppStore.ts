import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type MilestoneStatus = "done" | "current" | "upcoming";

export interface Task {
  id: string;
  title: string;
  estimateMinutes: number;
  difficulty: "easy" | "medium" | "hard";
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
  completed: boolean;
  completedAt: number | null;
  roadmap: Roadmap;
  /** The AI Planner conversation tied to this specific goal \u2014 persists so you can pick up the chat where you left off. */
  plannerLog: PlannerMessage[];
}

export interface PlannerMessage {
  id: string;
  from: "ai" | "user";
  text: string;
  date: number;
  /** Present when this message offered a "mark as done" action the user can click. */
  actionTaskId?: string;
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

export interface Connections {
  github: boolean;
  figma: boolean;
}

/** The ephemeral, distraction-free sequence layered above normal navigation. */
export type SessionFlow = "idle" | "goal" | "focus" | "debrief" | "share";

const DAY_MS = 86_400_000;
function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Given a goal, marks the current milestone's next unfinished task done.
 * If that completes every task in the current milestone, the milestone is
 * marked 'done' and the next 'upcoming' milestone (if any) is promoted to
 * 'current'. If there is no next milestone, the goal itself is marked
 * complete. Returns the updated goal plus whether a task was actually
 * advanced (it's a no-op if there's nothing left to do).
 */
function advanceGoal(goal: Goal): { goal: Goal; advanced: boolean } {
  let advanced = false;
  const milestones = goal.roadmap.milestones.map((m) => ({
    ...m,
    tasks: m.tasks.map((t) => ({ ...t })),
  }));
  const currentIdx = milestones.findIndex((m) => m.status === "current");
  if (currentIdx === -1) return { goal, advanced };

  const current = milestones[currentIdx];
  const nextTaskIdx = current.tasks.findIndex((t) => !t.done);
  if (nextTaskIdx === -1) return { goal, advanced };

  current.tasks[nextTaskIdx].done = true;
  advanced = true;

  const milestoneComplete = current.tasks.every((t) => t.done);
  let completed = goal.completed;
  let completedAt = goal.completedAt;

  if (milestoneComplete) {
    current.status = "done";
    const nextIdx = milestones.findIndex(
      (m, i) => i > currentIdx && m.status === "upcoming",
    );
    if (nextIdx !== -1) {
      milestones[nextIdx] = { ...milestones[nextIdx], status: "current" };
    } else {
      // No more milestones left - the whole goal is done.
      completed = true;
      completedAt = Date.now();
    }
  }

  return {
    goal: { ...goal, roadmap: { milestones }, completed, completedAt },
    advanced,
  };
}

/** Shared by completeDebrief (timed focus sessions) and logProgressFromChat (AI Planner chat) so both advance the roadmap and streak identically. */
function computeProgressUpdate(
  state: {
    goals: Goal[];
    streakCount: number;
    lastCompletionDay: number | null;
    longestStreak: number;
  },
  goalId: string | null,
) {
  const goals = goalId
    ? state.goals.map((g) => (g.id === goalId ? advanceGoal(g).goal : g))
    : state.goals;

  const today = startOfDay(Date.now());
  let streakCount = state.streakCount;
  if (state.lastCompletionDay == null) {
    streakCount = 1;
  } else {
    const gapDays = Math.round((today - state.lastCompletionDay) / DAY_MS);
    if (gapDays === 0)
      streakCount = state.streakCount; // already logged today
    else if (gapDays === 1)
      streakCount = state.streakCount + 1; // consecutive day
    else streakCount = 1; // streak was broken, this restarts it
  }

  return {
    goals,
    streakCount,
    lastCompletionDay: today,
    longestStreak: Math.max(state.longestStreak, streakCount),
  };
}

interface AppState {
  // ---- Auth (mocked, frontend-only) ----
  isAuthenticated: boolean;
  userName: string;
  signIn: (name?: string) => void;
  signOut: () => void;
  updateUserName: (name: string) => void;
  deleteAllData: () => void;

  // ---- Goals ----
  goals: Goal[];
  activeGoalId: string | null;
  activeGoal: () => Goal | null;
  createGoal: (
    title: string,
    roadmap: Roadmap,
    plannerLog?: PlannerMessage[],
  ) => string;
  setActiveGoal: (id: string) => void;
  archiveGoal: (id: string) => void;
  appendPlannerMessage: (
    goalId: string,
    message: Omit<PlannerMessage, "id" | "date">,
  ) => void;
  /** Marks the active goal's current task done from a chat message rather than a timed focus session. Reuses the same roadmap/streak advancement as completeDebrief. */
  logProgressFromChat: (
    goalId: string,
    entry: Omit<ActivityEntry, "id" | "date" | "focusMinutes">,
  ) => void;

  todayTaskId: () => string | null;
  currentMilestone: () => Milestone | null;

  // ---- Ephemeral daily loop ----
  sessionFlow: SessionFlow;
  setSessionFlow: (flow: SessionFlow) => void;
  streakCount: number;
  lastCompletionDay: number | null;
  longestStreak: number;
  streak: () => number;
  lastDebrief: ActivityEntry | null;

  startGoalCreation: () => void;
  startFocusSession: () => void;
  endFocusSession: (minutes: number) => void;
  /** Records the debrief, advances the roadmap (task/milestone/goal completion), and updates the streak. This is "the work is done for today" - independent of whether the user goes on to share it. */
  completeDebrief: (entry: Omit<ActivityEntry, "id" | "date">) => void;
  /** Publishes an (optional) build-in-public post. Does NOT gate progress - see completeDebrief. */
  publishPost: (post: Omit<BuildInPublicPost, "id" | "date">) => void;
  /** Leaves the share step without posting anything. */
  skipSharing: () => void;

  // ---- History ----
  activityLog: ActivityEntry[];
  buildInPublicPosts: BuildInPublicPost[];
  totalFocusMinutes: number;
  updatePost: (
    id: string,
    patch: Partial<
      Pick<
        BuildInPublicPost,
        "twitter" | "linkedin" | "cardHeadline" | "cardSubline"
      >
    >,
  ) => void;
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
  connections: Connections;
  toggleConnection: (key: keyof Connections) => void;
  backgroundGlow: boolean;
  toggleBackgroundGlow: () => void;

  // ---- Layout ----
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;

  // ---- Floating AI assistant (shared between desktop trigger + mobile nav) ----
  isAssistantOpen: boolean;
  toggleAssistant: () => void;
  closeAssistant: () => void;
}

const seedNotifications: AppNotification[] = [
  {
    id: "n1",
    date: Date.now() - 3600_000,
    title: "Daily reminder",
    body: "You haven\u2019t started today\u2019s task yet.",
    read: false,
  },
  {
    id: "n2",
    date: Date.now() - 86_400_000,
    title: "Milestone unlocked",
    body: 'You completed "Validate the idea".',
    read: true,
  },
];

const initialTransient = {
  isAuthenticated: false,
  userName: "",
  goals: [] as Goal[],
  activeGoalId: null as string | null,
  sessionFlow: "idle" as SessionFlow,
  streakCount: 0,
  lastCompletionDay: null as number | null,
  longestStreak: 0,
  activityLog: [] as ActivityEntry[],
  buildInPublicPosts: [] as BuildInPublicPost[],
  totalFocusMinutes: 0,
  lastDebrief: null as ActivityEntry | null,
  isAssistantOpen: false,
  notifications: seedNotifications,
  aiSuggestions: true,
  emailReminders: true,
  connections: { github: false, figma: false } as Connections,
  backgroundGlow: true,
  sidebarCollapsed: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialTransient,

      signIn: (name = "there") =>
        set({ isAuthenticated: true, userName: name }),
      updateUserName: (name) => set({ userName: name }),
      // Signing out ends the session but keeps this device's goals/history -
      // signing back in should feel like coming back, not starting over.
      signOut: () =>
        set({
          isAuthenticated: false,
          sessionFlow: "idle",
          isAssistantOpen: false,
        }),
      // Genuinely destructive: wipes everything and resets to a clean slate.
      deleteAllData: () => set({ ...initialTransient }),

      activeGoal: () =>
        get().goals.find((g) => g.id === get().activeGoalId) ?? null,
      createGoal: (title, roadmap, plannerLog = []) => {
        const id = `goal_${Date.now()}`;
        set((state) => ({
          goals: [
            ...state.goals,
            {
              id,
              title,
              createdAt: Date.now(),
              archived: false,
              completed: false,
              completedAt: null,
              roadmap,
              plannerLog,
            },
          ],
          activeGoalId: id,
          sessionFlow: "idle",
        }));
        return id;
      },
      setActiveGoal: (id) => set({ activeGoalId: id }),
      archiveGoal: (id) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, archived: true } : g,
          ),
          activeGoalId:
            state.activeGoalId === id
              ? (state.goals.find((g) => g.id !== id && !g.archived)?.id ??
                null)
              : state.activeGoalId,
        })),
      appendPlannerMessage: (goalId, message) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  plannerLog: [
                    ...g.plannerLog,
                    {
                      ...message,
                      id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                      date: Date.now(),
                    },
                  ],
                }
              : g,
          ),
        })),

      todayTaskId: () => {
        const goal = get().activeGoal();
        if (!goal || goal.completed) return null;
        const current = goal.roadmap.milestones.find(
          (m) => m.status === "current",
        );
        return current?.tasks.find((t) => !t.done)?.id ?? null;
      },
      currentMilestone: () => {
        const goal = get().activeGoal();
        return (
          goal?.roadmap.milestones.find((m) => m.status === "current") ?? null
        );
      },

      setSessionFlow: (flow) => set({ sessionFlow: flow }),
      // The streak "decays" for display purposes without needing an explicit
      // reset action: if it's been more than a day since the last completion,
      // it reads as broken (0) even though streakCount is still on disk.
      streak: () => {
        const { streakCount, lastCompletionDay } = get();
        if (lastCompletionDay == null) return 0;
        const gapDays = Math.round(
          (startOfDay(Date.now()) - lastCompletionDay) / DAY_MS,
        );
        return gapDays <= 1 ? streakCount : 0;
      },

      startGoalCreation: () => set({ sessionFlow: "goal" }),
      startFocusSession: () => set({ sessionFlow: "focus" }),
      endFocusSession: (minutes) =>
        set((state) => ({
          sessionFlow: "debrief",
          totalFocusMinutes: state.totalFocusMinutes + minutes,
        })),

      completeDebrief: (entry) => {
        const full: ActivityEntry = {
          ...entry,
          id: `act_${Date.now()}`,
          date: Date.now(),
        };
        const goal = get().activeGoal();

        set((state) => ({
          ...computeProgressUpdate(state, goal?.id ?? null),
          lastDebrief: full,
          activityLog: [full, ...state.activityLog],
          sessionFlow: "share" as const,
        }));
      },

      logProgressFromChat: (goalId, entry) => {
        const full: ActivityEntry = {
          ...entry,
          id: `act_${Date.now()}`,
          date: Date.now(),
          focusMinutes: 0,
        };
        set((state) => ({
          ...computeProgressUpdate(state, goalId),
          lastDebrief: full,
          activityLog: [full, ...state.activityLog],
        }));
      },

      publishPost: (post) => {
        const full: BuildInPublicPost = {
          ...post,
          id: `post_${Date.now()}`,
          date: Date.now(),
        };
        set((state) => ({
          buildInPublicPosts: [full, ...state.buildInPublicPosts],
          sessionFlow: "idle",
        }));
      },
      skipSharing: () => set({ sessionFlow: "idle" }),

      updatePost: (id, patch) =>
        set((state) => ({
          buildInPublicPosts: state.buildInPublicPosts.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
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
            const twitter =
              variants[Math.floor(Math.random() * variants.length)];
            return { ...p, twitter };
          }),
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      toggleAiSuggestions: () =>
        set((state) => ({ aiSuggestions: !state.aiSuggestions })),
      toggleEmailReminders: () =>
        set((state) => ({ emailReminders: !state.emailReminders })),
      toggleConnection: (key) =>
        set((state) => ({
          connections: { ...state.connections, [key]: !state.connections[key] },
        })),
      toggleBackgroundGlow: () =>
        set((state) => ({ backgroundGlow: !state.backgroundGlow })),

      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      toggleAssistant: () =>
        set((state) => ({ isAssistantOpen: !state.isAssistantOpen })),
      closeAssistant: () => set({ isAssistantOpen: false }),
    }),
    {
      name: "shift-store",
      storage: createJSONStorage(() => localStorage),
      // Don't persist things that should always start fresh on load -
      // an in-progress focus/debrief/share flow or an open panel shouldn't
      // survive a refresh in a half-finished state.
      partialize: (state) => {
        const {
          sessionFlow: _sessionFlow,
          isAssistantOpen: _isAssistantOpen,
          ...rest
        } = state;
        void _sessionFlow;
        void _isAssistantOpen;
        return rest;
      },
    },
  ),
);

/**
 * Pure helper (not part of the store) for deriving the next few unfinished
 * tasks from a goal. Kept outside the store and called from components via
 * `useMemo` so it never becomes an unstable useSyncExternalStore snapshot.
 */
export function getUpcomingTasks(
  goal: Goal | null,
  limit = 3,
): { task: Task; milestone: Milestone }[] {
  if (!goal) return [];
  const result: { task: Task; milestone: Milestone }[] = [];
  for (const milestone of goal.roadmap.milestones) {
    if (milestone.status === "done") continue;
    for (const task of milestone.tasks) {
      if (!task.done) result.push({ task, milestone });
      if (result.length >= limit) return result;
    }
  }
  return result;
}
