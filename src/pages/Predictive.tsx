import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { useAppStore } from '@/lib/store';
import { mockCounties, mockAlerts } from '@/lib/mock-data';
import { 
  Brain,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ThermometerSun,
  Wind,
  Users,
  Zap,
  Mail,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Predictive() {
  const { 
    counties, 
    alerts,
    setCounties, 
    addAlert,
    isLoading,
    setIsLoading 
  } = useAppStore();

  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    setCounties(mockCounties);
  }, [setCounties]);

  const runPrediction = async () => {
    setPredicting(true);
    setIsLoading(true);
    
    // Simulate ML prediction process
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate new predictions based on current data
    const predictions = counties.map(county => {
      const futureRisk = county.computed_risk_score + (Math.random() * 20 - 10);
      const riskIncrease = futureRisk > county.computed_risk_score;
      
      if (futureRisk > 85 || riskIncrease) {
        return {
          id: `pred-${Date.now()}-${county.id}`,
          county_id: county.id,
          alert_type: futureRisk > 95 || county.ta_max > 100 ? 'extreme_heat' as const : 
                     county.aqi_category.includes('Unhealthy') ? 'air_quality' as const : 
                     'resource_gap' as const,
          severity: futureRisk > 95 ? 'critical' as const :
                   futureRisk > 80 ? 'high' as const :
                   futureRisk > 65 ? 'medium' as const : 'low' as const,
          predicted_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          confidence: 0.7 + Math.random() * 0.25,
          message: futureRisk > 95 
            ? `Extreme heat event predicted for ${county.countyName} County with temperatures potentially exceeding ${(county.ta_max + 5).toFixed(1)}°F`
            : `Elevated risk conditions predicted for ${county.countyName} County`,
          recommendations: [
            'Monitor weather patterns closely',
            'Pre-position emergency resources',
            'Activate community outreach protocols'
          ]
        };
      }
      return null;
    }).filter(Boolean);

    predictions.forEach(pred => pred && addAlert(pred));
    
    setPredicting(false);
    setIsLoading(false);
    
    toast.success(`Generated ${predictions.length} new risk predictions`);
  };

  const sendAlerts = () => {
    const criticalAlerts = [...mockAlerts, ...alerts].filter(alert => 
      alert.severity === 'critical' || alert.severity === 'high'
    );
    
    // Simulate sending email alerts
    toast.success(`Sent ${criticalAlerts.length} emergency alerts to stakeholders`);
  };

  const allAlerts = [...mockAlerts, ...alerts];
  const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;
  const highCount = allAlerts.filter(a => a.severity === 'high').length;
  const avgConfidence = allAlerts.length > 0 
    ? allAlerts.reduce((sum, a) => sum + a.confidence, 0) / allAlerts.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Predictive Risk Alerts</h1>
          <p className="text-muted-foreground">
            7-day risk forecasting and automated emergency notifications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={sendAlerts}
            className="flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Send Alerts</span>
          </Button>
          <Button 
            onClick={runPrediction}
            disabled={predicting || isLoading}
            className="bg-gradient-primary"
          >
            {predicting ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Prediction
              </>
            )}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Critical Alerts"
          value={criticalCount}
          change={criticalCount > 0 ? "Immediate action required" : "No critical alerts"}
          changeType={criticalCount > 0 ? "negative" : "positive"}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          title="High Priority Alerts"
          value={highCount}
          description="Requires monitoring"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Prediction Confidence"
          value={`${(avgConfidence * 100).toFixed(1)}%`}
          description="Average model confidence"
          icon={<Brain className="h-4 w-4" />}
        />
        <StatCard
          title="Forecast Period"
          value="7 Days"
          description="Prediction window"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Risk Predictions & Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>County</TableHead>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAlerts.map((alert) => {
                    const county = counties.find(c => c.id === alert.county_id);
                    
                    return (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">
                          {county?.countyName || 'Unknown County'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {alert.alert_type === 'extreme_heat' && (
                              <ThermometerSun className="h-4 w-4 text-emergency" />
                            )}
                            {alert.alert_type === 'air_quality' && (
                              <Wind className="h-4 w-4 text-warning" />
                            )}
                            {alert.alert_type === 'resource_gap' && (
                              <Users className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="capitalize">
                              {alert.alert_type.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'default' :
                              'outline'
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.predicted_date}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-[60px]">
                              <div 
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${alert.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-sm">
                              {(alert.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={alert.message}>
                            {alert.message}
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

        {/* Model Info & Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>ML Model Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Model Version</span>
                  <span className="font-mono">v2.1.3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Training</span>
                  <span>2024-09-15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Features Used</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span>87.3%</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <h4 className="text-sm font-semibold mb-2">Input Features</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>• Temperature trends (Ta_max, Ta_avg)</div>
                  <div>• Air quality indicators (AQI)</div>
                  <div>• Healthcare metrics (ED admissions)</div>
                  <div>• Demographics (unemployment, age 65+)</div>
                  <div>• Historical risk patterns</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Alert Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical Alerts</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-emergency"
                        style={{ width: `${(criticalCount / Math.max(allAlerts.length, 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{criticalCount}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Priority</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-warning"
                        style={{ width: `${(highCount / Math.max(allAlerts.length, 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{highCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium/Low</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${((allAlerts.length - criticalCount - highCount) / Math.max(allAlerts.length, 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {allAlerts.length - criticalCount - highCount}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Scheduled Run</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  6:00 AM UTC
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Automated daily prediction update
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}