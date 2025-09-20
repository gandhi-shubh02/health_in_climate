import { CountyData, Resource, AllocationScenario, PredictiveAlert } from './store';

// Mock county data with realistic values
export const mockCounties: CountyData[] = [
  {
    id: '1',
    countyName: 'Miami-Dade',
    zipCode: '33101',
    ta_min: 75.2,
    ta_max: 89.4,
    ta_avg: 82.3,
    parameter_name: 'PM2.5',
    aqi_category: 'Moderate',
    riskScore: 78.5,
    total_allowed_pmpm: 450.75,
    ed_admt_cnt: 2450,
    med_admt_cnt: 1200,
    pcp_visit_cnt: 8900,
    rx_allowed_pmpm: 125.50,
    memb_cnt: 125000,
    avg_age: 42.3,
    pct_f: 52.1,
    e_unemp: 8.5,
    e_nohsdp: 15.2,
    eminrty: 68.9,
    e_age65: 18.7,
    e_totpop: 2716940,
    area_sqmi: 1946.0,
    e_hu: 1050000,
    computed_risk_score: 85.2,
    rolling_avg_ta_max: 91.2,
    allocation_quantity: 0,
    latitude: 25.7617,
    longitude: -80.1918
  },
  {
    id: '2',
    countyName: 'Maricopa',
    zipCode: '85001',
    ta_min: 68.5,
    ta_max: 104.8,
    ta_avg: 86.7,
    parameter_name: 'PM2.5',
    aqi_category: 'Unhealthy for Sensitive Groups',
    riskScore: 92.1,
    total_allowed_pmpm: 485.20,
    ed_admt_cnt: 3200,
    med_admt_cnt: 1800,
    pcp_visit_cnt: 12500,
    rx_allowed_pmpm: 145.75,
    memb_cnt: 180000,
    avg_age: 38.9,
    pct_f: 50.8,
    e_unemp: 7.2,
    e_nohsdp: 12.8,
    eminrty: 55.4,
    e_age65: 15.3,
    e_totpop: 4485414,
    area_sqmi: 9203.0,
    e_hu: 1950000,
    computed_risk_score: 94.7,
    rolling_avg_ta_max: 107.3,
    allocation_quantity: 0,
    latitude: 33.4484,
    longitude: -112.0740
  },
  {
    id: '3',
    countyName: 'Harris',
    zipCode: '77001',
    ta_min: 72.1,
    ta_max: 95.6,
    ta_avg: 83.9,
    parameter_name: 'Ozone',
    aqi_category: 'Unhealthy',
    riskScore: 88.3,
    total_allowed_pmpm: 520.40,
    ed_admt_cnt: 2800,
    med_admt_cnt: 1500,
    pcp_visit_cnt: 11200,
    rx_allowed_pmpm: 165.25,
    memb_cnt: 165000,
    avg_age: 35.2,
    pct_f: 49.7,
    e_unemp: 6.8,
    e_nohsdp: 18.5,
    eminrty: 72.3,
    e_age65: 12.4,
    e_totpop: 4731145,
    area_sqmi: 1703.0,
    e_hu: 1850000,
    computed_risk_score: 91.8,
    rolling_avg_ta_max: 98.2,
    allocation_quantity: 0,
    latitude: 29.7604,
    longitude: -95.3698
  },
  {
    id: '4',
    countyName: 'Los Angeles',
    zipCode: '90001',
    ta_min: 58.3,
    ta_max: 82.7,
    ta_avg: 70.5,
    parameter_name: 'PM2.5',
    aqi_category: 'Moderate',
    riskScore: 76.8,
    total_allowed_pmpm: 495.65,
    ed_admt_cnt: 4200,
    med_admt_cnt: 2200,
    pcp_visit_cnt: 18500,
    rx_allowed_pmpm: 155.80,
    memb_cnt: 285000,
    avg_age: 36.8,
    pct_f: 51.2,
    e_unemp: 9.1,
    e_nohsdp: 22.4,
    eminrty: 81.2,
    e_age65: 14.8,
    e_totpop: 10014009,
    area_sqmi: 4751.0,
    e_hu: 3500000,
    computed_risk_score: 79.4,
    rolling_avg_ta_max: 85.1,
    allocation_quantity: 0,
    latitude: 34.0522,
    longitude: -118.2437
  },
  {
    id: '5',
    countyName: 'Cook',
    zipCode: '60601',
    ta_min: 42.8,
    ta_max: 78.2,
    ta_avg: 60.5,
    parameter_name: 'PM2.5',
    aqi_category: 'Good',
    riskScore: 65.4,
    total_allowed_pmpm: 425.30,
    ed_admt_cnt: 3500,
    med_admt_cnt: 1900,
    pcp_visit_cnt: 15800,
    rx_allowed_pmpm: 135.90,
    memb_cnt: 245000,
    avg_age: 37.9,
    pct_f: 52.8,
    e_unemp: 8.9,
    e_nohsdp: 16.7,
    eminrty: 58.9,
    e_age65: 13.7,
    e_totpop: 5150233,
    area_sqmi: 945.0,
    e_hu: 2100000,
    computed_risk_score: 68.7,
    rolling_avg_ta_max: 81.5,
    allocation_quantity: 0,
    latitude: 41.8781,
    longitude: -87.6298
  }
];

