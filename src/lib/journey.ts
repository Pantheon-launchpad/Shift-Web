import dagre from 'dagre';
import type { CategoryKey } from './generateRoadmap';
import type { Understanding } from './understanding';
import { opportunitiesFor } from './understanding';
import type { Roadmap } from '../stores/useAppStore';

// ---------------------------------------------------------------------------
// Core graph model. This is a genuine graph now, not a fixed radial chart:
// every node carries its own (x, y) which the user can drag freely, and
// every edge carries a real relationship type. Positions are seeded by an
// automatic layout at generation time (see autoLayout below) and persisted
// from then on \u2014 dragging a node is a real, saved edit, not a transient
// view state.
// ---------------------------------------------------------------------------

export type JourneyNodeType =
  | 'vision' | 'goal' | 'project' | 'milestone' | 'task' | 'research' | 'decision'
  | 'knowledge' | 'idea' | 'question' | 'meeting' | 'risk' | 'opportunity'
  | 'learning' | 'skill' | 'resource' | 'document' | 'bug' | 'feature'
  | 'customer' | 'marketing' | 'finance' | 'team';

export type RelationType =
  | 'depends-on' | 'blocks' | 'requires' | 'related-to' | 'inspires'
  | 'researches' | 'uses' | 'builds-on' | 'owned-by';

export const RELATION_LABELS: Record<RelationType, string> = {
  'depends-on': 'Depends On',
  blocks: 'Blocks',
  requires: 'Requires',
  'related-to': 'Related To',
  inspires: 'Inspires',
  researches: 'Researches',
  uses: 'Uses',
  'builds-on': 'Builds On',
  'owned-by': 'Owned By',
};

/** Each relationship type gets its own edge color so the graph reads relationships at a glance, not just structure. */
export const RELATION_COLOR: Record<RelationType, string> = {
  'depends-on': 'var(--violet)',
  'builds-on': 'var(--violet)',
  blocks: '#f87171',
  requires: 'var(--text-faint)',
  uses: 'var(--text-faint)',
  'related-to': 'var(--text-faint)',
  inspires: 'var(--gold)',
  researches: '#60a5fa',
  'owned-by': 'var(--text-faint)',
};

export type NodeStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type NodePriority = 'low' | 'medium' | 'high';
/** Calm, bounded accent palette \u2014 type differences are communicated mainly through icon, this is just a subtle emphasis layer. */
export type NodeAccent = 'violet' | 'gold' | 'red' | 'neutral';

export const TYPE_ACCENT: Record<JourneyNodeType, NodeAccent> = {
  vision: 'violet', goal: 'violet', project: 'violet', milestone: 'gold', decision: 'violet',
  task: 'neutral', research: 'neutral', knowledge: 'neutral', document: 'neutral', learning: 'neutral',
  skill: 'neutral', question: 'neutral', meeting: 'neutral', customer: 'neutral', marketing: 'neutral',
  finance: 'neutral', team: 'neutral', resource: 'neutral',
  risk: 'red', bug: 'red',
  opportunity: 'gold', feature: 'gold', idea: 'gold',
};

export interface JourneyNode {
  id: string;
  type: JourneyNodeType;
  label: string;
  description: string;
  x: number;
  y: number;
  status: NodeStatus;
  priority: NodePriority;
  tags: string[];
  notes: string;
  links: string[];
  dueDate: string | null;
  collapsed: boolean;
  locked: boolean;
  /** Ties back to the real roadmap so progress is always read live, never duplicated. */
  milestoneId?: string;
  taskId?: string;
  /** Set on nodes created via "Expand with AI" so the branch can be collapsed/removed as a unit. */
  parentId?: string;
}

