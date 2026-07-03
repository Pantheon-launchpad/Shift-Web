import { Navigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import CommandCenter from './CommandCenter';
import GoalCreation from './GoalCreation';
import Debrief from './Debrief';
import BuildInPublic from './BuildInPublic';
import FocusSession from '../../components/app/FocusSession';

export default function AppShell() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const flow = useAppStore((s) => s.flow);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (flow) {
    case 'goal':
      return <GoalCreation />;
    case 'focus':
      return <FocusSession />;
    case 'debrief':
      return <Debrief />;
    case 'share':
      return <BuildInPublic />;
    case 'command':
    default:
      return <CommandCenter />;
  }
}
