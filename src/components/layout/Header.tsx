import { Shield, AlertTriangle, MapPin, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Map', href: '/map', icon: MapPin },
  { name: 'Allocation', href: '/allocation', icon: Shield },
  { name: 'Alerts', href: '/predictive', icon: AlertTriangle },
];

export function Header() {
  console.log('Header component rendering...');
  const location = useLocation();
  const navigate = useNavigate();
  console.log('Header location:', location);

  return (
    <header className="border-b border-border bg-gradient-header shadow-lg backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-white drop-shadow-sm" />
              <span className="text-xl font-semibold text-white drop-shadow-sm">
                AidVantage
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-white/20 text-white shadow-md backdrop-blur-sm border border-white/30"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/80 drop-shadow-sm">
              Emergency Operations Center
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}