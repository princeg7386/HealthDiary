import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Plus, History, Pill, User, LogOut } from 'lucide-react';

function Layout({ children, user, onLogout, activeTab }) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, path: '/dashboard' },
    { id: 'add', label: 'Add Vitals', icon: Plus, path: '/add-vitals' },
    { id: 'history', label: 'History', icon: History, path: '/history' },
    { id: 'medications', label: 'Medications', icon: Pill, path: '/medications' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <nav className="glass border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')} data-testid="logo">
              <Heart className="w-8 h-8 text-emerald-600" fill="currentColor" />
              <span className="text-xl font-bold text-emerald-900">Health Diary</span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    data-testid={`nav-${item.id}`}
                    variant="ghost"
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 ${
                      activeTab === item.id
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              data-testid="logout-btn"
              onClick={onLogout}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="md:hidden flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  data-testid={`nav-mobile-${item.id}`}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'text-emerald-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;