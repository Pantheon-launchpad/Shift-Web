import {
  Copy, Crosshair, Lock, MessageSquare, Pencil, Sparkles, Trash2, Unlock,
  ListChecks, AlertTriangle, Package,
} from 'lucide-react';

export interface ContextMenuAction {
  key: string;
  label: string;
  icon: typeof Copy;
  danger?: boolean;
}

export function buildNodeContextMenu(locked: boolean): ContextMenuAction[] {
  return [
    { key: 'rename', label: 'Rename', icon: Pencil },
    { key: 'duplicate', label: 'Duplicate', icon: Copy },
    { key: 'expand', label: 'Expand with AI', icon: Sparkles },
    { key: 'tasks', label: 'Generate Tasks', icon: ListChecks },
    { key: 'risks', label: 'Generate Risks', icon: AlertTriangle },
    { key: 'resources', label: 'Generate Resources', icon: Package },
    { key: 'comment', label: 'Comment', icon: MessageSquare },
    { key: 'focus', label: 'Focus', icon: Crosshair },
    { key: 'lock', label: locked ? 'Unlock' : 'Lock', icon: locked ? Unlock : Lock },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true },
  ];
}
