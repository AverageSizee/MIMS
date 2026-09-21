import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Truck, ArrowRightLeft, Undo2, Users, LogOut, UserCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { profile, isManager, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Materials', href: '/materials', icon: Package },
    { name: 'Suppliers', href: '/suppliers', icon: Users },
    { name: 'Deliveries', href: '/deliveries', icon: Truck },
    { name: 'Issuances', href: '/issuances', icon: ArrowRightLeft },
    { name: 'Returns', href: '/returns', icon: Undo2 },
  ];

  if (isManager) {
    navigation.push({ name: 'Employees', href: '/employees', icon: UserCircle });
  }

  // Close mobile menu when a route changes
  const handleNavClick = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col 
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">MIMS</h1>
            <p className="text-sm text-slate-400">Inventory Management</p>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-400 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col min-w-0">
        <header className="bg-white border-b px-4 lg:px-8 py-4 shadow-sm flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-4 text-gray-500 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
              {navigation.find((n) => n.href === location.pathname)?.name || 'MIMS'}
            </h2>
          </div>
          <div className="text-xs lg:text-sm text-gray-500 hidden sm:flex items-center truncate ml-4">
             Logged in as: <span className="font-medium text-gray-800 ml-1 truncate max-w-[120px] lg:max-w-xs">{profile?.full_name}</span>
          </div>
        </header>
        <main className="p-4 lg:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
