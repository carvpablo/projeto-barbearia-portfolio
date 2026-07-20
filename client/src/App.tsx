import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './lib/store';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { BookingPage } from './pages/BookingPage';
import { DashboardClientPage } from './pages/DashboardClientPage';
import { DashboardBarberPage } from './pages/DashboardBarberPage';
import { DashboardAdminPage } from './pages/DashboardAdminPage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user?.role === 'BARBER') return <Navigate to="/barber" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Hide navbar on auth pages
function Layout({ children, hideNav }: { children: React.ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && <Navbar />}
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/login" element={<AuthRoute><Layout hideNav><AuthPage mode="login" /></Layout></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Layout hideNav><AuthPage mode="register" /></Layout></AuthRoute>} />
          <Route path="/booking" element={<Layout><BookingPage /></Layout>} />
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['CLIENT']}>
              <Layout><DashboardClientPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/barber" element={
            <ProtectedRoute roles={['BARBER']}>
              <Layout><DashboardBarberPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}>
              <Layout><DashboardAdminPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
