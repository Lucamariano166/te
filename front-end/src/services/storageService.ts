import { Visit, GroupedVisits } from '../types';

const STORAGE_KEY = 'visits_management_data';

export class StorageService {
  /**
   * Salvar visitas no localStorage
   */
  static saveVisits(visits: Visit[]): void {
    try {
      const data = {
        visits,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  }

  /**
   * Carregar visitas do localStorage
   */
  static loadVisits(): Visit[] {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);

      if (!dataStr) {
        return [];
      }

      const data = JSON.parse(dataStr);

      // Validar estrutura dos dados
      if (!data.visits || !Array.isArray(data.visits)) {
        return [];
      }

      return data.visits;
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return [];
    }
  }

  /**
   * Limpar dados do localStorage
   */
  static clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }

  /**
   * Verificar se há dados salvos
   */
  static hasStoredData(): boolean {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      return !!dataStr;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obter informações sobre os dados salvos
   */
  static getStorageInfo(): { lastUpdated: string | null; version: string | null; count: number } {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);

      if (!dataStr) {
        return { lastUpdated: null, version: null, count: 0 };
      }

      const data = JSON.parse(dataStr);

      return {
        lastUpdated: data.lastUpdated || null,
        version: data.version || null,
        count: data.visits?.length || 0,
      };
    } catch (error) {
      return { lastUpdated: null, version: null, count: 0 };
    }
  }

  /**
   * Exportar dados para backup
   */
  static exportData(): string {
    const visits = this.loadVisits();
    const exportData = {
      visits,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Importar dados de backup
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (!data.visits || !Array.isArray(data.visits)) {
        throw new Error('Formato de dados inválido');
      }

      this.saveVisits(data.visits);
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
}