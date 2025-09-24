import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Estado para armazenar nosso valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage para a chave "${key}":`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Permitir que value seja uma função para que tenhamos a mesma API do useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Salvar no estado
        setStoredValue(valueToStore);

        // Salvar no localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Erro ao salvar no localStorage para a chave "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Função para remover o item do localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Erro ao remover do localStorage para a chave "${key}":`, error);
    }
  }, [key, initialValue]);

  // Escutar mudanças no localStorage de outras abas/janelas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Erro ao processar mudança do localStorage para a chave "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;