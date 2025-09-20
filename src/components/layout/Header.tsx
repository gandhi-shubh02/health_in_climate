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
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-foreground">
                NGO Resilience Platform
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2",
                      isActive && "bg-primary text-primary-foreground"
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
            <div className="text-sm text-muted-foreground">
              Emergency Operations Center
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}