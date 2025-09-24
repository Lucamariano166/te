import type { Address } from './Address';

export interface Visit {
  id?: number;
  date: string;
  status: 'pending' | 'completed';
  forms: number;
  products: number;
  completed: boolean;
  duration: number; // em minutos
  address_id?: number;
  address: Address;
  created?: string;
  modified?: string;
}

export interface VisitFormData {
  date: string;
  forms: number;
  products: number;
  completed: boolean;
  address: {
    postal_code: string;
    sublocality: string;
    street: string;
    street_number: string;
    complement: string;
  };
}

export interface GroupedVisits {
  [date: string]: {
    visits: Visit[];
    totalDuration: number;
    completedCount: number;
    totalCount: number;
    completionRate: number;
  };
}