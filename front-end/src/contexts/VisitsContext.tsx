import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Visit, GroupedVisits, LoadingState } from '../types';
import { StorageService } from '../services/storageService';
import { VisitService } from '../services/visitService';

interface VisitsState {
  visits: Visit[];
  groupedVisits: GroupedVisits;
  loading: LoadingState;
}

type VisitsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VISITS'; payload: Visit[] }
  | { type: 'ADD_VISIT'; payload: Visit }
  | { type: 'UPDATE_VISIT'; payload: Visit }
  | { type: 'DELETE_VISIT'; payload: number }
  | { type: 'COMPLETE_VISIT'; payload: number };

interface VisitsContextType {
  state: VisitsState;
  addVisit: (visit: Visit) => void;
  updateVisit: (visit: Visit) => void;
  deleteVisit: (id: number) => void;
  completeVisit: (id: number) => void;
  loadVisits: () => void;
  getVisitsByDate: (date: string) => Visit[];
  canAddVisitToDate: (date: string, duration: number) => boolean;
  getTotalDurationForDate: (date: string) => number;
}

const initialState: VisitsState = {
  visits: [],
  groupedVisits: {},
  loading: {
    isLoading: true, // Iniciar com loading true
    error: null,
  },
};

function visitsReducer(state: VisitsState, action: VisitsAction): VisitsState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          isLoading: action.payload,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        loading: {
          ...state.loading,
          error: action.payload,
        },
      };

    case 'SET_VISITS':
      return {
        ...state,
        visits: action.payload,
        groupedVisits: groupVisitsByDate(action.payload),
      };

    case 'ADD_VISIT':
      const newVisits = [...state.visits, action.payload];
      return {
        ...state,
        visits: newVisits,
        groupedVisits: groupVisitsByDate(newVisits),
      };

    case 'UPDATE_VISIT':
      const updatedVisits = state.visits.map(visit =>
        visit.id === action.payload.id ? action.payload : visit
      );
      return {
        ...state,
        visits: updatedVisits,
        groupedVisits: groupVisitsByDate(updatedVisits),
      };

    case 'DELETE_VISIT':
      const filteredVisits = state.visits.filter(visit => visit.id !== action.payload);
      return {
        ...state,
        visits: filteredVisits,
        groupedVisits: groupVisitsByDate(filteredVisits),
      };

    case 'COMPLETE_VISIT':
      const completedVisits = state.visits.map(visit =>
        visit.id === action.payload
          ? { ...visit, completed: true, status: 'completed' as const }
          : visit
      );
      return {
        ...state,
        visits: completedVisits,
        groupedVisits: groupVisitsByDate(completedVisits),
      };

    default:
      return state;
  }
}

function groupVisitsByDate(visits: Visit[]): GroupedVisits {
  return visits.reduce((groups, visit) => {
    const date = visit.date;

    if (!groups[date]) {
      groups[date] = {
        visits: [],
        totalDuration: 0,
        completedCount: 0,
        totalCount: 0,
        completionRate: 0,
      };
    }

    groups[date].visits.push(visit);
    groups[date].totalDuration += visit.duration;
    groups[date].totalCount += 1;

    if (visit.completed) {
      groups[date].completedCount += 1;
    }

    groups[date].completionRate = Math.round(
      (groups[date].completedCount / groups[date].totalCount) * 100
    );

    return groups;
  }, {} as GroupedVisits);
}

const VisitsContext = createContext<VisitsContextType | undefined>(undefined);

export function VisitsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(visitsReducer, initialState);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Simular pequeno delay para mostrar loading
        await new Promise(resolve => setTimeout(resolve, 500));

        const savedVisits = StorageService.loadVisits();
        dispatch({ type: 'SET_VISITS', payload: savedVisits });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar visitas' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInitialData();
  }, []);

  // Salvar dados sempre que as visitas mudarem (apenas se não estiver carregando)
  useEffect(() => {
    if (!state.loading.isLoading && state.visits.length >= 0) {
      StorageService.saveVisits(state.visits);
    }
  }, [state.visits, state.loading.isLoading]);

  const addVisit = (visit: Visit) => {
    dispatch({ type: 'ADD_VISIT', payload: visit });
  };

  const updateVisit = (visit: Visit) => {
    dispatch({ type: 'UPDATE_VISIT', payload: visit });
  };

  const deleteVisit = (id: number) => {
    dispatch({ type: 'DELETE_VISIT', payload: id });
  };

  const completeVisit = (id: number) => {
    dispatch({ type: 'COMPLETE_VISIT', payload: id });
  };

  const loadVisits = () => {
    const savedVisits = StorageService.loadVisits();
    dispatch({ type: 'SET_VISITS', payload: savedVisits });
  };

  const getVisitsByDate = (date: string): Visit[] => {
    return state.groupedVisits[date]?.visits || [];
  };

  const canAddVisitToDate = (date: string, duration: number): boolean => {
    const totalDuration = getTotalDurationForDate(date);
    return (totalDuration + duration) <= 480; // 8 horas = 480 minutos
  };

  const getTotalDurationForDate = (date: string): number => {
    return state.groupedVisits[date]?.totalDuration || 0;
  };

  const contextValue: VisitsContextType = {
    state,
    addVisit,
    updateVisit,
    deleteVisit,
    completeVisit,
    loadVisits,
    getVisitsByDate,
    canAddVisitToDate,
    getTotalDurationForDate,
  };

  return (
    <VisitsContext.Provider value={contextValue}>
      {children}
    </VisitsContext.Provider>
  );
}

export function useVisits() {
  const context = useContext(VisitsContext);
  if (context === undefined) {
    throw new Error('useVisits must be used within a VisitsProvider');
  }
  return context;
}