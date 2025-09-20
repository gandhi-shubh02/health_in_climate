import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Activity, Wind, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { mockCounties } from '@/lib/mock-data';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function Predictive() {
  const { alerts, addAlert, removeAlert } = useAppStore();
  const [counties, setCounties] = useState(mockCounties);
  const [isLoading, setIsLoading] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    setCounties(mockCounties);
  }, []);

  const runPrediction = async () => {
    setIsPredicting(true);
    setIsLoading(true);
    
    try {
      // Simulate ML prediction process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate new alerts based on simulated future risks
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const newAlerts = counties
        .filter(() => Math.random() > 0.7) // Randomly select some counties
        .map(county => ({
          id: `alert-${Date.now()}-${Math.random()}`,
          county_id: county.id,
          alert_type: Math.random() > 0.5 ? 'extreme_heat' as const : 'air_quality' as const,
          severity: Math.random() > 0.5 ? 'critical' as const : 'high' as const,
          predicted_date: futureDate.toISOString().split('T')[0],
          confidence: (Math.floor(Math.random() * 30 + 70)) / 100, // 0.70-0.99
          message: `Predicted ${Math.random() > 0.5 ? 'extreme heat event' : 'wildfire risk'} based on current trends`,
          recommendations: [
            'Increase water supply reserves by 40%',
            'Pre-position firefighting equipment',
            'Issue evacuation readiness alerts'
          ]
        }));
      
      newAlerts.forEach(alert => addAlert(alert));
      
      toast.success(`Generated ${newAlerts.length} new predictive alerts`);
    } catch (error) {
      toast.error('Failed to run prediction');
    } finally {
      setIsPredicting(false);
      setIsLoading(false);
    }
  };

  const activeAlerts = alerts.filter(alert => 
    alert.severity === 'critical' || alert.severity === 'high'
  );

  const acknowledgeAlert = (alertId: string) => {
    removeAlert(alertId);
    toast.success('Alert acknowledged');
  };

  // Environmental monitoring data for counties
  const environmentalData = [
    {
      name: 'Los Angeles County',
      aqi: 165,
      temp: 95,
      humidity: 25,
      wind: 15,
      co2: 450,
      riskLevel: 'critical'
    },
    {
      name: 'Orange County', 
      aqi: 142,
      temp: 89,
      humidity: 30,
      wind: 12,
      co2: 380,
      riskLevel: 'high'
    },
    {
      name: 'San Diego County',
      aqi: 98,
      temp: 78,
      humidity: 65,
      wind: 8,
      co2: 290,
      riskLevel: 'medium'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Predictive Alert System</h1>
            <p className="text-muted-foreground">
              AI-powered early warning system using environmental data and risk factors
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={runPrediction} 
            disabled={isPredicting}
            className="bg-primary hover:bg-primary/90"
          >
            <Activity className="h-4 w-4 mr-2" />
            {isPredicting ? 'Running Analysis...' : 'Run Predictive Analysis'}
          </Button>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{activeAlerts.length} Active Alerts</span>
            <span className="font-medium text-foreground">3 Data Sources</span>
          </div>
        </div>
      </div>

      {/* Active Alerts Section */}
      {activeAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Active Predictive Alerts</h2>
          <p className="text-sm text-muted-foreground">
            AI-generated alerts based on environmental analysis and risk modeling
          </p>
          
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <Card key={alert.id} className="relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emergency"></div>
                <CardContent className="p-6 pl-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-emergency" />
                        <h3 className="text-lg font-semibold text-foreground capitalize">
                          {alert.alert_type.replace('_', ' ')}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{counties.find(c => c.id === alert.county_id)?.countyName || 'Unknown County'}</span>
                        <span>•</span>
                        <span>Predicted: {format(new Date(alert.predicted_date), 'M/d/yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant="outline" 
                          className={`${
                            alert.severity === 'critical' 
                              ? 'border-emergency text-emergency' 
                              : 'border-warning text-warning'
                          }`}
                        >
                          {alert.severity === 'critical' ? 'Critical Risk' : 'High Risk'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Confidence: <span className="font-medium text-foreground">{Math.round(alert.confidence * 100)}%</span>
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Recommended Actions:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {alert.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="ml-4"
                    >
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Environmental Monitoring Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Real-time Environmental Monitoring</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {environmentalData.map((county) => (
            <Card key={county.name} className="relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{county.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Real-time environmental monitoring</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AQI */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">AQI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${
                      county.aqi > 150 ? 'text-emergency' : 
                      county.aqi > 100 ? 'text-warning' : 'text-success'
                    }`}>
                      {county.aqi}
                    </span>
                    {county.aqi > 150 && (
                      <Badge variant="outline" className="text-xs bg-emergency/10 text-emergency border-emergency">
                        2
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Temperature */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Temp</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{county.temp}°F</span>
                </div>

                {/* Humidity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Humidity</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{county.humidity}%</span>
                </div>

                {/* Wind */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Wind</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{county.wind} mph</span>
                </div>

                {/* CO2 Emissions */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">CO₂ Emissions</span>
                    <span className="text-sm font-bold text-foreground">{county.co2} ppm</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* No Alerts State */}
      {activeAlerts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Active Alerts</h3>
            <p className="text-muted-foreground mb-4">
              Run predictive analysis to generate alerts based on environmental data and risk factors.
            </p>
            <Button onClick={runPrediction} disabled={isPredicting}>
              <Activity className="h-4 w-4 mr-2" />
              {isPredicting ? 'Running Analysis...' : 'Run Predictive Analysis'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}