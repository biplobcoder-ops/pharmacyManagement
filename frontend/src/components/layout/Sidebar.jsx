// src/components/layout/Sidebar.jsx

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { SIDEBAR_ITEMS, APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import SidebarItem from './SidebarItem';
import { toggleSidebar, closeSidebar } from '@/features/ui/uiSlice';

export default function Sidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { collapsed, mobileOpen } = useSelector((state) => state.ui);
  const user = useSelector((state) => state.auth.user);
  const notificationCount = useSelector((state) => state.ui.notificationCount || 0);

  // ✅ Effective permissions — role default + override
  const getEffectivePermissions = () => {
    if (!user) return [];
    if (user.role?.name === 'admin') return ['*'];
    if (user.permissionsOverride?.length > 0) {
      return user.permissionsOverride;
    }
    return user.role?.permissions || [];
  };

  const permissions = getEffectivePermissions();
  const isAdmin = user?.role?.name === 'admin';

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (isAdmin) return true;
    if (permissions.includes('*')) return true;
    if (permissions.includes(permission)) return true;
    const [module] = permission.split(':');
    if (permissions.includes(`${module}:manage`)) return true;
    return false;
  };

  const hasAnyPermission = (permissionsList) => {
    if (!permissionsList || permissionsList.length === 0) return true;
    return permissionsList.some((p) => hasPermission(p));
  };

  const filterItems = (items) => {
    return items.filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.requiredAnyPermission) {
        return hasAnyPermission(item.requiredAnyPermission);
      }
      if (item.requiredPermission) {
        return hasPermission(item.requiredPermission);
      }
      return true;
    });
  };

  const filteredSections = SIDEBAR_ITEMS.map((section) => ({
    ...section,
    items: filterItems(section.items)
  })).filter((section) => section.items.length > 0);

  // ✅ FIX 1: Route change hole mobile sidebar auto-close
  useEffect(() => {
    if (mobileOpen) {
      dispatch(closeSidebar());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ✅ FIX 2: Body scroll lock when mobile sidebar open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // ✅ FIX 3: Escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        dispatch(closeSidebar());
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen, dispatch]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => dispatch(closeSidebar())}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-card border-r border-border flex flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center gap-2 h-16 px-4 border-b border-border shrink-0',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">{APP_NAME}</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {APP_TAGLINE}
              </p>
            </div>
          )}
        </div>

        {/* Close mobile */}
        <button
          className="absolute right-2 top-4 p-2 lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => dispatch(closeSidebar())}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
          {filteredSections.map((section) => (
            <div key={section.section}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.section}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <div key={item.path} className="relative">
                    <SidebarItem
                      {...item}
                      collapsed={collapsed}
                      badge={
                        item.badge === 'notificationCount' ? notificationCount : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Help */}
        <div className={cn('p-3 border-t border-border shrink-0', collapsed && 'px-2')}>
          {!collapsed && (
            <div className="mb-3 p-3 rounded-lg bg-muted">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">Need help?</p>
                  <p className="text-[11px] text-muted-foreground">View support center</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => dispatch(toggleSidebar('collapse'))}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
              'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
              collapsed && 'justify-center px-2'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}