export interface JourneyEdge {
  id: string;
  source: string;
  target: string;
  relation: RelationType;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Journey {
  nodes: JourneyNode[];
  edges: JourneyEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function baseNode(partial: Partial<JourneyNode> & Pick<JourneyNode, 'id' | 'type' | 'label'>): JourneyNode {
  return {
    description: '',
    x: 0,
    y: 0,
    status: 'todo',
    priority: 'medium',
    tags: [],
    notes: '',
    links: [],
    dueDate: null,
    collapsed: false,
    locked: false,
    ...partial,
  };
}

// ---------------------------------------------------------------------------
// Generation \u2014 builds the initial graph from the same Understanding +
// Roadmap that produced the milestone list. Positions are placeholders
// here; autoLayout() assigns real ones right after.
// ---------------------------------------------------------------------------

const SKILLS_LABEL: Record<CategoryKey, string> = {
  software: 'Technical Skills', writing: 'Craft & Research', fitness: 'Training Knowledge', learning: 'Core Concepts',
};
const SKILLS_ITEMS: Record<CategoryKey, string> = {
  software: 'Ship a thin end-to-end slice before polishing \u00b7 Talk to users before building more',
  writing: 'Finish messy drafts before editing \u00b7 Read in the genre you\u2019re writing',
  fitness: 'Progressive overload without rushing it \u00b7 Recovery is part of the plan',
  learning: 'Apply concepts immediately, not just read them \u00b7 Spaced repetition over cramming',
};
const RESOURCE_TOOLS: Record<CategoryKey, string> = {
  software: 'A place to ship to \u00b7 A way to hear from real users',
  writing: 'A distraction-free writing space \u00b7 One honest early reader',
  fitness: 'A simple way to track sessions \u00b7 Recovery time built into the week',
  learning: 'A core resource to study from \u00b7 A small project to apply it to',
};

function fieldOr(value: string | null | undefined, fallback: string): string {
  return value && value.trim() ? value : fallback;
}

export function generateJourney(goalTitle: string, understanding: Understanding, roadmap: Roadmap): Journey {
  const { category } = understanding;
  const nodes: JourneyNode[] = [];
  const edges: JourneyEdge[] = [];

  nodes.push(baseNode({ id: 'vision', type: 'vision', label: goalTitle, description: understanding.categoryLabel, priority: 'high' }));

  nodes.push(baseNode({
    id: 'skills', type: 'skill', label: SKILLS_LABEL[category], description: SKILLS_ITEMS[category],
  }));
  edges.push({ id: makeId('e'), source: 'vision', target: 'skills', relation: 'requires' });

  nodes.push(baseNode({
    id: 'resources', type: 'resource', label: 'Resources',
    description: fieldOr(understanding.resources.value, understanding.timePerDayMinutes ? `About ${understanding.timePerDayMinutes} min/day \u00b7 ${RESOURCE_TOOLS[category]}` : RESOURCE_TOOLS[category]),
  }));
  edges.push({ id: makeId('e'), source: 'vision', target: 'resources', relation: 'uses' });

  understanding.risks.slice(0, 2).forEach((risk, i) => {
    const id = `risk-${i}`;
    nodes.push(baseNode({ id, type: 'risk', label: risk.length > 40 ? `${risk.slice(0, 40)}\u2026` : risk, description: risk, priority: 'high' }));
    edges.push({ id: makeId('e'), source: id, target: 'vision', relation: 'blocks' });
  });

  opportunitiesFor(category).slice(0, 2).forEach((opp, i) => {
    const id = `opportunity-${i}`;
    nodes.push(baseNode({ id, type: 'opportunity', label: opp.length > 40 ? `${opp.slice(0, 40)}\u2026` : opp, description: opp }));
    edges.push({ id: makeId('e'), source: id, target: 'vision', relation: 'inspires' });
  });

  let previousMilestoneId: string | null = null;
  let firstMilestoneId: string | null = null;
  roadmap.milestones.forEach((m) => {
    const msId = `sub-${m.id}`;
    if (!firstMilestoneId) firstMilestoneId = msId;
    nodes.push(baseNode({
      id: msId, type: 'milestone', label: m.title, description: `${m.tasks.length} task${m.tasks.length === 1 ? '' : 's'}`,
      status: m.status === 'done' ? 'done' : m.status === 'current' ? 'in-progress' : 'todo',
      milestoneId: m.id,
    }));
    if (previousMilestoneId) {
      edges.push({ id: makeId('e'), source: previousMilestoneId, target: msId, relation: 'depends-on' });
    } else {
      edges.push({ id: makeId('e'), source: 'vision', target: msId, relation: 'builds-on' });
    }
    previousMilestoneId = msId;

    m.tasks.forEach((t) => {
      const taskNodeId = `task-${t.id}`;
      nodes.push(baseNode({
        id: taskNodeId, type: 'task', label: t.title, description: `${t.estimateMinutes} min \u00b7 ${t.difficulty}`,
        status: t.done ? 'done' : 'todo', taskId: t.id, milestoneId: m.id, parentId: msId,
      }));
      edges.push({ id: makeId('e'), source: msId, target: taskNodeId, relation: 'requires' });
    });
  });
  const lastMilestoneId = previousMilestoneId;

  // Cross-link the conceptual nodes into the milestone chain too, so the
  // graph reads as one interconnected structure rather than a star around
  // the vision node with a separate, disconnected milestone chain.
  if (firstMilestoneId) {
    edges.push({ id: makeId('e'), source: 'skills', target: firstMilestoneId, relation: 'requires' });
    edges.push({ id: makeId('e'), source: 'resources', target: firstMilestoneId, relation: 'uses' });
    nodes.filter((n) => n.type === 'risk').forEach((r) => {
      edges.push({ id: makeId('e'), source: r.id, target: firstMilestoneId!, relation: 'blocks' });
    });
  }
  if (lastMilestoneId) {
    nodes.filter((n) => n.type === 'opportunity').forEach((o) => {
      edges.push({ id: makeId('e'), source: lastMilestoneId!, target: o.id, relation: 'inspires' });
    });
  }

  return autoLayout({ nodes, edges });
}

// ---------------------------------------------------------------------------
// Auto layout \u2014 a real dagre graph layout (hierarchical, left-to-right),
// not a radial chart pinned to a center point. Clusters emerge from the
// actual edge structure. Re-running this after a manual edit is what
// backs the canvas's "Auto Arrange" action; the user's own dragging is
// otherwise persisted untouched.
// ---------------------------------------------------------------------------

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 86;

export function autoLayout(journey: Journey): Journey {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 48, ranksep: 110, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  journey.nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: n.type === 'vision' ? 110 : NODE_HEIGHT }));
  journey.edges.forEach((e) => {
    if (g.hasNode(e.source) && g.hasNode(e.target)) g.setEdge(e.source, e.target);
  });

  dagre.layout(g);

  const nodes = journey.nodes.map((n) => {
    const pos = g.node(n.id);
    return pos ? { ...n, x: pos.x, y: pos.y } : n;
  });

  return { ...journey, nodes };
}

