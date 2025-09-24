import { cepApi, handleApiError } from './api';
import { ViaCepResponse } from '../types';

export class CepService {
  /**
   * Validar formato do CEP
   */
  static isValidFormat(cep: string): boolean {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.length === 8;
  }

  /**
   * Limpar CEP removendo formatação
   */
  static cleanCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  /**
   * Formatar CEP com máscara
   */
  static formatCep(cep: string): string {
    const cleanCep = this.cleanCep(cep);
    if (cleanCep.length === 8) {
      return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
    }
    return cep;
  }

  /**
   * Consultar CEP na API ViaCEP
   */
  static async lookup(cep: string): Promise<ViaCepResponse | null> {
    try {
      const cleanCep = this.cleanCep(cep);

      if (!this.isValidFormat(cep)) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await cepApi.get(`/${cleanCep}/json/`);

      if (response.data.erro) {
        return null;
      }

      return {
        ...response.data,
        cep: this.formatCep(response.data.cep),
      };
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      return null;
    }
  }

  /**
   * Aplicar máscara no CEP conforme o usuário digita
   */
  static applyCepMask(value: string): string {
    const cleanValue = value.replace(/\D/g, '');

    if (cleanValue.length <= 5) {
      return cleanValue;
    }

    return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`;
  }

  /**
   * Validar se CEP está completo para consulta
   */
  static isCompleteForLookup(cep: string): boolean {
    const cleanCep = this.cleanCep(cep);
    return cleanCep.length === 8;
  }
}