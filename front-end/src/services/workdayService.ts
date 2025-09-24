import { backendApi, handleApiResponse, handleApiError } from './api';
import { Workday, WorkdayWithVisits, WorkdayStatistics, ApiResponse } from '../types';

export class WorkdayService {
  /**
   * Listar workdays
   */
  static async getWorkdays(params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<ApiResponse<Workday[]>> {
    try {
      const response = await backendApi.get('/workdays', { params });

      return handleApiResponse<Workday[]>(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Obter workday específico com visitas
   */
  static async getWorkdayByDate(date: string): Promise<ApiResponse<WorkdayWithVisits>> {
    try {
      const response = await backendApi.get(`/workdays/${date}`);

      return handleApiResponse<WorkdayWithVisits>(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Fechar dia de trabalho
   */
  static async closeWorkday(date: string): Promise<ApiResponse<{
    closed_date: string;
    reallocated_visits: Array<{
      visit_id: number;
      from_date: string;
      to_date: string;
      duration: number;
    }>;
    failed_reallocations: Array<{
      visit_id: number;
      error: string;
    }>;
    summary: {
      total_pending: number;
      successfully_reallocated: number;
      failed_reallocations: number;
    };
  }>> {
    try {
      const response = await backendApi.post('/workdays/close', { date });

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Obter estatísticas gerais
   */
  static async getStatistics(): Promise<ApiResponse<WorkdayStatistics>> {
    try {
      const response = await backendApi.get('/workdays/statistics');

      return handleApiResponse<WorkdayStatistics>(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Verificar se um dia está completo (8 horas)
   */
  static isDayFull(workday: Workday): boolean {
    return workday.duration >= 480;
  }

  /**
   * Calcular minutos restantes para o limite
   */
  static getRemainingMinutes(workday: Workday): number {
    return Math.max(0, 480 - workday.duration);
  }

  /**
   * Calcular taxa de conclusão
   */
  static getCompletionRate(workday: Workday): number {
    if (workday.visits === 0) return 0;
    return Math.round((workday.completed / workday.visits) * 100);
  }

  /**
   * Obter cor do indicador baseado na taxa de conclusão
   */
  static getCompletionColor(completionRate: number): 'red' | 'blue' | 'green' {
    if (completionRate < 60) return 'red';
    if (completionRate > 90) return 'green';
    return 'blue';
  }

  /**
   * Formatar duração em horas e minutos
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }

    return `${remainingMinutes}min`;
  }

  /**
   * Calcular porcentagem de ocupação do dia
   */
  static getOccupancyPercentage(workday: Workday): number {
    return Math.round((workday.duration / 480) * 100);
  }
}