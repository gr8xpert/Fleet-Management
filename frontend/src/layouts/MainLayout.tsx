import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Bus,
  Wrench,
  Package,
  Users,
  CreditCard,
  FileWarning,
  Receipt,
  DollarSign,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Shield,
  Search,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  role?: 'admin' | 'manager';
  section?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, section: 'overview' },
  { name: 'Vehicles', href: '/vehicles', icon: Bus, section: 'fleet' },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench, section: 'fleet' },
  { name: 'Spare Parts', href: '/spare-parts', icon: Package, section: 'fleet' },
  { name: 'Employees', href: '/employees', icon: Users, section: 'hr' },
  { name: 'Visas', href: '/visas', icon: CreditCard, section: 'hr' },
  { name: 'Fines', href: '/fines', icon: FileWarning, section: 'finance' },
  { name: 'Expenses', href: '/expenses', icon: Receipt, section: 'finance' },
  { name: 'Income', href: '/income', icon: DollarSign, section: 'finance' },
  { name: 'Cheques', href: '/cheques', icon: CreditCard, section: 'finance' },
  { name: 'Customers', href: '/customers', icon: Building2, section: 'finance' },
  { name: 'Reports', href: '/reports', icon: BarChart3, role: 'manager', section: 'analytics' },
];

const sections = {
  overview: 'Overview',
  fleet: 'Fleet Management',
  hr: 'Human Resources',
  finance: 'Financial',
  analytics: 'Analytics',
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter((item) => {
    if (!item.role) return true;
    if (item.role === 'manager') return isManager;
    if (item.role === 'admin') return isAdmin;
    return false;
  });

  // Group navigation by section
  const groupedNav = filteredNavigation.reduce((acc, item) => {
    const section = item.section || 'other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-surface-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-primary-950/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'sidebar transform transition-transform duration-300 ease-smooth lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <span className="sidebar-brand-text">FleetPro</span>
            <p className="text-[10px] text-primary-500 font-medium tracking-wide">MANAGEMENT SYSTEM</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-2 text-primary-400 hover:text-white hover:bg-primary-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav scrollbar-hide">
          {Object.entries(groupedNav).map(([sectionKey, items]) => (
            <div key={sectionKey} className="sidebar-section">
              <h3 className="sidebar-section-title">
                {sections[sectionKey as keyof typeof sections] || sectionKey}
              </h3>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      clsx('sidebar-link', isActive && 'active')
                    }
                  >
                    <item.icon className="sidebar-link-icon" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Settings Section */}
          <div className="sidebar-section mt-auto pt-4 border-t border-primary-800/50">
            <h3 className="sidebar-section-title">Settings</h3>
            {isAdmin && (
              <NavLink
                to="/users"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  clsx('sidebar-link', isActive && 'active')
                }
              >
                <Shield className="sidebar-link-icon" />
                <span>User Management</span>
              </NavLink>
            )}
            <NavLink
              to="/settings"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx('sidebar-link', isActive && 'active')
              }
            >
              <Settings className="sidebar-link-icon" />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* User Card in Sidebar */}
        <div className="p-4 border-t border-primary-800/50">
          <div className="flex items-center gap-3 px-3 py-2 bg-primary-800/30">
            <div className="avatar avatar-sm bg-gradient-to-br from-accent-500 to-accent-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-primary-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-icon"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="header-search hidden sm:flex">
              <Search className="w-4 h-4 text-primary-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="flex-1"
              />
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-primary-400 bg-surface-200">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications - Static bell icon */}
            <button className="btn-icon">
              <Bell className="w-5 h-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-surface-100 transition-colors"
              >
                <div className="avatar avatar-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-primary-800">{user?.name}</p>
                  <p className="text-xs text-primary-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className={clsx(
                  'w-4 h-4 text-primary-400 transition-transform duration-200',
                  userMenuOpen && 'rotate-180'
                )} />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="dropdown">
                    <div className="px-4 py-3 border-b border-primary-100">
                      <p className="text-sm font-semibold text-primary-900">{user?.name}</p>
                      <p className="text-xs text-primary-500 mt-0.5">{user?.email}</p>
                      <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-accent-100 text-accent-700">
                        <Sparkles className="w-3 h-3" />
                        {user?.role}
                      </span>
                    </div>
                    <NavLink
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="dropdown-item"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </NavLink>
                    <div className="dropdown-divider" />
                    <button
                      onClick={handleLogout}
                      className="dropdown-item w-full text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 animate-fade-in">
          {/* Breadcrumb / Welcome */}
          <div className="mb-6">
            <p className="text-sm text-primary-500">
              {getGreeting()}, <span className="font-medium text-primary-700">{user?.name?.split(' ')[0]}</span>
            </p>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
