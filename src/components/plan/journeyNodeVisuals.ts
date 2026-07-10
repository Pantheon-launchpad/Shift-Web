import {
  AlertTriangle, Bug, Calendar, Compass, DollarSign, FileText, Flag, GitBranch,
  GraduationCap, HelpCircle, Lightbulb, Megaphone, Package, Search, Sparkles,
  Star, Target, User, Users, Zap, BookOpen, CheckSquare, Layers,
} from 'lucide-react';
import type { JourneyNodeType, NodeStatus, NodePriority } from '../../lib/journey';

export const FALLBACK_ICON = Compass;

export const TYPE_ICON: Record<JourneyNodeType, typeof Compass> = {
  vision: Compass, goal: Target, project: Layers, milestone: Flag, task: CheckSquare,
  research: Search, decision: GitBranch, knowledge: BookOpen, idea: Lightbulb,
  question: HelpCircle, meeting: Users, risk: AlertTriangle, opportunity: Star,
  learning: GraduationCap, skill: Zap, resource: Package, document: FileText,
  bug: Bug, feature: Sparkles, customer: User, marketing: Megaphone,
  finance: DollarSign, team: Users,
};

export const TYPE_LABEL: Record<JourneyNodeType, string> = {
  vision: 'Vision', goal: 'Goal', project: 'Project', milestone: 'Milestone', task: 'Task',
  research: 'Research', decision: 'Decision', knowledge: 'Knowledge', idea: 'Idea',
  question: 'Question', meeting: 'Meeting', risk: 'Risk', opportunity: 'Opportunity',
  learning: 'Learning', skill: 'Skill', resource: 'Resource', document: 'Document',
  bug: 'Bug', feature: 'Feature', customer: 'Customer', marketing: 'Marketing',
  finance: 'Finance', team: 'Team',
};

export const ACCENT_COLOR: Record<'violet' | 'gold' | 'red' | 'neutral', string> = {
  violet: 'var(--violet)',
  gold: 'var(--gold)',
  red: '#f87171',
  neutral: 'var(--text-faint)',
};

export const STATUS_LABEL: Record<NodeStatus, string> = {
  todo: 'To do', 'in-progress': 'In progress', done: 'Done', blocked: 'Blocked',
};
export const STATUS_COLOR: Record<NodeStatus, string> = {
  todo: 'var(--text-faint)', 'in-progress': 'var(--violet)', done: 'var(--gold)', blocked: '#f87171',
};
export const PRIORITY_LABEL: Record<NodePriority, string> = { low: 'Low', medium: 'Medium', high: 'High' };
export const CalendarIcon = Calendar;
