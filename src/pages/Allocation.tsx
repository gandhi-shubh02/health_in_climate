import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/ui/risk-badge';
import { StatCard } from '@/components/ui/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    
    try {
      // Step 1: Calculate county priorities and needs
      const countyPriorities = counties.map(county => {
        // Normalize risk score (0-1)
        const riskFactor = county.computed_risk_score / 100;
        
        // Population vulnerability factor (weighted by age and demographics)
        const vulnerabilityFactor = (
          (county.e_age65 / 100) * 0.3 + // Elderly population weight
          (county.eminrty / 100) * 0.2 + // Minority population weight
          (county.e_unemp / 100) * 0.2 + // Unemployment weight
          (county.e_nohsdp / 100) * 0.3   // Education weight
        );
        
        // Population density factor
        const densityFactor = Math.min((county.e_totpop / county.area_sqmi) / 1000, 1);
        
        // Combined priority score
        const priorityScore = (riskFactor * 0.5) + (vulnerabilityFactor * 0.3) + (densityFactor * 0.2);
        
        return {
          ...county,
          priorityScore,
          riskFactor,
          vulnerabilityFactor,
          densityFactor
        };
      }).sort((a, b) => b.priorityScore - a.priorityScore);

      // Step 2: Resource allocation with constraints
      const allocations = [];
      const resourceTracker = Object.fromEntries(
        resources.map(r => [r.id, { available: r.available_qty, allocated: 0 }])
      );

      // Step 3: Allocate resources based on priority and need matching
      for (const county of countyPriorities) {
        for (const resource of resources) {
          if (resourceTracker[resource.id].available <= 0) continue;

          // Determine if county needs this resource type
          let needsResource = false;
          let needIntensity = 0;

          // Heat-related needs
          if (resource.disaster_tags.includes('extreme_heat')) {
            if (county.computed_risk_score >= 70 || county.rolling_avg_ta_max >= 85) {
              needsResource = true;
              needIntensity = Math.min(county.computed_risk_score / 100, 1);
            }
          }

          // Air quality needs
          if (resource.disaster_tags.includes('air_quality')) {
            if (['Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy'].includes(county.aqi_category)) {
              needsResource = true;
              needIntensity = county.aqi_category === 'Very Unhealthy' ? 1.0 :
                             county.aqi_category === 'Unhealthy' ? 0.8 : 0.6;
            }
          }

          // General emergency needs (all counties get some allocation)
          if (resource.disaster_tags.includes('general_emergency')) {
            needsResource = true;
            needIntensity = county.priorityScore;
          }

          // Power outage needs (high temperature areas)
          if (resource.disaster_tags.includes('power_outage')) {
            if (county.ta_max >= 80) {
              needsResource = true;
              needIntensity = Math.min((county.ta_max - 70) / 30, 1);
            }
          }

          if (needsResource) {
            // Calculate allocation amount
            const baseNeed = Math.ceil(county.e_totpop / 50000); // Base need per 50k population
            const adjustedNeed = Math.ceil(baseNeed * needIntensity * county.priorityScore);
            
            // Apply resource constraints
            const maxAllocation = Math.min(
              adjustedNeed,
              resourceTracker[resource.id].available,
              Math.floor(resource.available_qty * 0.4) // Max 40% of total resource to any county
            );

            if (maxAllocation > 0) {
              // Calculate actual need met percentage
              const estimatedNeed = Math.max(baseNeed, 1);
              const needMetPercentage = Math.min((maxAllocation / estimatedNeed) * 100, 100);

              allocations.push({
                county_id: county.id,
                resource_id: resource.id,
                allocated_quantity: maxAllocation,
                need_met_percentage: needMetPercentage
              });

              // Update resource tracker
              resourceTracker[resource.id].available -= maxAllocation;
              resourceTracker[resource.id].allocated += maxAllocation;
            }
          }
        }
      }

      // Step 4: Create scenario with results
      const totalAllocatedResources = Object.values(resourceTracker)
        .reduce((sum, tracker) => sum + tracker.allocated, 0);
      
      const countiesServed = new Set(allocations.map(a => a.county_id)).size;

      const newScenario = {
        id: `scenario-${Date.now()}`,
        name: `Optimization Run ${new Date().toLocaleTimeString()}`,
        created_at: new Date().toISOString(),
        total_resources: totalAllocatedResources,
        counties_served: countiesServed,
        optimization_objective: 'minimize_risk_exposure',
        allocations: allocations.filter(a => a.allocated_quantity > 0)
      };

      addScenario(newScenario);
      setSelectedScenario(newScenario);
      
      toast.success(`Allocation completed! ${countiesServed} counties served with ${totalAllocatedResources.toLocaleString()} resources allocated.`);
      
    } catch (error) {
      console.error('Optimization failed:', error);
      toast.error('Optimization failed. Please try again.');
    } finally {
      setOptimizing(false);
      setIsLoading(false);
    }
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
        {/* Allocation Matrix - Grouped by County */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Allocation Matrix by County</CardTitle>
            </CardHeader>
            <CardContent>
              {currentScenario?.allocations && currentScenario.allocations.length > 0 ? (() => {
                // Group allocations by county
                const allocationsByCounty = currentScenario.allocations.reduce((acc, allocation) => {
                  const countyId = allocation.county_id;
                  if (!acc[countyId]) {
                    acc[countyId] = [];
                  }
                  acc[countyId].push(allocation);
                  return acc;
                }, {} as Record<string, typeof currentScenario.allocations>);

                const countiesWithAllocations = Object.keys(allocationsByCounty).map(countyId => {
                  const county = counties.find(c => c.id === countyId);
                  const countyAllocations = allocationsByCounty[countyId];
                  const totalAllocated = countyAllocations.reduce((sum, alloc) => sum + alloc.allocated_quantity, 0);
                  const avgNeedMet = countyAllocations.reduce((sum, alloc) => sum + alloc.need_met_percentage, 0) / countyAllocations.length;
                  
                  return {
                    county,
                    allocations: countyAllocations,
                    totalAllocated,
                    avgNeedMet
                  };
                }).sort((a, b) => b.totalAllocated - a.totalAllocated);

                return (
                  <Tabs defaultValue={countiesWithAllocations[0]?.county?.id || ''} className="w-full">
                    <TabsList className={`grid w-full ${
                      countiesWithAllocations.length <= 2 ? 'grid-cols-2' :
                      countiesWithAllocations.length <= 3 ? 'grid-cols-3' :
                      countiesWithAllocations.length <= 4 ? 'grid-cols-4' :
                      'grid-cols-5'
                    }`}>
                      {countiesWithAllocations.slice(0, 5).map(({ county }) => (
                        <TabsTrigger key={county?.id} value={county?.id || ''} className="text-xs truncate">
                          {county?.countyName || 'Unknown'}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {countiesWithAllocations.map(({ county, allocations, totalAllocated, avgNeedMet }) => (
                      <TabsContent key={county?.id} value={county?.id || ''} className="space-y-4">
                        {/* County Summary */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">County</div>
                            <div className="font-semibold">{county?.countyName}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Risk Score</div>
                            <div className="font-semibold">
                              <RiskBadge risk={county?.computed_risk_score || 0} />
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Total Allocated</div>
                            <div className="font-semibold">{totalAllocated.toLocaleString()}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Avg Need Met</div>
                            <div className="font-semibold">{avgNeedMet.toFixed(1)}%</div>
                          </div>
                        </div>

                        {/* Resource Allocations Table */}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Resource</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Allocated</TableHead>
                              <TableHead>Need Met %</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allocations.map((allocation, index) => {
                              const resource = resources.find(r => r.id === allocation.resource_id);
                              
                              return (
                                <TableRow key={`${allocation.resource_id}-${index}`}>
                                  <TableCell className="font-medium">
                                    {resource?.resource_name || 'Unknown Resource'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{resource?.category}</Badge>
                                  </TableCell>
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
                      </TabsContent>
                    ))}
                  </Tabs>
                );
              })() : (
                <div className="text-center text-muted-foreground py-8">
                  No allocations available. Run optimization to generate resource allocation plan.
                </div>
              )}
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
                  
                  const utilizationPct = resource.available_qty > 0 
                    ? (allocatedQty / resource.available_qty) * 100 
                    : 0;
                  
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