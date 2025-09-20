import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/ui/risk-badge';
import { StatCard } from '@/components/ui/stat-card';
import { useAppStore } from '@/lib/store';
import { mockCounties, mockResources, mockScenarios } from '@/lib/mock-data';
import { 
  Calculator,
  Target,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Allocation() {
  const { 
    counties, 
    resources, 
    scenarios,
    selectedScenario,
    isLoading,
    setCounties, 
    setResources,
    addScenario,
    setSelectedScenario,
    setIsLoading 
  } = useAppStore();

  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    setCounties(mockCounties);
    setResources(mockResources);
  }, [setCounties, setResources]);

  const runOptimization = async () => {
    setOptimizing(true);
    setIsLoading(true);
    
    // Simulate optimization algorithm
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create optimized allocation scenario
    const newScenario = {
      id: `scenario-${Date.now()}`,
      name: `Optimization Run ${new Date().toLocaleTimeString()}`,
      created_at: new Date().toISOString(),
      total_resources: resources.reduce((sum, r) => sum + r.available_qty, 0),
      counties_served: counties.length,
      optimization_objective: 'minimize_risk_exposure',
      allocations: counties.flatMap(county => 
        resources
          .filter(resource => 
            (county.computed_risk_score >= 90 && resource.disaster_tags.includes('extreme_heat')) ||
            (county.aqi_category === 'Unhealthy' && resource.disaster_tags.includes('air_quality'))
          )
          .map(resource => {
            // Risk-based allocation logic
            const riskMultiplier = county.computed_risk_score / 100;
            const populationFactor = Math.min(county.e_totpop / 1000000, 1);
            const baseAllocation = resource.available_qty * 0.1;
            const allocated = Math.floor(baseAllocation * riskMultiplier * populationFactor);
            
            return {
              county_id: county.id,
              resource_id: resource.id,
              allocated_quantity: allocated,
              need_met_percentage: Math.min((allocated / (county.e_totpop / 10000)) * 100, 100)
            };
          })
      )
    };

    addScenario(newScenario);
    setSelectedScenario(newScenario);
    setOptimizing(false);
    setIsLoading(false);
    
    toast.success('Resource allocation optimization completed!');
  };

  const currentScenario = selectedScenario || mockScenarios[0];
  
  const totalAllocated = currentScenario?.allocations.reduce(
    (sum, alloc) => sum + alloc.allocated_quantity, 0
  ) || 0;
  
  const avgNeedMet = currentScenario?.allocations.length > 0 
    ? currentScenario.allocations.reduce((sum, alloc) => sum + alloc.need_met_percentage, 0) / currentScenario.allocations.length
    : 0;

  const countiesWithAllocations = new Set(currentScenario?.allocations.map(a => a.county_id)).size || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resource Allocation Optimizer</h1>
          <p className="text-muted-foreground">
            Optimize resource distribution across counties based on risk scores and population needs
          </p>
        </div>
        <Button 
          onClick={runOptimization}
          disabled={optimizing || isLoading}
          className="bg-gradient-primary"
        >
          {optimizing ? (
            <>
              <Calculator className="w-4 h-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Optimization
            </>
          )}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Resources Allocated"
          value={totalAllocated.toLocaleString()}
          icon={<Target className="h-4 w-4" />}
          description="Across all counties"
        />
        <StatCard
          title="Counties Served"
          value={countiesWithAllocations}
          change={`${countiesWithAllocations}/${counties.length} counties`}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Average Need Met"
          value={`${avgNeedMet.toFixed(1)}%`}
          changeType={avgNeedMet >= 70 ? 'positive' : avgNeedMet >= 50 ? 'neutral' : 'negative'}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Optimization Status"
          value={optimizing ? "Running" : "Complete"}
          icon={optimizing ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          changeType={optimizing ? 'neutral' : 'positive'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Matrix */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Allocation Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>County</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Need Met %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentScenario?.allocations.map((allocation, index) => {
                    const county = counties.find(c => c.id === allocation.county_id);
                    const resource = resources.find(r => r.id === allocation.resource_id);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {county?.countyName || 'Unknown County'}
                        </TableCell>
                        <TableCell>
                          {county && <RiskBadge risk={county.computed_risk_score} />}
                        </TableCell>
                        <TableCell>{resource?.resource_name || 'Unknown Resource'}</TableCell>
                        <TableCell>
                          {allocation.allocated_quantity.toLocaleString()} {resource?.unit}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  allocation.need_met_percentage >= 80 ? 'bg-success' :
                                  allocation.need_met_percentage >= 60 ? 'bg-warning' :
                                  'bg-emergency'
                                }`}
                                style={{ width: `${Math.min(allocation.need_met_percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {allocation.need_met_percentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Settings & Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Objective</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Goal</label>
                <Badge variant="secondary" className="w-full justify-center">
                  Minimize Risk Exposure
                </Badge>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Constraints</label>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Limited resource availability</div>
                  <div>• Population-based distribution</div>
                  <div>• Risk score prioritization</div>
                  <div>• Disaster tag matching</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Algorithm</label>
                <div className="text-xs text-muted-foreground">
                  Multi-objective linear programming with risk-weighted allocation
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resources.slice(0, 4).map((resource) => {
                  const allocatedQty = currentScenario?.allocations
                    .filter(a => a.resource_id === resource.id)
                    .reduce((sum, a) => sum + a.allocated_quantity, 0) || 0;
                  
                  const utilizationPct = (allocatedQty / resource.available_qty) * 100;
                  
                  return (
                    <div key={resource.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{resource.resource_name}</span>
                        <span>{utilizationPct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            utilizationPct >= 80 ? 'bg-emergency' :
                            utilizationPct >= 60 ? 'bg-warning' :
                            'bg-primary'
                          }`}
                          style={{ width: `${Math.min(utilizationPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}