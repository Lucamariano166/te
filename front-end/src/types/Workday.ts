import type { Visit } from './Visit';

export interface Workday {
  id?: number;
  date: string;
  visits: number;
  completed: number;
  duration: number; // em minutos
  created?: string;
  modified?: string;
}

export interface WorkdayWithVisits {
  workday: Workday;
  visits: Visit[];
}

export interface WorkdayStatistics {
  period: {
    start_date: string;
    end_date: string;
    total_days: number;
  };
  totals: {
    visits: number;
    completed: number;
    duration_minutes: number;
    duration_hours: number;
  };
  averages: {
    visits_per_day: number;
    completion_rate_percent: number;
    duration_per_day_minutes: number;
    duration_per_day_hours: number;
  };
}