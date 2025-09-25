import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Visit, GroupedVisits, LoadingState } from '../types';
import { StorageService } from '../services/storageService';

type FilterType = 'all' | 'completed' | 'pending';

interface VisitsState {
  visits: Visit[];
  groupedVisits: GroupedVisits;
  loading: LoadingState;
  filter: FilterType;
}

type VisitsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VISITS'; payload: Visit[] }
  | { type: 'ADD_VISIT'; payload: Visit }
  | { type: 'UPDATE_VISIT'; payload: Visit }
  | { type: 'DELETE_VISIT'; payload: number }
  | { type: 'COMPLETE_VISIT'; payload: number }
  | { type: 'SET_FILTER'; payload: FilterType };

interface VisitsContextType {
  state: VisitsState;
  addVisit: (visit: Visit) => void;
  updateVisit: (visit: Visit) => void;
  deleteVisit: (id: number) => void;
  completeVisit: (id: number) => void;
  setFilter: (filter: FilterType) => void;
  loadVisits: () => void;
  getVisitsByDate: (date: string) => Visit[];
  getFilteredVisits: () => Visit[];
  canAddVisitToDate: (date: string, duration: number) => boolean;
  getTotalDurationForDate: (date: string) => number;
}

const initialState: VisitsState = {
  visits: [],
  groupedVisits: {},
  loading: { isLoading: true, error: null },
  filter: 'all',
};

function visitsReducer(state: VisitsState, action: VisitsAction): VisitsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, isLoading: action.payload } };
    case 'SET_ERROR':
      return { ...state, loading: { ...state.loading, error: action.payload } };
    case 'SET_VISITS':
      return { ...state, visits: action.payload, groupedVisits: groupVisitsByDate(action.payload) };
    case 'ADD_VISIT': {
      const newVisits = [...state.visits, action.payload];
      return { ...state, visits: newVisits, groupedVisits: groupVisitsByDate(newVisits) };
    }
    case 'UPDATE_VISIT': {
      const updatedVisits = state.visits.map(v => v.id === action.payload.id ? action.payload : v);
      return { ...state, visits: updatedVisits, groupedVisits: groupVisitsByDate(updatedVisits) };
    }
    case 'DELETE_VISIT': {
      const filteredVisits = state.visits.filter(v => v.id !== action.payload);
      return { ...state, visits: filteredVisits, groupedVisits: groupVisitsByDate(filteredVisits) };
    }
    case 'COMPLETE_VISIT': {
      const completedVisits = state.visits.map(v =>
        v.id === action.payload ? { ...v, completed: true, status: 'completed' as const } : v
      );
      return { ...state, visits: completedVisits, groupedVisits: groupVisitsByDate(completedVisits) };
    }
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    default:
      return state;
  }
}

function groupVisitsByDate(visits: Visit[]): GroupedVisits {
  return visits.reduce((groups, visit) => {
    const date = visit.date;
    if (!groups[date]) {
      groups[date] = { visits: [], totalDuration: 0, completedCount: 0, totalCount: 0, completionRate: 0 };
    }
    groups[date].visits.push(visit);
    groups[date].totalDuration += visit.duration;
    groups[date].totalCount += 1;
    if (visit.completed) groups[date].completedCount += 1;
    groups[date].completionRate = Math.round((groups[date].completedCount / groups[date].totalCount) * 100);
    return groups;
  }, {} as GroupedVisits);
}

const VisitsContext = createContext<VisitsContextType | undefined>(undefined);

export function VisitsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(visitsReducer, initialState);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await new Promise(res => setTimeout(res, 500)); // Simula delay
        const savedVisits = StorageService.loadVisits();
        dispatch({ type: 'SET_VISITS', payload: savedVisits });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar visitas' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!state.loading.isLoading && state.visits.length >= 0) {
      StorageService.saveVisits(state.visits);
    }
  }, [state.visits, state.loading.isLoading]);

  const addVisit = (visit: Visit) => dispatch({ type: 'ADD_VISIT', payload: visit });
  const updateVisit = (visit: Visit) => dispatch({ type: 'UPDATE_VISIT', payload: visit });
  const deleteVisit = (id: number) => dispatch({ type: 'DELETE_VISIT', payload: id });
  const completeVisit = (id: number) => dispatch({ type: 'COMPLETE_VISIT', payload: id });
  const setFilter = (filter: FilterType) => dispatch({ type: 'SET_FILTER', payload: filter });
  const loadVisits = () => dispatch({ type: 'SET_VISITS', payload: StorageService.loadVisits() });

  const getVisitsByDate = (date: string): Visit[] => state.groupedVisits[date]?.visits || [];

  const getFilteredVisits = (): Visit[] => {
    switch (state.filter) {
      case 'completed': return state.visits.filter(v => v.completed);
      case 'pending': return state.visits.filter(v => !v.completed);
      default: return state.visits;
    }
  };

  const canAddVisitToDate = (date: string, duration: number) =>
    (state.groupedVisits[date]?.totalDuration || 0) + duration <= 480;

  const getTotalDurationForDate = (date: string): number =>
    state.groupedVisits[date]?.totalDuration || 0;

  return (
    <VisitsContext.Provider value={{
      state,
      addVisit,
      updateVisit,
      deleteVisit,
      completeVisit,
      setFilter,
      loadVisits,
      getVisitsByDate,
      getFilteredVisits,
      canAddVisitToDate,
      getTotalDurationForDate
    }}>
      {children}
    </VisitsContext.Provider>
  );
}

export function useVisits() {
  const context = useContext(VisitsContext);
  if (!context) throw new Error('useVisits must be used within a VisitsProvider');
  return context;
}
