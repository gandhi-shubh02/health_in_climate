import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/ui/risk-badge';
import { useAppStore } from '@/lib/store';
import { mockCounties } from '@/lib/mock-data';
import { MapPin, Layers, Activity, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const InteractiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { counties, selectedCounty, setSelectedCounty, mapView } = useAppStore();
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [-95.7129, 37.0902], // Center of USA
      zoom: 4,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add county markers after map loads
      counties.forEach((county) => {
        const riskColor = 
          county.computed_risk_score >= 90 ? '#dc2626' : // Critical - red
          county.computed_risk_score >= 75 ? '#ea580c' : // High - orange-red  
          county.computed_risk_score >= 50 ? '#ca8a04' : // Medium - yellow
          '#16a34a'; // Low - green

        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'county-marker';
        markerElement.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: ${riskColor};
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: transform 0.2s ease;
        `;

        // Add hover effect
        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.2)';
        });
        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)';
        });

        // Create popup for county info
        const popup = new maplibregl.Popup({ 
          offset: 25,
          closeButton: false 
        }).setHTML(`
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-lg mb-2">${county.countyName} County</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span>Risk Score:</span>
                <span class="font-medium">${county.computed_risk_score.toFixed(1)}</span>
              </div>
              <div class="flex justify-between">
                <span>Population:</span>
                <span>${county.e_totpop.toLocaleString()}</span>
              </div>
              <div class="flex justify-between">
                <span>Max Temp:</span>
                <span>${county.ta_max.toFixed(1)}°F</span>
              </div>
              <div class="flex justify-between">
                <span>Air Quality:</span>
                <span>${county.aqi_category}</span>
              </div>
            </div>
          </div>
        `);

        // Create marker
        const marker = new maplibregl.Marker({ element: markerElement })
          .setLngLat([county.longitude, county.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        // Add click handler
        markerElement.addEventListener('click', () => {
          setSelectedCounty(county);
          toast.success(`Selected ${county.countyName} County`);
        });
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [counties, setSelectedCounty]);

  // Update marker colors when map view changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const markers = document.querySelectorAll('.county-marker');
    markers.forEach((marker, index) => {
      const county = counties[index];
      if (!county) return;

      let color;
      if (mapView === 'risk_score') {
        color = county.computed_risk_score >= 90 ? '#dc2626' :
                county.computed_risk_score >= 75 ? '#ea580c' :
                county.computed_risk_score >= 50 ? '#ca8a04' : '#16a34a';
      } else {
        // Need met percentage - mock data for now
        const needMet = Math.random() * 100;
        color = needMet >= 80 ? '#16a34a' :
                needMet >= 60 ? '#ca8a04' :
                needMet >= 40 ? '#ea580c' : '#dc2626';
      }
      
      (marker as HTMLElement).style.backgroundColor = color;
    });
  }, [mapView, counties, mapLoaded]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          variant={mapView === 'risk_score' ? 'default' : 'outline'}
          size="sm"
          onClick={() => useAppStore.getState().setMapView('risk_score')}
          className="bg-white/90 hover:bg-white text-black border shadow-md"
        >
          Risk Score
        </Button>
        <Button
          variant={mapView === 'need_met' ? 'default' : 'outline'}
          size="sm"
          onClick={() => useAppStore.getState().setMapView('need_met')}
          className="bg-white/90 hover:bg-white text-black border shadow-md"
        >
          Need Met %
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-lg border">
        <h4 className="text-sm font-semibold mb-2">
          {mapView === 'risk_score' ? 'Risk Levels' : 'Need Met Percentage'}
        </h4>
        <div className="space-y-1">
          {mapView === 'risk_score' ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>
                <span className="text-xs">Critical (90+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ea580c]"></div>
                <span className="text-xs">High (75-89)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ca8a04]"></div>
                <span className="text-xs">Medium (50-74)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#16a34a]"></div>
                <span className="text-xs">Low (&lt;50)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#16a34a]"></div>
                <span className="text-xs">80%+ Met</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ca8a04]"></div>
                <span className="text-xs">60-79% Met</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ea580c]"></div>
                <span className="text-xs">40-59% Met</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>
                <span className="text-xs">&lt;40% Met</span>
              </div>
            </>
          )}
        </div>
      </div>

      {!mapLoaded && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
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
              <InteractiveMap />
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