// ---------------------------------------------------------------------------
// Branch progress \u2014 rolls up real completion from milestone/task nodes
// under a given root, so the canvas can show e.g. "76%" on a branch without
// ever storing a duplicate progress number.
// ---------------------------------------------------------------------------

export function branchProgress(journey: Journey, nodeId: string): number | null {
  const descendants = collectDescendants(journey, nodeId);
  const relevant = descendants.filter((n) => n.type === 'task' || n.type === 'milestone');
  if (relevant.length === 0) return null;
  const done = relevant.filter((n) => n.status === 'done').length;
  return Math.round((done / relevant.length) * 100);
}

function collectDescendants(journey: Journey, nodeId: string): JourneyNode[] {
  const result: JourneyNode[] = [];
  const seen = new Set<string>();
  const stack = [nodeId];
  while (stack.length) {
    const current = stack.pop()!;
    for (const edge of journey.edges) {
      if (edge.source === current && !seen.has(edge.target)) {
        seen.add(edge.target);
        const node = journey.nodes.find((n) => n.id === edge.target);
        if (node) {
          result.push(node);
          stack.push(node.id);
        }
      }
    }
  }
  return result;
}

export function connectedNodeIds(journey: Journey, nodeId: string): Set<string> {
  const ids = new Set<string>([nodeId]);
  journey.edges.forEach((e) => {
    if (e.source === nodeId) ids.add(e.target);
    if (e.target === nodeId) ids.add(e.source);
  });
  return ids;
}

