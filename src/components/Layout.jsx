import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Truck, ArrowRightLeft, Undo2, Users, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { profile, isManager, signOut } = useAuth();

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">MIMS</h1>
          <p className="text-sm text-slate-400">Inventory Management</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white border-b px-8 py-4 shadow-sm flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {navigation.find((n) => n.href === location.pathname)?.name || 'MIMS'}
          </h2>
          <div className="text-sm text-gray-500 flex items-center">
             Logged in as: <span className="font-medium text-gray-800 ml-1">{profile?.full_name}</span>
          </div>
        </header>
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
