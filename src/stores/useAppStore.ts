import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Understanding, CollectedFields } from "../lib/understanding";
import type { Journey } from "../lib/journey";
import { logout as apiLogout } from "../lib/api";
import { reviewRoadmap } from "../lib/aiApi";
import { reconcileRoadmapReview } from "../lib/generateRoadmap";
import { syncJourneyWithRoadmap } from "../lib/journey";

export type MilestoneStatus = "done" | "current" | "upcoming";

export interface Task {
  id: string;
  title: string;
  estimateMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  done: boolean;
  /** Set by the AI roadmap-review pass (src/lib/generateRoadmap.ts's reconcileRoadmapReview). Optional so template-generated and pre-existing tasks remain valid without it. */
  priority?: TaskPriority;
  /** Ids of other tasks (anywhere in the roadmap) that this task depends on, resolved from the AI's title-based references at reconcile time. */
  dependsOn?: string[];
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

export type TaskPriority = "low" | "medium" | "high";

/** A user-managed, ad-hoc daily task \u2014 separate from roadmap tasks, which stay owned by `roadmap` and are never duplicated here. The Dashboard merges this list with a synthetic row for today's roadmap task at render time. */
export interface DailyTask {
  id: string;
  title: string;
  done: boolean;
  priority: TaskPriority;
  order: number;
  createdAt: number;
  /** Omitted/'manual' for user-added tasks; 'ai' for ones Plan suggested when a goal was created. */
  source?: "manual" | "ai";
}

/** What the floating Focus widget is currently timing \u2014 either a roadmap task (advances the real milestone/streak on completion) or a standalone daily task (just marks itself done). */
export interface ActiveFocusTask {
  id: string;
  title: string;
  isDailyTask: boolean;
}

export interface Goal {
  id: string;
  title: string;
  createdAt: number;
  archived: boolean;
  completed: boolean;
  completedAt: number | null;
  roadmap: Roadmap;
  /** The Plan conversation tied to this specific goal \u2014 persists so you can pick up the thinking where you left off. */
  plannerLog: PlannerMessage[];
  /** What Plan understood about this goal at creation time (and after any clarification edits). Powers the persistent Understanding panel and the Journey's node content. */
  understanding: Understanding | null;
  /** The generated Journey graph \u2014 structural content only; live progress is always read from `roadmap` at render time, never duplicated here. */
  journey: Journey | null;
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
  instagram: string;
  medium: string;
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
  slack: boolean;
  trello: boolean;
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
    understanding?: Understanding | null,
    journey?: Journey | null,
  ) => string;
  setActiveGoal: (id: string) => void;
  archiveGoal: (id: string) => void;
  /** Permanently removes a goal and everything tied to it (roadmap, planner log, journey). Unlike archiveGoal, this can't be undone. */
  deleteGoal: (id: string) => void;
  /** Persists edits made directly on the Journey canvas (node moves, edits, AI expansions, accepted proposals). */
  updateGoalJourney: (goalId: string, journey: Journey) => void;
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

  /** Holds what the "chat instead" intake flow collected until Plan picks it up and drops back into Review with it pre-filled. */
  planChatDraft: { text: string; collected: CollectedFields } | null;
  setPlanChatDraft: (draft: { text: string; collected: CollectedFields }) => void;
  clearPlanChatDraft: () => void;

  // ---- Floating Focus widget (replaces the old full-page focus session) ----
  // Window chrome state (position/size/minimized) lives in FloatingWindow's
  // own sessionStorage-backed hook, not here \u2014 the store only tracks
  // *what* is being focused on, since that's what other components need
  // to read/react to.
  focusWidgetOpen: boolean;
  activeFocusTask: ActiveFocusTask | null;
  /** Opens the floating Focus widget targeting a specific task \u2014 either a real roadmap task or a standalone daily task. */
  openFocusWidget: (task: ActiveFocusTask) => void;
  /** Convenience for "just focus on whatever's next" \u2014 resolves today's roadmap task automatically. No-op if there isn't one. */
  startFocusOnTodayTask: () => void;
  closeFocusWidget: () => void;