// ---------------------------------------------------------------------------
// Expand With AI \u2014 the signature feature. Growing a node along a chosen
// perspective adds a small, labeled cluster of child nodes rather than
// making the graph merely bigger. A curated dictionary covers a handful of
// common planning nouns (matching the canonical "Authentication" example);
// everything else falls back to a still-grounded, perspective-specific
// template built from the node's own label rather than a generic filler
// list, since there's no live model here to reason about arbitrary labels
// \u2014 see the honesty notes in ARCHITECTURE.md for the same pattern used
// elsewhere in Plan.
// ---------------------------------------------------------------------------

export type Perspective =
  | 'Implementation' | 'Technical' | 'Business' | 'Marketing' | 'Product' | 'Research'
  | 'Learning' | 'Security' | 'Scaling' | 'Operations' | 'Legal' | 'Finance';

export const PERSPECTIVES: Perspective[] = [
  'Implementation', 'Technical', 'Business', 'Marketing', 'Product', 'Research',
  'Learning', 'Security', 'Scaling', 'Operations', 'Legal', 'Finance',
];

const CURATED_EXPANSIONS: Record<string, Partial<Record<Perspective, string[]>>> = {
  authentication: {
    Implementation: ['JWT', 'OAuth', 'Session Management', 'Password Reset', 'Email Verification', 'Role Permissions', 'MFA', 'Refresh Tokens', 'Audit Logs'],
    Security: ['Rate Limiting', 'Brute Force Protection', 'Encryption', 'Token Rotation', 'Monitoring', 'Threat Detection'],
    Technical: ['Session Storage', 'Token Signing', 'Auth Middleware', 'Provider Integrations'],
  },
  payment: {
    Implementation: ['Checkout Flow', 'Webhooks', 'Subscription Billing', 'Refunds', 'Invoicing'],
    Security: ['PCI Compliance', 'Tokenized Cards', 'Fraud Detection'],
    Business: ['Pricing Tiers', 'Trial Period', 'Payment Provider Choice'],
  },
  onboarding: {
    Product: ['First-Run Checklist', 'Empty States', 'Progressive Disclosure', 'Sample Data'],
    Marketing: ['Welcome Email Sequence', 'Activation Metrics'],
    Research: ['Drop-off Points', 'New User Interviews'],
  },
};

const PERSPECTIVE_TEMPLATES: Record<Perspective, (label: string) => string[]> = {
  Implementation: (l) => [`Define the build steps for ${l}`, `Identify what ${l} depends on`, `Ship the smallest working version of ${l}`],
  Technical: (l) => [`Choose the technical approach for ${l}`, `Map data flow through ${l}`, `Note technical risks in ${l}`],
  Business: (l) => [`Define the business case for ${l}`, `Estimate cost of ${l}`, `Identify who owns ${l}`],
  Marketing: (l) => [`Plan how ${l} gets announced`, `Identify who needs to hear about ${l}`],
  Product: (l) => [`Define what "done" looks like for ${l}`, `List the user-facing edge cases in ${l}`],
  Research: (l) => [`Look at how others solved ${l}`, `List open questions about ${l}`],
  Learning: (l) => [`Identify what you need to learn for ${l}`, `Find the core resource for ${l}`],
  Security: (l) => [`List what could go wrong in ${l}`, `Define access boundaries for ${l}`],
  Scaling: (l) => [`Identify the bottleneck ${l} hits first`, `Plan the next tier of ${l}`],
  Operations: (l) => [`Define who's on call for ${l}`, `Write the runbook for ${l}`],
  Legal: (l) => [`Check compliance requirements for ${l}`, `Review terms affecting ${l}`],
  Finance: (l) => [`Estimate the real cost of ${l}`, `Define the budget ceiling for ${l}`],
};

