import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/ui/risk-badge';
import { useAppStore } from '@/lib/store';
import { mockCounties } from '@/lib/mock-data';
import { MapPin, Layers, Activity, Users } from 'lucide-react';
import toast from 'react-hot-toast';

// Simple map component using CSS transforms for county markers
const MapVisualization = () => {
  const { counties, selectedCounty, setSelectedCounty, mapView, setMapView } = useAppStore();

  const handleCountyClick = (county: typeof counties[0]) => {
    setSelectedCounty(county);
    toast.success(`Selected ${county.countyName} County`);
  };

  return (
    <div className="relative w-full h-[600px] bg-surface rounded-lg border overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900">
        {/* Simulated US Map Background */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNncmlkKSIvPgo8L3N2Zz4K')] bg-repeat"></div>
      </div>

      {/* County Markers */}
      {counties.map((county) => {
        // Convert lat/lng to relative positions (simplified projection)
        const x = ((county.longitude + 125) / 60) * 100; // Rough US longitude range
        const y = ((50 - county.latitude) / 25) * 100; // Rough US latitude range
        
        const riskColor = 
          county.computed_risk_score >= 90 ? 'bg-risk-critical' :
          county.computed_risk_score >= 75 ? 'bg-risk-high' :
          county.computed_risk_score >= 50 ? 'bg-risk-medium' :
          'bg-risk-low';

        return (
          <div
            key={county.id}
            className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 ${
              selectedCounty?.id === county.id ? 'scale-125 z-20' : 'z-10'
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => handleCountyClick(county)}
          >
            {/* Red circular marker as specified */}
            <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${riskColor} flex items-center justify-center`}>
              <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
            </div>
            
            {/* County label on hover */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
              {county.countyName}
              <br />
              Risk: {county.computed_risk_score.toFixed(1)}
            </div>
          </div>
        );
      })}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          variant={mapView === 'risk_score' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMapView('risk_score')}
        >
          Risk Score
        </Button>
        <Button
          variant={mapView === 'need_met' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMapView('need_met')}
        >
          Need Met %
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/90 p-3 rounded-lg shadow-lg">
        <h4 className="text-sm font-semibold mb-2">Risk Levels</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-risk-critical"></div>
            <span className="text-xs">Critical (90+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-risk-high"></div>
            <span className="text-xs">High (75-89)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-risk-medium"></div>
            <span className="text-xs">Medium (50-74)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-risk-low"></div>
            <span className="text-xs">Low (&lt;50)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Map() {
  const { counties, selectedCounty, setCounties } = useAppStore();

  useEffect(() => {
    setCounties(mockCounties);
  }, [setCounties]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Risk Assessment Map</h1>
          <p className="text-muted-foreground">
            Interactive county-level risk visualization and resource allocation overview
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {counties.length} counties monitored
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>County Risk Map</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MapVisualization />
            </CardContent>
          </Card>
        </div>

        {/* County Details Sidebar */}
        <div className="space-y-6">
          {selectedCounty ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedCounty.countyName} County</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <RiskBadge risk={selectedCounty.computed_risk_score} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Population</span>
                    <span className="text-sm font-medium">
                      {selectedCounty.e_totpop.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Temperature</span>
                    <span className="text-sm font-medium">
                      {selectedCounty.ta_avg.toFixed(1)}°F
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Max Temperature</span>
                    <span className="text-sm font-medium">
                      {selectedCounty.ta_max.toFixed(1)}°F
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Air Quality</span>
                    <Badge variant="outline">
                      {selectedCounty.aqi_category}
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="text-sm font-semibold mb-2">Demographics</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Unemployment Rate</span>
                      <span>{selectedCounty.e_unemp}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Age 65+</span>
                      <span>{selectedCounty.e_age65}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minority Population</span>
                      <span>{selectedCounty.eminrty}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="text-sm font-semibold mb-2">Healthcare Metrics</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>ED Admissions</span>
                      <span>{selectedCounty.ed_admt_cnt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medical Admissions</span>
                      <span>{selectedCounty.med_admt_cnt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PCP Visits</span>
                      <span>{selectedCounty.pcp_visit_cnt.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Click on a county marker to view details
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>System Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Counties Monitored</span>
                <span className="text-sm font-medium">{counties.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">High Risk Counties</span>
                <span className="text-sm font-medium">
                  {counties.filter(c => c.computed_risk_score >= 75).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Critical Risk Counties</span>
                <span className="text-sm font-medium text-emergency">
                  {counties.filter(c => c.computed_risk_score >= 90).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Population</span>
                <span className="text-sm font-medium">
                  {counties.reduce((sum, c) => sum + c.e_totpop, 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}