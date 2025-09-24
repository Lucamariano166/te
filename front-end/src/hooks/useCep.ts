import { useState, useCallback } from 'react';
import { CepService } from '../services/cepService';
import { ViaCepResponse } from '../types';

interface UseCepReturn {
  loading: boolean;
  error: string | null;
  data: ViaCepResponse | null;
  lookupCep: (cep: string) => Promise<ViaCepResponse | null>;
  formatCep: (cep: string) => string;
  applyCepMask: (value: string) => string;
  isValidFormat: (cep: string) => boolean;
  clearData: () => void;
}

export function useCep(): UseCepReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ViaCepResponse | null>(null);

  const lookupCep = useCallback(async (cep: string): Promise<ViaCepResponse | null> => {
    if (!CepService.isValidFormat(cep)) {
      setError('CEP deve ter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await CepService.lookup(cep);

      if (result) {
        setData(result);
        setError(null);
      } else {
        setError('CEP não encontrado');
        setData(null);
      }

      return result;
    } catch (err) {
      setError('Erro ao consultar CEP');
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const formatCep = useCallback((cep: string): string => {
    return CepService.formatCep(cep);
  }, []);

  const applyCepMask = useCallback((value: string): string => {
    return CepService.applyCepMask(value);
  }, []);

  const isValidFormat = useCallback((cep: string): boolean => {
    return CepService.isValidFormat(cep);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    data,
    lookupCep,
    formatCep,
    applyCepMask,
    isValidFormat,
    clearData,
  };
}