import { backendApi, handleApiResponse, handleApiError } from './api';
import { Visit, VisitFormData, ApiResponse } from '../types';

export class VisitService {
  /**
   * Listar visitas por data
   */
  static async getVisitsByDate(date: string): Promise<ApiResponse<Visit[]>> {
    try {
      const response = await backendApi.get(`/visits`, {
        params: { date }
      });

      return handleApiResponse<Visit[]>(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Criar nova visita
   */
  static async createVisit(visitData: VisitFormData): Promise<ApiResponse<Visit>> {
    try {
      const response = await backendApi.post('/visits', visitData);

      return handleApiResponse<Visit>(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Atualizar visita existente
   */
  static async updateVisit(id: number, visitData: Partial<VisitFormData>): Promise<ApiResponse<Visit>> {
    try {
      const response = await backendApi.put(`/visits/${id}`, visitData);

      return handleApiResponse<Visit>(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Deletar visita
   */
  static async deleteVisit(id: number): Promise<ApiResponse> {
    try {
      const response = await backendApi.delete(`/visits/${id}`);

      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Marcar visita como concluída
   */
  static async completeVisit(id: number): Promise<ApiResponse<Visit>> {
    try {
      const response = await backendApi.patch(`/visits/${id}`, {
        completed: true,
        status: 'completed'
      });

      return handleApiResponse<Visit>(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Calcular duração de uma visita
   */
  static calculateDuration(forms: number, products: number): number {
    return (forms * 15) + (products * 5);
  }

  /**
   * Validar se uma data pode receber mais visitas
   */
  static canAddVisit(existingVisits: Visit[], newDuration: number): boolean {
    const totalDuration = existingVisits.reduce((sum, visit) => sum + visit.duration, 0);
    return (totalDuration + newDuration) <= 480; // 8 horas = 480 minutos
  }

  /**
   * Encontrar próximo dia disponível
   */
  static findNextAvailableDay(
    visitsByDate: Record<string, Visit[]>,
    startDate: string,
    requiredDuration: number
  ): string | null {
    const start = new Date(startDate);

    for (let i = 1; i <= 30; i++) {
      const checkDate = new Date(start);
      checkDate.setDate(start.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const dayVisits = visitsByDate[dateStr] || [];
      const totalDuration = dayVisits.reduce((sum, visit) => sum + visit.duration, 0);

      if ((totalDuration + requiredDuration) <= 480) {
        return dateStr;
      }
    }

    return null;
  }
}