export const mockResources: Resource[] = [
  {
    id: '1',
    resource_name: 'Cooling Centers',
    category: 'Shelter',
    unit: 'capacity',
    available_qty: 5000,
    disaster_tags: ['extreme_heat', 'power_outage']
  },
  {
    id: '2',
    resource_name: 'Portable Air Conditioners',
    category: 'Equipment',
    unit: 'units',
    available_qty: 150,
    disaster_tags: ['extreme_heat']
  },
  {
    id: '3',
    resource_name: 'Air Quality Monitors',
    category: 'Monitoring',
    unit: 'devices',
    available_qty: 75,
    disaster_tags: ['air_quality', 'wildfire']
  },
  {
    id: '4',
    resource_name: 'Emergency Medical Kits',
    category: 'Medical',
    unit: 'kits',
    available_qty: 200,
    disaster_tags: ['extreme_heat', 'air_quality', 'general_emergency']
  },
  {
    id: '5',
    resource_name: 'Water Distribution Stations',
    category: 'Relief',
    unit: 'stations',
    available_qty: 25,
    disaster_tags: ['extreme_heat', 'drought']
  },
  {
    id: '6',
    resource_name: 'N95 Respirator Masks',
    category: 'Protection',
    unit: 'boxes',
    available_qty: 500,
    disaster_tags: ['air_quality', 'wildfire']
  }
];

export const mockScenarios: AllocationScenario[] = [
  {
    id: '1',
    name: 'Summer Heat Wave Response',
    created_at: '2024-09-15T10:30:00Z',
    total_resources: 5875,
    counties_served: 5,
    optimization_objective: 'minimize_risk_exposure',
    allocations: [
      { county_id: '2', resource_id: '1', allocated_quantity: 2000, need_met_percentage: 78.5 },
      { county_id: '3', resource_id: '1', allocated_quantity: 1500, need_met_percentage: 65.2 },
      { county_id: '1', resource_id: '1', allocated_quantity: 1000, need_met_percentage: 55.8 },
      { county_id: '2', resource_id: '2', allocated_quantity: 60, need_met_percentage: 85.0 },
      { county_id: '3', resource_id: '2', allocated_quantity: 40, need_met_percentage: 72.3 },
      { county_id: '1', resource_id: '5', allocated_quantity: 15, need_met_percentage: 90.0 }
    ]
  }
];

export const mockAlerts: PredictiveAlert[] = [
  {
    id: '1',
    county_id: '2',
    alert_type: 'extreme_heat',
    severity: 'critical',
    predicted_date: '2024-09-22',
    confidence: 0.92,
    message: 'Critical heat wave predicted for Maricopa County with temperatures exceeding 110°F',
    recommendations: [
      'Deploy additional cooling centers immediately',
      'Activate extreme heat emergency protocols',
      'Increase outreach to vulnerable populations'
    ]
  },
  {
    id: '2',
    county_id: '3',
    alert_type: 'air_quality',
    severity: 'high',
    predicted_date: '2024-09-20',
    confidence: 0.87,
    message: 'Air quality expected to reach unhealthy levels due to industrial emissions',
    recommendations: [
      'Distribute N95 masks to high-risk populations',
      'Issue public health advisory',
      'Monitor vulnerable community centers'
    ]
  },
  {
    id: '3',
    county_id: '1',
    alert_type: 'resource_gap',
    severity: 'medium',
    predicted_date: '2024-09-25',
    confidence: 0.75,
    message: 'Projected cooling center capacity shortfall during peak demand period',
    recommendations: [
      'Coordinate with neighboring counties for resource sharing',
      'Identify additional temporary cooling locations',
      'Pre-position mobile cooling units'
    ]
  }
];