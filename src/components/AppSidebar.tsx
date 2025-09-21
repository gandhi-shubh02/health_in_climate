import { Shield, BarChart3, MapPin, AlertTriangle, Users } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const mainItems = [
  { title: 'Dashboard', url: '/', icon: BarChart3 },
  { title: 'Interactive Map', url: '/map', icon: MapPin },
  { title: 'Resource Allocation', url: '/allocation', icon: Users },
];

const alertItems = [
  { title: 'AI Alert System', url: '/predictive', icon: AlertTriangle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' 
      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
        {/* Brand Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-semibold text-foreground">AidVantage</h2>
                <p className="text-xs text-muted-foreground">Emergency Operations</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {!collapsed ? 'Operations' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-lg">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Alert System */}
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {!collapsed ? 'AI Systems' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {alertItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-lg">
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status Footer */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t border-border">
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-success">System Online</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">All services operational</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}