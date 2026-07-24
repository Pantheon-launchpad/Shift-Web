import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Minimize2, Minus, X } from 'lucide-react';
import { usePointerDrag } from '../../hooks/usePointerDrag';
import { useFloatingWindowPersistence, clampRectToViewport, type WindowRect } from '../../hooks/useFloatingWindowPersistence';

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const SNAP_THRESHOLD = 24;
const EDGE_MARGIN = 12;

const CURSOR_BY_CORNER: Record<Corner, string> = {
  tl: 'nwse-resize',
  br: 'nwse-resize',
  tr: 'nesw-resize',
  bl: 'nesw-resize',
};

export interface FloatingWindowProps {
  /** Persistence key \u2014 must be stable and unique per independent floating window. */
  id: string;
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  headerAccessory?: React.ReactNode;
  defaultRect: WindowRect;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  /** Width used while minimized \u2014 defaults to the current width. */
  minimizedWidth?: number;
  resizable?: boolean;
  accentColor?: string;
  children: React.ReactNode;
  /** Rendered instead of `children` while minimized. Falls back to nothing (header-only pill) if omitted. */
  minimizedContent?: React.ReactNode;
}

/**
 * The presentation layer for any "floating mini-app" feature \u2014 Focus
 * timer, task progress, or anything added later. Owns window chrome only
 * (position, size, minimize/maximize/close, drag, resize, snapping,
 * session persistence); it knows nothing about what it's displaying.
 * Rendered through a portal directly on `document.body` so it can never be
 * clipped or repositioned by an ancestor's layout, and sits at a z-index
 * high enough to stay above everything else in the app, including other
 * modals.
 */