const PERSPECTIVE_NODE_TYPE: Record<Perspective, JourneyNodeType> = {
  Implementation: 'task', Technical: 'task', Business: 'idea', Marketing: 'marketing', Product: 'feature',
  Research: 'research', Learning: 'learning', Security: 'risk', Scaling: 'task', Operations: 'task',
  Legal: 'document', Finance: 'finance',
};

export interface ExpandResult {
  journey: Journey;
  addedNodeIds: string[];
}

export function expandNodeWithAI(journey: Journey, nodeId: string, perspective: Perspective): ExpandResult {
  const node = journey.nodes.find((n) => n.id === nodeId);
  if (!node) return { journey, addedNodeIds: [] };

  const key = node.label.toLowerCase().trim();
  const curated = Object.keys(CURATED_EXPANSIONS).find((k) => key.includes(k));
  const items = (curated && CURATED_EXPANSIONS[curated][perspective]) || PERSPECTIVE_TEMPLATES[perspective](node.label);
  const type = PERSPECTIVE_NODE_TYPE[perspective];

  const newNodes: JourneyNode[] = items.map((label) =>
    baseNode({ id: makeId('n'), type, label, description: `${perspective} \u00b7 grown from "${node.label}"`, parentId: node.id })
  );
  const newEdges: JourneyEdge[] = newNodes.map((n) => ({ id: makeId('e'), source: node.id, target: n.id, relation: 'builds-on' as RelationType }));

  const next = autoLayout({ nodes: [...journey.nodes, ...newNodes], edges: [...journey.edges, ...newEdges] });
  return { journey: next, addedNodeIds: newNodes.map((n) => n.id) };
}

// ---------------------------------------------------------------------------
// Canvas AI command bar \u2014 interprets a short set of real, useful graph
// commands into a *proposed* diff (never applied directly, per the spec's
// "AI Preview" requirement). Deterministic pattern-matching, consistent
// with the rest of Plan's honest "AI" positioning \u2014 no live model call.
// ---------------------------------------------------------------------------

export interface CommandResult {
  journey: Journey;
  summary: string;
  changedNodeIds: string[];
  /** Set when the command was a question rather than an edit \u2014 shown as a reply, no preview/accept step needed. */
  answerOnly?: boolean;
}

function findNodeByLabel(journey: Journey, needle: string): JourneyNode | undefined {
  const lower = needle.toLowerCase().trim();
  return journey.nodes.find((n) => n.label.toLowerCase() === lower) ?? journey.nodes.find((n) => n.label.toLowerCase().includes(lower));
}

