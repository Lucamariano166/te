import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ModalState, ToastMessage } from '../types';

interface UIState {
  modal: ModalState;
  toasts: ToastMessage[];
  isLoading: boolean;
}

type UIAction =
  | { type: 'OPEN_MODAL'; payload: { mode: 'create' | 'edit'; visitId?: number } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_TOAST'; payload: Omit<ToastMessage, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string };

interface UIContextType {
  state: UIState;
  openModal: (mode: 'create' | 'edit', visitId?: number) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
  hideToast: (id: string) => void;
}

const initialState: UIState = {
  modal: {
    isOpen: false,
    mode: 'create',
  },
  toasts: [],
  isLoading: false,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        modal: {
          isOpen: true,
          mode: action.payload.mode,
          visitId: action.payload.visitId,
        },
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: {
          isOpen: false,
          mode: 'create',
          visitId: undefined,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'ADD_TOAST':
      const newToast: ToastMessage = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };

      return {
        ...state,
        toasts: [...state.toasts, newToast],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };

    default:
      return state;
  }
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const openModal = (mode: 'create' | 'edit', visitId?: number) => {
    dispatch({ type: 'OPEN_MODAL', payload: { mode, visitId } });
  };

  const closeModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const showToast = (
    message: string,
    type: ToastMessage['type'] = 'info',
    duration: number = 5000
  ) => {
    const toastId = dispatch({
      type: 'ADD_TOAST',
      payload: { message, type, duration },
    });

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: toastId as any });
      }, duration);
    }
  };

  const hideToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  const contextValue: UIContextType = {
    state,
    openModal,
    closeModal,
    setLoading,
    showToast,
    hideToast,
  };

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}