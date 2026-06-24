export interface LotSummary {
  parkingLotId: string;
  name: string;
  capacity: number;
  inside: number;
  outstanding: number;
  walkInHeadroom: number;
  occupancyRate: number;
  openIncidents: number;
  revenueToday: number;
}

export interface AdminDashboard {
  lots: LotSummary[];
  totals: {
    capacity: number;
    inside: number;
    outstanding: number;
    walkInHeadroom: number;
    occupancyRate: number;
    openIncidents: number;
    revenueToday: number;
  };
}

export interface UsagePoint {
  hour: string;
  occupancyRate: number;
}
