import { useCallback, useEffect, useRef } from 'react';

/**
 * Attaches to a `onPointerDown` handler. Tracks the pointer from drag-start
 * and reports the *total* delta since then on every move (not incremental
 * deltas), which avoids compounding rounding errors in whatever the caller
 * derives from it \u2014 a moved position, a resized rect, etc. Shared by both
 * window-dragging and corner-resizing in FloatingWindow, since the pointer
 * tracking mechanics are identical; only what the delta is used for
 * differs.
 */
export function usePointerDrag(onMove: (dx: number, dy: number) => void, onEnd?: () => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const moveRef = useRef(onMove);
  const endRef = useRef(onEnd);

  // Keep the latest callbacks available to the window listeners without
  // re-registering them \u2014 updated after render, not during it.
  useEffect(() => {
    moveRef.current = onMove;
    endRef.current = onEnd;
  });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore secondary buttons / multi-touch beyond the first pointer.
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    startRef.current = { x: e.clientX, y: e.clientY };

    const handleMove = (ev: PointerEvent) => {
      if (!startRef.current) return;
      moveRef.current(ev.clientX - startRef.current.x, ev.clientY - startRef.current.y);
    };
    const handleUp = () => {
      startRef.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      endRef.current?.();
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  }, []);

  return onPointerDown;
}
