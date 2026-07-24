import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import ProtectedRoute from './components/app/ProtectedRoute';
import AppLayout from './pages/app/AppLayout';
import Tasks from './pages/app/Tasks';
import BuildInPublic from './pages/app/BuildInPublic';
import Plan from './pages/app/Plan';
import PlanCollect from './pages/app/PlanCollect';
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
          <Route index element={<Tasks />} />
          <Route path="plan" element={<Plan />} />
          <Route path="plan/collect" element={<PlanCollect />} />
          <Route path="build-in-public" element={<BuildInPublic />} />
        </Route>

        {/* Ephemeral, distraction-free full-bleed screen: no sidebar/topbar */}
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
