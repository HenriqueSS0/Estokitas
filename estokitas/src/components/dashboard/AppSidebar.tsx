import { Logo } from '@/components/ui/logo';
import { Home, Package, ArrowUpDown, Code, Mail, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Produtos", url: "/dashboard/produtos", icon: Package },
  { title: "Movimentações", url: "/dashboard/movimentacoes", icon: ArrowUpDown },
  { title: "API", url: "/dashboard/api", icon: Code },
];

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const currentPath = location.pathname;

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      className="saas-sidebar"
      collapsible="none"
    >
      <SidebarContent className="saas-sidebar-content">

        {/* Logo / Brand */}
        <div className="saas-sidebar-brand expanded">
          <div className="saas-logo-wrap">
            <Logo size="sm" />
          </div>
          <div className="saas-brand-text">
            <span className="saas-brand-name">ESTOKITAS</span>
            <span className="saas-brand-email">{user?.email || 'Usuário'}</span>
          </div>
        </div>

        {/* Nav label */}
        <span className="saas-nav-label">Menu Principal</span>

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="saas-menu">
              {menuItems.map((item) => {
                const active = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} className="p-0 hover:bg-transparent">
                      <NavLink
                        to={item.url}
                        onClick={handleNavClick}
                        className={`saas-nav-item ${active ? 'active' : ''}`}
                      >
                        <div className={`saas-nav-icon ${active ? 'active' : ''}`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="saas-nav-label-text">{item.title}</span>
                        {active && (
                          <div className="saas-nav-active-dot" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom section */}
        <div className="saas-sidebar-bottom">
          <span className="saas-nav-label">Conta &amp; Suporte</span>

          <a
            href="https://mail.google.com/mail/u/0/?fs=1&to=estokitas@gmail.com&su=Suporte+Estokitas&tf=cm"
            target="_blank"
            rel="noopener noreferrer"
            className="saas-nav-item"
          >
            <div className="saas-nav-icon">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="saas-nav-label-text">Contato</span>
              <span className="saas-bottom-email">estokitas@gmail.com</span>
            </div>
          </a>

          <button
            onClick={() => signOut()}
            className="saas-nav-item danger"
          >
            <div className="saas-nav-icon danger">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="saas-nav-label-text">Sair da Conta</span>
          </button>

        </div>
      </SidebarContent>
    </Sidebar>
  );
}