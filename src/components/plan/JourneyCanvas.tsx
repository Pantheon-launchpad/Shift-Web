import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, MiniMap,
  useNodesState, useEdgesState, useReactFlow, applyNodeChanges,
  type Node as RFNode, type Edge as RFEdge, type Connection, type NodeMouseHandler,
  type OnConnect, type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimatePresence } from 'framer-motion';
import { LayoutGrid, Redo2, Search, SlidersHorizontal, Sparkles, Undo2, X } from 'lucide-react';
import type { Goal } from '../../stores/useAppStore';
import type { Journey, JourneyNode, JourneyNodeType, Perspective } from '../../lib/journey';
import {
  RELATION_LABELS, RELATION_COLOR, TYPE_ACCENT, autoLayout, branchProgress, connectedNodeIds, expandNodeWithAI,
} from '../../lib/journey';
import JourneyNodeCard, { type JourneyNodeCardData } from './JourneyNodeCard';
import JourneyInspector from './JourneyNodeDetail';
import JourneyContextMenu from './JourneyContextMenu';
import { buildNodeContextMenu, type ContextMenuAction } from './journeyContextMenuActions';
import ExpandWithAIMenu from './ExpandWithAIMenu';
import JourneyCommandBar from './JourneyCommandBar';
import { TYPE_ICON, FALLBACK_ICON, TYPE_LABEL } from './journeyNodeVisuals';

const nodeTypes = { journeyNode: JourneyNodeCard };

function findRealTaskDone(goal: Goal, taskId: string): boolean | null {
  for (const m of goal.roadmap.milestones) {
    const t = m.tasks.find((x) => x.id === taskId);
    if (t) return t.done;
  }
  return null;
}

function isHiddenByCollapse(journey: Journey, node: JourneyNode): boolean {
  let current = node.parentId ? journey.nodes.find((n) => n.id === node.parentId) : undefined;
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    if (current.collapsed) return true;
    seen.add(current.id);
    current = current.parentId ? journey.nodes.find((n) => n.id === current!.parentId) : undefined;
  }
  return false;
}

interface Proposal {
  message: string;
  journey: Journey;
  summary: string;
  changedNodeIds: string[];
}