  /** Records the debrief, advances the roadmap (task/milestone/goal completion), and updates the streak. This is "the work is done for today" - independent of whether the user goes on to share it. */
  completeDebrief: (entry: Omit<ActivityEntry, "id" | "date">) => void;
  /** Publishes an (optional) build-in-public post. Does NOT gate progress - see completeDebrief. */
  publishPost: (post: Omit<BuildInPublicPost, "id" | "date">) => void;
  /** Leaves the share step without posting anything. */
  skipSharing: () => void;

  // ---- Daily To-Do (user-managed, separate from roadmap tasks) ----
  dailyTasks: DailyTask[];
  addDailyTask: (title: string, priority?: TaskPriority) => void;
  addDailyTasks: (titles: string[], source?: "manual" | "ai") => void;
  updateDailyTask: (id: string, patch: Partial<Pick<DailyTask, "title" | "priority">>) => void;
  deleteDailyTask: (id: string) => void;
  toggleDailyTask: (id: string) => void;
  reorderDailyTasks: (orderedIds: string[]) => void;

  // ---- Widgets ----
  taskProgressWidgetEnabled: boolean;
  toggleTaskProgressWidget: () => void;

  // ---- History ----
  activityLog: ActivityEntry[];
  buildInPublicPosts: BuildInPublicPost[];
  totalFocusMinutes: number;
  updatePost: (
    id: string,
    patch: Partial<
      Pick<
        BuildInPublicPost,
        "twitter" | "linkedin" | "instagram" | "medium" | "cardHeadline" | "cardSubline"
      >
    >,
  ) => void;
  regeneratePost: (id: string) => void;

  // ---- Notifications ----
  notifications: AppNotification[];
  addNotification: (title: string, body: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  /**
   * The "AI as PM" pass: sends the goal's current roadmap to Gemma for
   * review (gaps, splits, merges, reordering, priority/dependsOn) and, if
   * anything meaningfully changed, applies it and drops a notification
   * summarizing what changed. Fails soft \\u2014 callers fire this without
   * awaiting and it swallows its own errors, so a flaky/offline AI backend
   * never blocks or breaks the task-completion flow that triggers it.
   */
  reviewRoadmapForGoal: (goalId: string) => Promise<void>;

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
  connections: { github: false, figma: false, slack: false, trello: false } as Connections,
  backgroundGlow: true,
  sidebarCollapsed: false,
  focusWidgetOpen: false,
  activeFocusTask: null as ActiveFocusTask | null,
  dailyTasks: [] as DailyTask[],
  taskProgressWidgetEnabled: true,
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
      signOut: () => {
        void apiLogout().catch(() => {});
        set({
          isAuthenticated: false,
          sessionFlow: "idle",
          isAssistantOpen: false,
        });
      },
      // Genuinely destructive: wipes everything and resets to a clean slate.
      // Also ends the backend session \u2014 there's no point deleting local
      // data while a valid refresh token for this device is still live.
      deleteAllData: () => {
        void apiLogout().catch(() => {});
        set({ ...initialTransient });
      },

      activeGoal: () =>
        get().goals.find((g) => g.id === get().activeGoalId) ?? null,
      createGoal: (title, roadmap, plannerLog = [], understanding = null, journey = null) => {
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
              understanding,
              journey,
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
      deleteGoal: (id) =>
        set((state) => {
          const goals = state.goals.filter((g) => g.id !== id);
          return {
            goals,
            activeGoalId:
              state.activeGoalId === id
                ? (goals.find((g) => !g.archived)?.id ?? null)
                : state.activeGoalId,
          };
        }),
      updateGoalJourney: (goalId, journey) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === goalId ? { ...g, journey } : g)),
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

      planChatDraft: null,
      setPlanChatDraft: (draft) => set({ planChatDraft: draft }),
      clearPlanChatDraft: () => set({ planChatDraft: null }),

