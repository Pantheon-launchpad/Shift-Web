import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
