import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatCard } from '@/components/ui/stat-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { mockResources, mockCounties, mockAlerts } from '@/lib/mock-data';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  Activity,
  Upload,
  Download,
  Zap,
  ThermometerSun
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { 
    resources, 
    counties, 
    alerts,
    setResources, 
    setCounties,
    isLoading, 
    setIsLoading 
  } = useAppStore();
  
  const [inventoryText, setInventoryText] = useState('');

  useEffect(() => {
    // Load mock data
    setCounties(mockCounties);
    setResources(mockResources);
  }, [setCounties, setResources]);

  const parseInventory = () => {
    if (!inventoryText.trim()) {
      toast.error('Please enter inventory data');
      return;
    }

    setIsLoading(true);
    
    // Simulate parsing with realistic delay
    setTimeout(() => {
      const lines = inventoryText.split('\n').filter(line => line.trim());
      const newResources = lines.map((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        return {
          id: `parsed-${Date.now()}-${index}`,
          resource_name: parts[0] || `Resource ${index + 1}`,
          category: parts[1] || 'General',
          unit: parts[2] || 'units',
          available_qty: parseInt(parts[3]) || 1,
          disaster_tags: parts[4] ? parts[4].split(';').map(t => t.trim()) : ['general_emergency']
        };
      });

      setResources([...resources, ...newResources]);
      setInventoryText('');
      setIsLoading(false);
      toast.success(`Parsed ${newResources.length} resources successfully`);
    }, 1500);
  };

  const exportData = () => {
    const csvContent = resources.map(r => 
      `${r.resource_name},${r.category},${r.unit},${r.available_qty},${r.disaster_tags.join(';')}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resource-inventory.csv';
    a.click();
    
    toast.success('Resource inventory exported');
  };

  const totalResources = resources.reduce((sum, r) => sum + r.available_qty, 0);
  const totalCounties = counties.length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const avgRiskScore = counties.length > 0 
    ? counties.reduce((sum, c) => sum + c.computed_risk_score, 0) / counties.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Emergency Operations Dashboard</h1>
          <p className="text-muted-foreground">
            Resource inventory management and risk monitoring
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Resources"
          value={totalResources.toLocaleString()}
          change="+12% from last month"
          changeType="positive"
          icon={<Shield className="h-4 w-4" />}
        />
        <StatCard
          title="Counties Monitored"
          value={totalCounties}
          description="Active monitoring zones"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Critical Alerts"
          value={criticalAlerts}
          change={criticalAlerts > 0 ? "Immediate attention required" : "All systems normal"}
          changeType={criticalAlerts > 0 ? "negative" : "positive"}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Risk Score"
          value={avgRiskScore.toFixed(1)}
          change={avgRiskScore > 80 ? "High risk period" : "Moderate risk"}
          changeType={avgRiskScore > 80 ? "negative" : "neutral"}
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Resource Inventory Input</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter inventory data (one item per line):
Cooling Centers, Shelter, capacity, 1000, extreme_heat;power_outage
Water Bottles, Relief, cases, 500, extreme_heat;drought
Air Monitors, Equipment, units, 25, air_quality;wildfire"
              value={inventoryText}
              onChange={(e) => setInventoryText(e.target.value)}
              rows={6}
              className="min-h-[150px]"
            />
            <Button 
              onClick={parseInventory}
              disabled={isLoading || !inventoryText.trim()}
              className="w-full"
            >
              {isLoading ? 'Parsing...' : 'Parse & Add Resources'}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Recent Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-surface">
                  <div className={`p-1 rounded-full ${
                    alert.severity === 'critical' ? 'bg-emergency' :
                    alert.severity === 'high' ? 'bg-warning' :
                    'bg-muted'
                  }`}>
                    {alert.alert_type === 'extreme_heat' ? (
                      <ThermometerSun className="h-3 w-3 text-white" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {alert.predicted_date}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Resource Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Available Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Disaster Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.resource_name}</TableCell>
                  <TableCell>{resource.category}</TableCell>
                  <TableCell>{resource.available_qty.toLocaleString()}</TableCell>
                  <TableCell>{resource.unit}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {resource.disaster_tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}