import { useEffect, useRef, useState } from 'react';

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PersistedWindowState {
  rect: WindowRect;
  minimized: boolean;
}

const EDGE_MARGIN = 12;

export function clampRectToViewport(rect: WindowRect): WindowRect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(rect.width, Math.max(vw - EDGE_MARGIN * 2, 160));
  const height = Math.min(rect.height, Math.max(vh - EDGE_MARGIN * 2, 120));
  const x = Math.min(Math.max(rect.x, EDGE_MARGIN), Math.max(vw - width - EDGE_MARGIN, EDGE_MARGIN));
  const y = Math.min(Math.max(rect.y, EDGE_MARGIN), Math.max(vh - height - EDGE_MARGIN, EDGE_MARGIN));
  return { x, y, width, height };
}

/**
 * Remembers a floating window's position/size/minimized state for the
 * duration of the browser session (sessionStorage, not localStorage \u2014
 * a fresh visit should get a clean default layout, matching how the rest
 * of Plan's ephemeral UI state already behaves). Keyed by `id` so multiple
 * independent floating windows don't collide.
 */
export function useFloatingWindowPersistence(id: string, defaultRect: WindowRect) {
  const storageKey = `shift-window-${id}`;
  const hasHydrated = useRef(false);

  const [rect, setRectState] = useState<WindowRect>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) return clampRectToViewport((JSON.parse(saved) as PersistedWindowState).rect);
    } catch {
      // ignore malformed/unavailable storage
    }
    return clampRectToViewport(defaultRect);
  });

  const [minimized, setMinimizedState] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) return (JSON.parse(saved) as PersistedWindowState).minimized;
    } catch {
      // ignore
    }
    return false;
  });

  useEffect(() => {
    hasHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ rect, minimized } satisfies PersistedWindowState));
    } catch {
      // ignore quota/availability errors \u2014 losing persistence isn't fatal
    }
  }, [rect, minimized, storageKey]);

  // Keep the window on-screen if the viewport itself resizes (e.g. rotating a tablet).
  useEffect(() => {
    function onResize() {
      setRectState((r) => clampRectToViewport(r));
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return { rect, setRect: setRectState, minimized, setMinimized: setMinimizedState };
}
