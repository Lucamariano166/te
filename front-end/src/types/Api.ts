export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  count?: number;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  visitId?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}