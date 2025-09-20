import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Data types matching the specified fields
export interface CountyData {
  id: string;
  countyName: string;
  zipCode: string;
  
  // Weather & Air Quality
  ta_min: number;
  ta_max: number;
  ta_avg: number;
  parameter_name: string;
  aqi_category: string;
  
  // Healthcare/Claims
  riskScore: number;
  total_allowed_pmpm: number;
  ed_admt_cnt: number;
  med_admt_cnt: number;
  pcp_visit_cnt: number;
  rx_allowed_pmpm: number;
  memb_cnt: number;
  avg_age: number;
  pct_f: number;
  
  // Demographics/Social Determinants
  e_unemp: number;
  e_nohsdp: number;
  eminrty: number;
  e_age65: number;
  e_totpop: number;
  area_sqmi: number;
  e_hu: number;
  
  // Computed fields
  computed_risk_score: number;
  rolling_avg_ta_max: number;
  allocation_quantity: number;
  
  // Geographic data
  latitude: number;
  longitude: number;
}

export interface Resource {
  id: string;
  resource_name: string;
  category: string;
  unit: string;
  available_qty: number;
  disaster_tags: string[];
  allocated_qty?: number;
}

export interface AllocationScenario {
  id: string;
  name: string;
  created_at: string;
  total_resources: number;
  counties_served: number;
  optimization_objective: string;
  allocations: Array<{
    county_id: string;
    resource_id: string;
    allocated_quantity: number;
    need_met_percentage: number;
  }>;
}

export interface PredictiveAlert {
  id: string;
  county_id: string;
  alert_type: 'extreme_heat' | 'air_quality' | 'resource_gap';
  severity: 'low' | 'medium' | 'high' | 'critical';
  predicted_date: string;
  confidence: number;
  message: string;
  recommendations: string[];
}

interface AppState {
  // Data
  counties: CountyData[];
  resources: Resource[];
  scenarios: AllocationScenario[];
  alerts: PredictiveAlert[];
  
  // UI State
  selectedCounty: CountyData | null;
  selectedScenario: AllocationScenario | null;
  mapView: 'risk_score' | 'need_met';
  isLoading: boolean;
  
  // Actions
  setCounties: (counties: CountyData[]) => void;
  setResources: (resources: Resource[]) => void;
  addScenario: (scenario: AllocationScenario) => void;
  setSelectedCounty: (county: CountyData | null) => void;
  setSelectedScenario: (scenario: AllocationScenario | null) => void;
  setMapView: (view: 'risk_score' | 'need_met') => void;
  setIsLoading: (loading: boolean) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  addAlert: (alert: PredictiveAlert) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      counties: [],
      resources: [],
      scenarios: [],
      alerts: [],
      selectedCounty: null,
      selectedScenario: null,
      mapView: 'risk_score',
      isLoading: false,
      
      // Actions
      setCounties: (counties) => set({ counties }),
      setResources: (resources) => set({ resources }),
      addScenario: (scenario) => set((state) => ({ 
        scenarios: [...state.scenarios, scenario] 
      })),
      setSelectedCounty: (county) => set({ selectedCounty: county }),
      setSelectedScenario: (scenario) => set({ selectedScenario: scenario }),
      setMapView: (view) => set({ mapView: view }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      updateResource: (id, updates) => set((state) => ({
        resources: state.resources.map(r => 
          r.id === id ? { ...r, ...updates } : r
        )
      })),
      addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts, alert]
      })),
    }),
    {
      name: 'ngo-resilience-store',
    }
  )
);