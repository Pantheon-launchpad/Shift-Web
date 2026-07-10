import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import ProtectedRoute from './components/app/ProtectedRoute';
import AppLayout from './pages/app/AppLayout';
import Dashboard from './pages/app/Dashboard';
import Goals from './pages/app/Goals';
import Roadmap from './pages/app/Roadmap';
import Activity from './pages/app/Activity';
import BuildInPublic from './pages/app/BuildInPublic';
import Analytics from './pages/app/Analytics';
import Settings from './pages/app/Settings';
import Plan from './pages/app/Plan';
import GoalCreation from './pages/app/GoalCreation';
import FocusSession from './components/app/FocusSession';
import Debrief from './pages/app/Debrief';
import ShareResult from './pages/app/ShareResult';
import { useAppStore } from './stores/useAppStore';

function LoginRoute() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />

        {/* Persistent multi-page workspace: sidebar + topbar chrome */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="goals" element={<Goals />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="activity" element={<Activity />} />
          <Route path="build-in-public" element={<BuildInPublic />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="plan" element={<Plan />} />
          <Route path="planner" element={<Navigate to="/app/plan" replace />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Ephemeral, distraction-free full-bleed screens: no sidebar/topbar */}
        <Route
          path="/app/goals/new"
          element={
            <ProtectedRoute>
              <GoalCreation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/focus"
          element={
            <ProtectedRoute>
              <FocusSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/debrief"
          element={
            <ProtectedRoute>
              <Debrief />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/share"
          element={
            <ProtectedRoute>
              <ShareResult />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