export default function FloatingWindow({
  id,
  isOpen,
  onClose,
  title,
  headerAccessory,
  defaultRect,
  minWidth = 220,
  minHeight = 120,
  maxWidth = 520,
  maxHeight = 640,
  minimizedWidth,
  resizable = true,
  accentColor = 'var(--violet)',
  children,
  minimizedContent,
}: FloatingWindowProps) {
  const { rect, setRect, minimized, setMinimized } = useFloatingWindowPersistence(id, defaultRect);
  const [maximized, setMaximized] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const preMaximizeRect = useRef<WindowRect | null>(null);
  const dragStartRect = useRef<WindowRect>(rect);
  const resizeStartRect = useRef<WindowRect>(rect);

  // Re-clamp once on open in case the saved position no longer fits (e.g. a
  // much smaller viewport since the last session).
  useEffect(() => {
    if (isOpen) setRect((r) => clampRectToViewport(r));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const beginDrag = useCallback(() => {
    dragStartRect.current = rect;
    setIsInteracting(true);
  }, [rect]);

  const onHeaderMove = useCallback(
    (dx: number, dy: number) => {
      const start = dragStartRect.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const x = Math.min(Math.max(start.x + dx, -start.width + 60), vw - 60);
      const y = Math.min(Math.max(start.y + dy, 0), vh - 40);
      setRect((r) => ({ ...r, x, y }));
    },
    [setRect]
  );

  const onHeaderDragEnd = useCallback(() => {
    setIsInteracting(false);
    setRect((r) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let { x, y } = r;
      if (x < SNAP_THRESHOLD) x = EDGE_MARGIN;
      else if (x + r.width > vw - SNAP_THRESHOLD) x = vw - r.width - EDGE_MARGIN;
      if (y < SNAP_THRESHOLD) y = EDGE_MARGIN;
      else if (y + r.height > vh - SNAP_THRESHOLD) y = vh - r.height - EDGE_MARGIN;
      return clampRectToViewport({ ...r, x, y });
    });
  }, [setRect]);

  const headerPointerDown = usePointerDrag(onHeaderMove, onHeaderDragEnd);

  const makeResizeHandler = (corner: Corner) => {
    const beginResize = () => {
      resizeStartRect.current = rect;
      setIsInteracting(true);
    };
    const onResizeMove = (dx: number, dy: number) => {
      const start = resizeStartRect.current;
      let width = start.width;
      let height = start.height;
      let x = start.x;
      let y = start.y;

      if (corner === 'br' || corner === 'tr') width = clamp(start.width + dx, minWidth, maxWidth);
      if (corner === 'bl' || corner === 'tl') width = clamp(start.width - dx, minWidth, maxWidth);
      if (corner === 'br' || corner === 'bl') height = clamp(start.height + dy, minHeight, maxHeight);
      if (corner === 'tr' || corner === 'tl') height = clamp(start.height - dy, minHeight, maxHeight);

      if (corner === 'bl' || corner === 'tl') x = start.x + (start.width - width);
      if (corner === 'tr' || corner === 'tl') y = start.y + (start.height - height);

      setRect({ x, y, width, height });
    };
    const onResizeEnd = () => {
      setIsInteracting(false);
      setRect((r) => clampRectToViewport(r));
    };
    return { beginResize, onResizeMove, onResizeEnd };
  };

  function toggleMaximize() {
    if (!maximized) {
      preMaximizeRect.current = rect;
      setRect(clampRectToViewport({ x: EDGE_MARGIN, y: EDGE_MARGIN, width: window.innerWidth - EDGE_MARGIN * 2, height: window.innerHeight - EDGE_MARGIN * 2 }));
    } else if (preMaximizeRect.current) {
      setRect(clampRectToViewport(preMaximizeRect.current));
    }
    setMaximized((m) => !m);
  }

  if (!isOpen) return null;

  const displayWidth = minimized ? (minimizedWidth ?? rect.width) : rect.width;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key={id}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed select-none"
        style={{
          left: rect.x,
          top: rect.y,
          width: displayWidth,
          height: minimized ? 'auto' : rect.height,
          zIndex: 2147483000,
          transition: isInteracting ? 'none' : 'width 0.2s ease, height 0.2s ease, left 0.2s ease, top 0.2s ease',
        }}
      >
        <div
          className="w-full h-full rounded-2xl glass-strong flex flex-col overflow-hidden"
          style={{ boxShadow: '0 20px 60px -12px rgba(0,0,0,0.5), 0 8px 24px -4px rgba(0,0,0,0.35)', border: '1px solid var(--glass-border)' }}
        >
          {/* Header \u2014 the drag handle */}
          <div
            onPointerDown={(e) => {
              beginDrag();
              headerPointerDown(e);
            }}
            className="flex items-center justify-between pl-3.5 pr-2 py-2.5 cursor-grab active:cursor-grabbing shrink-0"
            style={{ borderBottom: minimized ? 'none' : '1px solid var(--line)', touchAction: 'none' }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="dot shrink-0" style={{ background: accentColor }} />
              <span className="font-mono text-[10px] uppercase tracking-wide truncate" style={{ color: 'var(--text-faint)' }}>
                {title}
              </span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {headerAccessory}
              <WindowButton onPointerDown={(e) => e.stopPropagation()} onClick={() => setMinimized(!minimized)} label={minimized ? 'Restore' : 'Minimize'}>
                <Minus size={11} />
              </WindowButton>
              <WindowButton onPointerDown={(e) => e.stopPropagation()} onClick={toggleMaximize} label={maximized ? 'Restore' : 'Maximize'}>
                {maximized ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
              </WindowButton>
              <WindowButton onPointerDown={(e) => e.stopPropagation()} onClick={onClose} label="Close">
                <X size={12} />
              </WindowButton>
            </div>
          </div>

          {/* Body */}
          {minimized ? (
            minimizedContent ?? null
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
          )}
        </div>

        {/* Corner resize handles \u2014 not shown while minimized or maximized */}
        {resizable && !minimized && !maximized && (
          <>
            {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((corner) => {
              const { beginResize, onResizeMove, onResizeEnd } = makeResizeHandler(corner);
              return <ResizeHandle key={corner} corner={corner} onMove={onResizeMove} onEnd={onResizeEnd} onBegin={beginResize} />;
            })}
          </>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function WindowButton({
  children,
  onClick,
  onPointerDown,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  label: string;
}) {
  return (
    <button
      onPointerDown={onPointerDown}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
      style={{ color: 'var(--text-faint)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--glass)';
        e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-faint)';
      }}
    >
      {children}
    </button>
  );
}

const HANDLE_POSITION: Record<Corner, React.CSSProperties> = {
  tl: { top: -6, left: -6 },
  tr: { top: -6, right: -6 },
  bl: { bottom: -6, left: -6 },
  br: { bottom: -6, right: -6 },
};

function ResizeHandle({
  corner,
  onMove,
  onEnd,
  onBegin,
}: {
  corner: Corner;
  onMove: (dx: number, dy: number) => void;
  onEnd: () => void;
  onBegin: () => void;
}) {
  const pointerDown = usePointerDrag(onMove, onEnd);
  return (
    <div
      onPointerDown={(e) => {
        onBegin();
        pointerDown(e);
      }}
      className="absolute w-4 h-4 z-10"
      style={{ ...HANDLE_POSITION[corner], cursor: CURSOR_BY_CORNER[corner], touchAction: 'none' }}
    />
  );
}