function JourneyCanvasInner({
  goal,
  journey,
  selectedNodeId,
  onSelectNode,
  onUpdateJourney,
}: {
  goal: Goal;
  journey: Journey;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateJourney: (journey: Journey) => void;
}) {
  const rf = useReactFlow();
  const [nodes, setNodes] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChangeRF] = useEdgesState<RFEdge>([]);
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [expandMenu, setExpandMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState<Set<JourneyNodeType>>(new Set());
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [previewJourney, setPreviewJourney] = useState<Journey | null>(null);
  const historyRef = useRef<Journey[]>([]);
  const futureRef = useRef<Journey[]>([]);
  const [historyLength, setHistoryLength] = useState(0);
  const [futureLength, setFutureLength] = useState(0);
  const didInitialFit = useRef(false);

  const selectedNode = journey.nodes.find((n) => n.id === selectedNodeId) ?? null;
  const highlighted = useMemo(() => (selectedNodeId ? connectedNodeIds(journey, selectedNodeId) : null), [journey, selectedNodeId]);

  const commit = useCallback(
    (next: Journey, pushHistory = true) => {
      if (pushHistory) {
        historyRef.current = [...historyRef.current.slice(-19), journey];
        futureRef.current = [];
        setHistoryLength(historyRef.current.length);
        setFutureLength(0);
      }
      onUpdateJourney(next);
    },
    [journey, onUpdateJourney]
  );

  // Derive React Flow's node/edge arrays from the domain Journey (+ live
  // roadmap status) any time the journey, goal, selection, or filters
  // change. Drag-in-progress positions live in RF's own state via
  // onNodesChangeRF and are only written back to the domain model on
  // drag-stop, so this effect never fights an in-progress drag.
  useEffect(() => {
    const displayJourney = previewJourney ?? journey;
    const rfNodes: RFNode[] = displayJourney.nodes
      .filter((n) => !isHiddenByCollapse(displayJourney, n) && !hiddenTypes.has(n.type))
      .map((n) => {
        let status = n.status;
        let progress: number | null = null;
        if (n.type === 'task' && n.taskId) {
          const done = findRealTaskDone(goal, n.taskId);
          if (done != null) status = done ? 'done' : 'todo';
        }
        if (n.type === 'milestone' && n.milestoneId) {
          const m = goal.roadmap.milestones.find((x) => x.id === n.milestoneId);
          if (m) status = m.status === 'done' ? 'done' : m.status === 'current' ? 'in-progress' : 'todo';
        }
        if (n.type === 'vision' || n.type === 'milestone') progress = branchProgress(displayJourney, n.id);

        const isProposalChange = proposal?.changedNodeIds.includes(n.id);
        const data: JourneyNodeCardData = {
          label: n.label,
          description: n.description,
          type: n.type,
          status,
          priority: n.priority,
          accent: TYPE_ACCENT[n.type],
          locked: n.locked,
          dimmed: highlighted ? !highlighted.has(n.id) : false,
          emphasized: !!isProposalChange,
          progress,
          isVision: n.type === 'vision',
        };
        return {
          id: n.id,
          type: 'journeyNode',
          position: { x: n.x, y: n.y },
          selected: n.id === selectedNodeId,
          draggable: !n.locked,
          data: data as unknown as Record<string, unknown>,
        };
      });

    const rfEdges: RFEdge[] = displayJourney.edges
      .filter((e) => rfNodes.some((n) => n.id === e.source) && rfNodes.some((n) => n.id === e.target))
      .map((e) => {
        const color = RELATION_COLOR[e.relation];
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? 'right',
          targetHandle: e.targetHandle ?? 'left',
          label: RELATION_LABELS[e.relation],
          style: { stroke: color, strokeWidth: 1.4, opacity: 0.75 },
          labelStyle: { fill: color, fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600 },
          labelBgStyle: { fill: 'var(--ink-1)', fillOpacity: 0.9 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
          animated: false,
        };
      });

    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [journey, previewJourney, goal, selectedNodeId, highlighted, hiddenTypes, proposal, setNodes, setEdges]);

  // Fit the view once, the first time a journey actually has nodes.
  useEffect(() => {
    if (!didInitialFit.current && nodes.length > 0) {
      didInitialFit.current = true;
      const savedViewport = journey.viewport;
      if (savedViewport) {
        rf.setViewport(savedViewport, { duration: 0 });
      } else {
        setTimeout(() => rf.fitView({ padding: 0.25, duration: 0 }), 30);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);

  const persistNodePositions = useCallback(
    (finalNodes: RFNode[]) => {
      const next: Journey = {
        ...journey,
        nodes: journey.nodes.map((n) => {
          const rfNode = finalNodes.find((x) => x.id === n.id);
          return rfNode ? { ...n, x: rfNode.position.x, y: rfNode.position.y } : n;
        }),
      };
      commit(next);
    },
    [journey, commit]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      const dragFinished = changes.some((c) => c.type === 'position' && c.dragging === false);
      if (dragFinished) {
        setNodes((nds) => {
          persistNodePositions(nds);
          return nds;
        });
      }
      const removed = changes.filter((c) => c.type === 'remove').map((c) => c.id);
      if (removed.length > 0) {
        const toRemove = new Set(removed);
        const next: Journey = {
          ...journey,
          nodes: journey.nodes.filter((n) => !toRemove.has(n.id)),
          edges: journey.edges.filter((e) => !toRemove.has(e.source) && !toRemove.has(e.target)),
        };
        commit(next);
        if (selectedNodeId && toRemove.has(selectedNodeId)) onSelectNode(null);
      }
    },
    [setNodes, persistNodePositions, journey, commit, selectedNodeId, onSelectNode]
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const next: Journey = {
        ...journey,
        edges: [
          ...journey.edges,
          {
            id: `e_${Date.now()}`,
            source: connection.source,
            target: connection.target,
            relation: 'related-to',
            sourceHandle: connection.sourceHandle ?? undefined,
            targetHandle: connection.targetHandle ?? undefined,
          },
        ],
      };
      commit(next);
    },
    [journey, commit]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      onSelectNode(node.id);
      setContextMenu(null);
    },
    [onSelectNode]
  );

  const onNodeDoubleClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const ids = connectedNodeIds(journey, node.id);
      const focusNodes = nodes.filter((n) => ids.has(n.id));
      if (focusNodes.length) rf.fitView({ nodes: focusNodes, padding: 0.4, duration: 400 });
    },
    [journey, nodes, rf]
  );

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
    setContextMenu(null);
    setExpandMenu(null);
  }, [onSelectNode]);

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: RFNode) => {
    e.preventDefault();
    onSelectNode(node.id);
    setContextMenu({ nodeId: node.id, x: e.clientX, y: e.clientY });
  }, [onSelectNode]);

  const updateNode = useCallback(
    (nodeId: string, patch: Partial<JourneyNode>) => {
      commit({ ...journey, nodes: journey.nodes.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)) });
    },
    [journey, commit]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      const toRemove = new Set([nodeId]);
      journey.edges.forEach((e) => {
        if (e.source === nodeId) toRemove.add(e.target);
      });
      commit({
        nodes: journey.nodes.filter((n) => !toRemove.has(n.id)),
        edges: journey.edges.filter((e) => !toRemove.has(e.source) && !toRemove.has(e.target)),
      });
      if (selectedNodeId === nodeId) onSelectNode(null);
    },
    [journey, commit, selectedNodeId, onSelectNode]
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const node = journey.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const copy: JourneyNode = { ...node, id: `n_${Date.now()}`, x: node.x + 40, y: node.y + 40, label: `${node.label} copy` };
      commit({ ...journey, nodes: [...journey.nodes, copy] });
      onSelectNode(copy.id);
    },
    [journey, commit, onSelectNode]
  );

  const handleExpandWithAI = useCallback(
    (nodeId: string, perspective: Perspective) => {
      const result = expandNodeWithAI(journey, nodeId, perspective);
      commit(result.journey);
      setExpandMenu(null);
    },
    [journey, commit]
  );

  const handleAutoArrange = useCallback(() => {
    commit(autoLayout(journey));
    setTimeout(() => rf.fitView({ padding: 0.25, duration: 400 }), 30);
  }, [journey, commit, rf]);

  const handleUndo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    futureRef.current = [journey, ...futureRef.current];
    setHistoryLength(historyRef.current.length);
    setFutureLength(futureRef.current.length);
    onUpdateJourney(prev);
  }, [journey, onUpdateJourney]);

  const handleRedo = useCallback(() => {
    const next = futureRef.current.shift();
    if (!next) return;
    historyRef.current = [...historyRef.current, journey];
    setHistoryLength(historyRef.current.length);
    setFutureLength(futureRef.current.length);
    onUpdateJourney(next);
  }, [journey, onUpdateJourney]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        deleteNode(selectedNodeId);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && selectedNodeId) {
        e.preventDefault();
        duplicateNode(selectedNodeId);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setFilterOpen(false);
        setContextMenu(null);
        setExpandMenu(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo, selectedNodeId, deleteNode, duplicateNode]);

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return journey.nodes.filter((n) => n.label.toLowerCase().includes(q));
  }, [journey.nodes, searchQuery]);

  const focusOnNode = useCallback(
    (nodeId: string) => {
      const rfNode = nodes.find((n) => n.id === nodeId);
      if (rfNode) rf.fitView({ nodes: [rfNode], padding: 0.6, duration: 400 });
      onSelectNode(nodeId);
    },
    [nodes, rf, onSelectNode]
  );

  function acceptProposal() {
    if (!proposal) return;
    commit(proposal.journey);
    setProposal(null);
    setPreviewJourney(null);
  }
  function rejectProposal() {
    setProposal(null);
    setPreviewJourney(null);
    setAnswer(null);
  }
  function handlePreview(p: Proposal | null) {
    setAnswer(null);
    if (!p) {
      setProposal(null);
      setPreviewJourney(null);
      return;
    }
    if (p.changedNodeIds.length === 0 && p.journey === journey) {
      setAnswer(p.summary);
      setProposal(null);
      setPreviewJourney(null);
    } else {
      setProposal(p);
      setPreviewJourney(p.journey);
    }
  }

  const contextActions: ContextMenuAction[] = useMemo(
    () => (contextMenu ? buildNodeContextMenu(journey.nodes.find((n) => n.id === contextMenu.nodeId)?.locked ?? false) : []),
    [contextMenu, journey.nodes]
  );

  const handleContextAction = useCallback(
    (key: string) => {
      if (!contextMenu) return;
      const { nodeId, x, y } = contextMenu;
      switch (key) {
        case 'rename':
        case 'comment':
          onSelectNode(nodeId);
          break;
        case 'delete':
          deleteNode(nodeId);
          break;
        case 'duplicate':
          duplicateNode(nodeId);
          break;
        case 'expand':
          setExpandMenu({ nodeId, x, y });
          break;
        case 'tasks':
          handleExpandWithAI(nodeId, 'Implementation');
          break;
        case 'risks':
          handleExpandWithAI(nodeId, 'Security');
          break;
        case 'resources':
          handleExpandWithAI(nodeId, 'Operations');
          break;
        case 'lock':
          updateNode(nodeId, { locked: !journey.nodes.find((n) => n.id === nodeId)?.locked });
          break;
        case 'focus':
          focusOnNode(nodeId);
          break;
      }
    },
    [contextMenu, onSelectNode, deleteNode, duplicateNode, handleExpandWithAI, updateNode, focusOnNode, journey.nodes]
  );

  const allTypes = useMemo(() => Array.from(new Set(journey.nodes.map((n) => n.type))), [journey.nodes]);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChangeRF}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onMoveEnd={(_, viewport) => {
          const prev = journey.viewport;
          const unchanged = prev && Math.abs(prev.x - viewport.x) < 0.5 && Math.abs(prev.y - viewport.y) < 0.5 && Math.abs(prev.zoom - viewport.zoom) < 0.01;
          if (!unchanged) commit({ ...journey, viewport }, false);
        }}
        panOnScroll
        zoomOnScroll
        panOnDrag
        selectionOnDrag={false}
        minZoom={0.15}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        connectionRadius={28}
        fitView={false}
        className="journey-flow"
      >
        <Background variant={BackgroundVariant.Lines} gap={120} lineWidth={1} color="var(--line)" style={{ opacity: 0.6 }} />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.4} color="var(--line-strong)" />
        <Controls showInteractive={false} position="bottom-left" className="journey-controls" />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          maskColor="rgba(10,11,13,0.6)"
          nodeColor={() => 'var(--glass-border)'}
          nodeStrokeWidth={0}
          className="journey-minimap"
          style={{ width: 150, height: 96 }}
        />
      </ReactFlow>
      <style>{`
        .journey-controls.react-flow__controls {
          background: var(--glass-strong);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          box-shadow: var(--shadow-soft);
          overflow: hidden;
          display: flex;
          flex-direction: row;
        }
        .journey-controls .react-flow__controls-button {
          background: transparent;
          border: none;
          border-right: 1px solid var(--line);
          color: var(--text-muted);
          width: 28px;
          height: 28px;
        }
        .journey-controls .react-flow__controls-button:last-child { border-right: none; }
        .journey-controls .react-flow__controls-button:hover { background: var(--glass); color: var(--text); }
        .journey-controls .react-flow__controls-button svg { fill: currentColor; max-width: 12px; max-height: 12px; }
        .journey-minimap.react-flow__minimap {
          background: var(--glass-strong);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          box-shadow: var(--shadow-soft);
          overflow: hidden;
        }
        .journey-flow .react-flow__attribution {
          background: transparent;
          opacity: 0.35;
        }
        .journey-flow .react-flow__attribution a { color: var(--text-faint); }
        .journey-flow .react-flow__edge-path { transition: stroke-width 0.15s ease; }
        .journey-flow .react-flow__edge:hover .react-flow__edge-path { stroke-width: 2.2; }
      `}</style>

      {/* Floating toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1 p-1 rounded-full glass">
        <ToolbarButton icon={LayoutGrid} label="Auto Arrange" onClick={handleAutoArrange} />
        <ToolbarButton
          icon={Sparkles}
          label="Expand AI"
          disabled={!selectedNode}
          onClick={(e) => selectedNode && setExpandMenu({ nodeId: selectedNode.id, x: e.clientX, y: e.clientY })}
        />
        <ToolbarButton icon={Search} label="Search" active={searchOpen} onClick={() => setSearchOpen((s) => !s)} />
        <ToolbarButton icon={SlidersHorizontal} label="Filter" active={filterOpen} onClick={() => setFilterOpen((s) => !s)} />
        <div className="w-px h-4 mx-0.5" style={{ background: 'var(--line)' }} />
        <ToolbarButton icon={Undo2} label="Undo" disabled={historyLength === 0} onClick={handleUndo} />
        <ToolbarButton icon={Redo2} label="Redo" disabled={futureLength === 0} onClick={handleRedo} />
      </div>

      {searchOpen && (
        <div className="absolute top-16 left-4 z-20 w-[240px] rounded-2xl p-3 glass-strong" style={{ boxShadow: 'var(--shadow-lift)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Search size={13} color="var(--text-faint)" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes&hellip;"
              className="flex-1 bg-transparent outline-none text-[12.5px]"
              style={{ color: 'var(--text)' }}
            />
            <button onClick={() => setSearchOpen(false)} aria-label="Close search" style={{ color: 'var(--text-faint)' }}>
              <X size={12} />
            </button>
          </div>
          {searchMatches.length > 0 && (
            <div className="flex flex-col gap-0.5 max-h-[160px] overflow-y-auto">
              {searchMatches.map((n) => (
                <button key={n.id} onClick={() => focusOnNode(n.id)} className="text-left px-2 py-1.5 rounded-lg text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  {n.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {filterOpen && (
        <div className="absolute top-16 left-4 z-20 w-[200px] rounded-2xl p-3 glass-strong" style={{ boxShadow: 'var(--shadow-lift)' }}>
          <div className="font-mono text-[9.5px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>Show types</div>
          <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto">
            {allTypes.map((t) => {
              const Icon = TYPE_ICON[t] ?? FALLBACK_ICON;
              const visible = !hiddenTypes.has(t);
              return (
                <button
                  key={t}
                  onClick={() =>
                    setHiddenTypes((prev) => {
                      const next = new Set(prev);
                      if (next.has(t)) next.delete(t);
                      else next.add(t);
                      return next;
                    })
                  }
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px]"
                  style={{ color: visible ? 'var(--text)' : 'var(--text-faint)', opacity: visible ? 1 : 0.5 }}
                >
                  <Icon size={12} />
                  {TYPE_LABEL[t]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {expandMenu && (
          <ExpandWithAIMenu
            nodeLabel={journey.nodes.find((n) => n.id === expandMenu.nodeId)?.label ?? ''}
            position={{ x: expandMenu.x, y: expandMenu.y }}
            onPick={(p) => handleExpandWithAI(expandMenu.nodeId, p)}
            onClose={() => setExpandMenu(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contextMenu && <JourneyContextMenu position={{ x: contextMenu.x, y: contextMenu.y }} actions={contextActions} onAction={handleContextAction} onClose={() => setContextMenu(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNode && !previewJourney && (
          <JourneyInspector
            node={selectedNode}
            journey={journey}
            goal={goal}
            onClose={() => onSelectNode(null)}
            onUpdateNode={(patch) => updateNode(selectedNode.id, patch)}
            onDelete={() => deleteNode(selectedNode.id)}
            onDuplicate={() => duplicateNode(selectedNode.id)}
          />
        )}
      </AnimatePresence>

      <JourneyCommandBar
        journey={journey}
        selectedNodeId={selectedNodeId}
        proposal={proposal}
        answer={answer}
        onPreview={handlePreview}
        onAccept={acceptProposal}
        onReject={rejectProposal}
      />
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: typeof Search;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
      style={{ background: active ? 'rgba(131,53,253,0.14)' : 'transparent', color: active ? 'var(--violet)' : 'var(--text-muted)' }}
    >
      <Icon size={13} />
    </button>
  );
}

export default function JourneyCanvas(props: {
  goal: Goal;
  journey: Journey;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateJourney: (journey: Journey) => void;
}) {
  return (
    <ReactFlowProvider>
      <JourneyCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