export function interpretCommand(journey: Journey, message: string, selectedNodeId: string | null): CommandResult | null {
  const text = message.trim();
  const lower = text.toLowerCase();

  if (/what.*(missing|next)/.test(lower)) {
    const todo = journey.nodes.filter((n) => n.status === 'todo' && (n.type === 'task' || n.type === 'milestone'));
    const summary = todo.length > 0
      ? `Next up: ${todo.slice(0, 3).map((n) => n.label).join(', ')}.`
      : 'Everything visible on the graph is either done or in progress.';
    return { journey, summary, changedNodeIds: [], answerOnly: true };
  }

  const removeMatch = lower.match(/^(remove|delete)\s+(this branch|.+)$/);
  if (removeMatch) {
    const target = removeMatch[2] === 'this branch' ? (selectedNodeId ? journey.nodes.find((n) => n.id === selectedNodeId) : undefined) : findNodeByLabel(journey, removeMatch[2]);
    if (target) {
      const toRemove = new Set([target.id, ...collectDescendants(journey, target.id).map((n) => n.id)]);
      const next: Journey = {
        ...journey,
        nodes: journey.nodes.filter((n) => !toRemove.has(n.id)),
        edges: journey.edges.filter((e) => !toRemove.has(e.source) && !toRemove.has(e.target)),
      };
      return { journey: next, summary: `Removing "${target.label}" and everything under it.`, changedNodeIds: [...toRemove] };
    }
  }

  const connectMatch = lower.match(/connect\s+(.+?)\s+(?:and|to|with)\s+(.+)/);
  if (connectMatch) {
    const a = findNodeByLabel(journey, connectMatch[1]);
    const b = findNodeByLabel(journey, connectMatch[2]);
    if (a && b) {
      const edge: JourneyEdge = { id: makeId('e'), source: a.id, target: b.id, relation: 'related-to' };
      return { journey: { ...journey, edges: [...journey.edges, edge] }, summary: `Connecting "${a.label}" to "${b.label}".`, changedNodeIds: [a.id, b.id] };
    }
  }

  const splitMatch = lower.match(/split\s+(.+?)\s+into\s+(\w+)\s*(phases|parts)?/);
  if (splitMatch) {
    const target = findNodeByLabel(journey, splitMatch[1]);
    const countWords: Record<string, number> = { two: 2, three: 3, four: 4, five: 5 };
    const count = countWords[splitMatch[2]] ?? parseInt(splitMatch[2], 10) ?? 3;
    if (target && count > 1 && count <= 8) {
      const newNodes: JourneyNode[] = Array.from({ length: count }, (_, i) =>
        baseNode({ id: makeId('n'), type: target.type === 'milestone' ? 'task' : target.type, label: `${target.label} \u2014 Phase ${i + 1}`, parentId: target.id })
      );
      const newEdges: JourneyEdge[] = newNodes.map((n, i) => ({
        id: makeId('e'),
        source: i === 0 ? target.id : newNodes[i - 1].id,
        target: n.id,
        relation: 'depends-on' as RelationType,
      }));
      const next = autoLayout({ nodes: [...journey.nodes, ...newNodes], edges: [...journey.edges, ...newEdges] });
      return { journey: next, summary: `Splitting "${target.label}" into ${count} phases.`, changedNodeIds: newNodes.map((n) => n.id) };
    }
  }

  const addKindMatch = lower.match(/add\s+(research|risk|resource)s?\s*(?:tasks?)?\s*(?:to\s+(.+))?/);
  if (addKindMatch) {
    const type = addKindMatch[1] as JourneyNodeType;
    const target = addKindMatch[2] ? findNodeByLabel(journey, addKindMatch[2]) : (selectedNodeId ? journey.nodes.find((n) => n.id === selectedNodeId) : journey.nodes.find((n) => n.type === 'vision'));
    if (target) {
      const label = type === 'research' ? `Research: ${target.label}` : type === 'risk' ? `Risk in ${target.label}` : `Resource for ${target.label}`;
      const newNode = baseNode({ id: makeId('n'), type, label, parentId: target.id });
      const relation: RelationType = type === 'risk' ? 'blocks' : type === 'research' ? 'researches' : 'uses';
      const newEdge: JourneyEdge = { id: makeId('e'), source: type === 'risk' ? newNode.id : target.id, target: type === 'risk' ? target.id : newNode.id, relation };
      const next = autoLayout({ nodes: [...journey.nodes, newNode], edges: [...journey.edges, newEdge] });
      return { journey: next, summary: `Adding a ${type} node to "${target.label}".`, changedNodeIds: [newNode.id] };
    }
  }

  return null;
}
