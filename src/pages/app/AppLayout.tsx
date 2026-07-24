import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Background from '../../components/app/Background';
import Sidebar from '../../components/app/Sidebar';
import Topbar from '../../components/app/Topbar';
import MobileNav from '../../components/app/MobileNav';
import CommandPalette from '../../components/app/CommandPalette';
import AIAssistant from '../../components/app/AIAssistant';
import FocusWidget from '../../components/app/FocusWidget';
import TaskProgressWidget from '../../components/app/TaskProgressWidget';
import { useAppStore } from '../../stores/useAppStore';

export default function AppLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const focusWidgetOpen = useAppStore((s) => s.focusWidgetOpen);
  const activeFocusTask = useAppStore((s) => s.activeFocusTask);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative min-h-screen flex">
      <Background />
      <div className="relative z-10 flex w-full">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar onOpenPalette={() => setPaletteOpen(true)} />
          <main className="flex-1 pb-28 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNav />
      <AIAssistant />
      {focusWidgetOpen && activeFocusTask && <FocusWidget key={activeFocusTask.id} />}
      <TaskProgressWidget />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