      openFocusWidget: (task) => set({ focusWidgetOpen: true, activeFocusTask: task }),
      startFocusOnTodayTask: () => {
        const milestone = get().currentMilestone();
        const taskId = get().todayTaskId();
        const task = milestone?.tasks.find((t) => t.id === taskId);
        if (!task) return;
        set({ focusWidgetOpen: true, activeFocusTask: { id: task.id, title: task.title, isDailyTask: false } });
      },
      closeFocusWidget: () => set({ focusWidgetOpen: false, activeFocusTask: null }),

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
          totalFocusMinutes: state.totalFocusMinutes + entry.focusMinutes,
        }));

        if (goal?.id) void get().reviewRoadmapForGoal(goal.id);
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

        void get().reviewRoadmapForGoal(goalId);
      },

      reviewRoadmapForGoal: async (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal || goal.completed) return;

        try {
          const result = await reviewRoadmap({
            goalTitle: goal.title,
            timeline: goal.understanding?.timeline.value ?? null,
            experience: goal.understanding?.experience.value ?? null,
            timePerDayMinutes: goal.understanding?.timePerDayMinutes ?? null,
            roadmap: {
              milestones: goal.roadmap.milestones.map((m) => ({
                id: m.id,
                title: m.title,
                tasks: m.tasks.map((t) => ({
                  id: t.id,
                  title: t.title,
                  estimateMinutes: t.estimateMinutes,
                  difficulty: t.difficulty,
                  done: t.done,
                })),
              })),
            },
          });

          if (!result.changed || result.summary.length === 0) return;

          // Re-read the goal fresh in case anything else changed it while
          // the request was in flight (e.g. another completion), so we
          // reconcile against the latest state, not a stale snapshot.
          const latest = get().goals.find((g) => g.id === goalId);
          if (!latest) return;

          const reconciled = reconcileRoadmapReview(latest.roadmap, result);

          let updatedJourney = latest.journey;
          let addedCardCount = 0;
          if (latest.journey) {
            const synced = syncJourneyWithRoadmap(latest.journey, reconciled);
            updatedJourney = synced.journey;
            addedCardCount = synced.addedNodeIds.length;
          }

          set((state) => ({
            goals: state.goals.map((g) =>
              g.id === goalId ? { ...g, roadmap: reconciled, journey: updatedJourney } : g,
            ),
          }));

          const canvasNote = addedCardCount > 0
            ? ` ${addedCardCount} new card${addedCardCount === 1 ? "" : "s"} added to your canvas.`
            : "";
          get().addNotification(
            "Your roadmap was updated",
            result.summary.join(" ") + canvasNote,
          );
        } catch (err) {
          // Fail soft: offline, no key, malformed response, etc. Never
          // surface this to the user \\u2014 the roadmap just stays as-is
          // until the next completion triggers another attempt.
          console.error("[reviewRoadmapForGoal]", err);
        }
      },

      addDailyTask: (title, priority = "medium") =>
        set((state) => {
          const maxOrder = state.dailyTasks.reduce((m, t) => Math.max(m, t.order), -1);
          const task: DailyTask = { id: `dt_${Date.now()}`, title, done: false, priority, order: maxOrder + 1, createdAt: Date.now(), source: "manual" };
          return { dailyTasks: [...state.dailyTasks, task] };
        }),
      addDailyTasks: (titles, source = "ai") =>
        set((state) => {
          let maxOrder = state.dailyTasks.reduce((m, t) => Math.max(m, t.order), -1);
          const now = Date.now();
          const newTasks: DailyTask[] = titles.map((title, i) => {
            maxOrder += 1;
            return { id: `dt_${now}_${i}`, title, done: false, priority: "medium", order: maxOrder, createdAt: now, source };
          });
          return { dailyTasks: [...state.dailyTasks, ...newTasks] };
        }),
      updateDailyTask: (id, patch) =>
        set((state) => ({ dailyTasks: state.dailyTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteDailyTask: (id) => set((state) => ({ dailyTasks: state.dailyTasks.filter((t) => t.id !== id) })),
      toggleDailyTask: (id) =>
        set((state) => ({ dailyTasks: state.dailyTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      reorderDailyTasks: (orderedIds) =>
        set((state) => {
          const order = new Map(orderedIds.map((id, i) => [id, i]));
          return { dailyTasks: state.dailyTasks.map((t) => ({ ...t, order: order.get(t.id) ?? t.order })) };
        }),

      toggleTaskProgressWidget: () => set((state) => ({ taskProgressWidgetEnabled: !state.taskProgressWidgetEnabled })),

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
            const twitterVariants = [
              `Another step toward ${p.goalTitle} is done. Small wins add up. #buildinpublic`,
              `Progress update on ${p.goalTitle}: shipped something today, however small. #buildinpublic`,
              `Kept the streak alive working on ${p.goalTitle} today. #buildinpublic`,
            ];
            const linkedinVariants = [
              `Another small step forward on ${p.goalTitle} today. Consistency over intensity \u2014 that's the whole strategy.`,
              `Logged progress on ${p.goalTitle} today. Sharing the process, not just the finish line.`,
            ];
            const instagramVariants = [
              `Day-in-the-life update on ${p.goalTitle} \u2728 progress isn't always glamorous but it counts. #buildinpublic #wip`,
              `Chipping away at ${p.goalTitle} \ud83d\udc4a one task at a time. #buildinpublic`,
            ];
            const mediumVariants = [
              `A quick note on where ${p.goalTitle} stands today, and what moved it forward.`,
              `Reflecting on the latest step in building ${p.goalTitle} \u2014 what worked, what's next.`,
            ];
            const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
            return {
              ...p,
              twitter: pick(twitterVariants),
              linkedin: pick(linkedinVariants),
              instagram: pick(instagramVariants),
              medium: pick(mediumVariants),
            };
          }),
        })),

      addNotification: (title, body) =>
        set((state) => ({
          notifications: [
            { id: `notif_${Date.now()}`, date: Date.now(), title, body, read: false },
            ...state.notifications,
          ],
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
      // v2: the Journey graph was rewritten from a fixed radial chart
      // (`kind`, `angle`) to a real node-editor model (`type`, `x`/`y`).
      // Old persisted journeys don't have a `type` field at all, which
      // crashes the node renderer's icon lookup. Rather than trying to
      // translate the old shape 1:1, we drop old journeys back to `null` \u2014
      // the rest of each goal (roadmap, streak, planner log) is untouched,
      // and the Plan page already renders a clean "no Journey yet" state
      // for a goal with `journey: null`.
      version: 3,
      migrate: (persisted, fromVersion) => {
        const state = persisted as {
          goals?: Array<Record<string, unknown>>;
          buildInPublicPosts?: Array<Record<string, unknown>>;
          connections?: Record<string, boolean>;
        };
        if (fromVersion < 2 && Array.isArray(state.goals)) {
          state.goals = state.goals.map((g) => {
            const journey = g.journey as { nodes?: Array<Record<string, unknown>> } | null | undefined;
            const looksLegacy = !!journey?.nodes?.length && journey.nodes[0].type === undefined;
            return looksLegacy ? { ...g, journey: null } : g;
          });
        }
        if (fromVersion < 3) {
          // v3: build-in-public posts gained `instagram`/`medium`, and
          // connections gained `slack`/`trello` \u2014 backfill both so old
          // persisted state doesn't render undefined text.
          if (Array.isArray(state.buildInPublicPosts)) {
            state.buildInPublicPosts = state.buildInPublicPosts.map((p) => ({
              instagram: "",
              medium: "",
              ...p,
            }));
          }
          if (state.connections) {
            state.connections = { slack: false, trello: false, ...state.connections };
          }
        }
        return state;
      },
      // Don't persist things that should always start fresh on load -
      // an in-progress focus/debrief/share flow or an open panel shouldn't
      // survive a refresh in a half-finished state.
      partialize: (state) => {
        const {
          sessionFlow: _sessionFlow,
          isAssistantOpen: _isAssistantOpen,
          focusWidgetOpen: _focusWidgetOpen,
          activeFocusTask: _activeFocusTask,
          planChatDraft: _planChatDraft,
          ...rest
        } = state;
        void _sessionFlow;
        void _isAssistantOpen;
        void _focusWidgetOpen;
        void _activeFocusTask;
        void _planChatDraft;
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
