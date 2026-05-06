import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Sun, Menu, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Navigate } from 'react-router-dom';

export const DashboardHeader = () => {
  const { toggleSidebar } = useSidebar();
  const { actualTheme, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">
        {/* Left side */}
        <div className="dashboard-header-left">

          {/* Breadcrumb / greeting */}
          <div className="hidden sm:flex flex-col">
            <span className="dashboard-greeting">
              Bem-vindo de volta 👋
            </span>
            <span className="dashboard-subtitle">
              {user?.email || 'Usuário'}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="dashboard-header-right">
          <NotificationBell />


          <button
            onClick={handleSignOut}
            className="header-signout-btn hidden sm:flex"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export const DashboardLayout = () => {
  const {
    user,
    loading,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const isPageReload = navigation && navigation.type === 'reload';
    if (isPageReload && location.pathname !== '/dashboard') {
      navigate('/dashboard', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-inner">
          <div className="loading-spinner" />
          <p className="loading-text">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <div className="dashboard-root">
        <AppSidebar />
        <div className="dashboard-content">
          <DashboardHeader />
          <main className="dashboard-main">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};