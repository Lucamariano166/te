import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../../contexts/UIContext';
import { useVisits } from '../../contexts/VisitsContext';
import { VisitService } from '../../services/visitService';
import { CepService } from '../../services/cepService';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  CloseButton,
} from '../styled/Modal';
import { Button } from '../styled/Button';
import { Input, InputGroup, Label, ErrorMessage } from '../styled/Input';
import { VisitFormData, Visit } from '../../types';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const FormRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

const FormColumn = styled.div`
  flex: 1;
`;

export function VisitModal() {
  const { state, closeModal, setLoading, showToast } = useUI();
  const { state: visitsState, addVisit, updateVisit, getVisitsByDate } = useVisits();

  const [formData, setFormData] = useState<VisitFormData>({
    date: new Date().toISOString().split('T')[0],
    forms: 1,
    products: 1,
    completed: false,
    address: {
      postal_code: '',
      sublocality: '',
      street: '',
      street_number: '',
      complement: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  // Atualizar data ao abrir o modal
  useEffect(() => {
    if (state.modal.isOpen) {
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
      }));
    }
  }, [state.modal.isOpen]);

  // Carregar dados da visita para edição
  useEffect(() => {
    if (state.modal.mode === 'edit' && state.modal.visitId) {
      const visit = visitsState.visits.find((v: Visit) => v.id === state.modal.visitId);
      if (visit) {
        setFormData({
          date: visit.date,
          forms: visit.forms,
          products: visit.products,
          completed: visit.completed,
          address: {
            postal_code: visit.address.postal_code || '',
            sublocality: visit.address.sublocality || '',
            street: visit.address.street || '',
            street_number: visit.address.street_number || '',
            complement: visit.address.complement || '',
          },
        });
      }
    }
  }, [state.modal.mode, state.modal.visitId, visitsState.visits]);

  if (!state.modal.isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const handleInputChange = (field: keyof VisitFormData | string, value: string | number | boolean) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1] as keyof VisitFormData['address'];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Para campos normais, limpar erro
    if (field !== 'address.postal_code') {
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
      if (apiErrors[field]) setApiErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };


  const handleCepChange = async (cep: string) => {
    const maskedCep = CepService.applyCepMask(cep);
    handleInputChange('address.postal_code', maskedCep);

    if (CepService.isCompleteForLookup(maskedCep)) {
      setCepLoading(true);
      const cepData = await CepService.lookup(maskedCep);
      setCepLoading(false);
      if (cepData && cepData.logradouro) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            postal_code: cepData.cep,
            sublocality: cepData.bairro || '',
            street: cepData.logradouro || '',
          },
        }));
        setErrors(prev => ({ ...prev, 'address.postal_code': '' })); // ✅ só aqui
      } else {
        setFormData(prev => ({
          ...prev,
          address: { ...prev.address, sublocality: '', street: '', street_number: '' },
        }));
        setErrors(prev => ({ ...prev, 'address.postal_code': 'CEP inválido ou não encontrado' })); // ❌ mantém
      }

    } else {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, sublocality: '', street: '', street_number: '' },
      }));
      // Não limpar o erro enquanto o CEP não estiver completo
    }
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = { ...errors }; // Começa com os erros atuais

    if (!formData.date) newErrors.date = 'Data é obrigatória';
    else newErrors.date = '';

    if (new Date(formData.date) < new Date(new Date().toISOString().split('T')[0]))
      newErrors.date = 'Data não pode ser no passado';

    if (!formData.forms || formData.forms < 1) newErrors.forms = 'Número de formulários deve ser maior que 0';
    else newErrors.forms = '';

    if (!formData.products || formData.products < 1) newErrors.products = 'Número de produtos deve ser maior que 0';
    else newErrors.products = '';

    // CEP: respeita erro do lookup
    if (!formData.address.postal_code) {
      newErrors['address.postal_code'] = 'CEP é obrigatório';
    } else if (!CepService.isValidFormat(formData.address.postal_code)) {
      if (!errors['address.postal_code']) {
        newErrors['address.postal_code'] = 'CEP deve ter 8 dígitos';
      }
    }

    if (!formData.address.sublocality) newErrors['address.sublocality'] = 'Bairro é obrigatório';
    else newErrors['address.sublocality'] = '';

    if (!formData.address.street) newErrors['address.street'] = 'Rua é obrigatória';
    else newErrors['address.street'] = '';

    if (!formData.address.street_number) newErrors['address.street_number'] = 'Número é obrigatório';
    else newErrors['address.street_number'] = '';

    const duration = VisitService.calculateDuration(formData.forms, formData.products);
    const dateVisits = getVisitsByDate(formData.date).filter((v: Visit) => v.id !== state.modal.visitId);
    if (!VisitService.canAddVisit(dateVisits, duration))
      newErrors.general = 'Não há tempo disponível nesta data. Limite diário: 8 horas.';
    else newErrors.general = '';

    setErrors(newErrors);
    return Object.values(newErrors).every(e => !e);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação frontend
    const isValid = validateForm();
    if (!isValid) {
      // Mantém os erros existentes (não limpa)
      showToast('Corrija os erros antes de salvar', 'error');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setApiErrors({}); // limpar erros antigos da API

    try {
      let response;
      if (state.modal.mode === 'create') {
        response = await VisitService.createVisit(formData);
      } else if (state.modal.visitId) {
        response = await VisitService.updateVisit(state.modal.visitId, formData);
      }

      if (response.success && response.data) {
        if (state.modal.mode === 'create') addVisit(response.data);
        else if (state.modal.visitId) updateVisit(response.data);

        showToast(
          state.modal.mode === 'create'
            ? 'Visita criada com sucesso!'
            : 'Visita atualizada com sucesso!',
          'success'
        );
        closeModal();
      } else {
        if (response.errors && Object.keys(response.errors).length > 0) {
          setApiErrors(response.errors);
        }
        showToast(response.message || 'Erro ao salvar visita', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro inesperado. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };


  const calculatedDuration = VisitService.calculateDuration(formData.forms, formData.products);

  const modal = (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>{state.modal.mode === 'create' ? 'Nova Visita' : 'Editar Visita'}</ModalTitle>
          <CloseButton onClick={closeModal}>✕</CloseButton>
        </ModalHeader>

        {/* Erros da API */}
        {Object.keys(apiErrors).length > 0 && (
          <div style={{ marginBottom: theme.spacing.md, color: theme.colors.red[600] }}>
            <h4>Erros encontrados:</h4>
            <ul>
              {Object.entries(apiErrors).map(([field, messages]) => (
                <li key={field}>
                  <strong>{field}:</strong> {messages.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <ModalBody>
            {errors.general && <ErrorMessage style={{ marginBottom: theme.spacing.md }}>{errors.general}</ErrorMessage>}

            {/* Linha de Data, Formulários e Produtos */}
            <FormRow>
              <FormColumn>
                <InputGroup>
                  <Label required>Data</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    hasError={!!errors.date || !!apiErrors.date}
                  />
                  {errors.date && <ErrorMessage>{errors.date}</ErrorMessage>}
                  {apiErrors.date && <ErrorMessage>{apiErrors.date.join(', ')}</ErrorMessage>}
                </InputGroup>
              </FormColumn>

              <FormColumn>
                <InputGroup>
                  <Label required>Formulários</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.forms}
                    onChange={(e) => handleInputChange('forms', parseInt(e.target.value) || 0)}
                    hasError={!!errors.forms || !!apiErrors.forms}
                  />
                  {errors.forms && <ErrorMessage>{errors.forms}</ErrorMessage>}
                  {apiErrors.forms && <ErrorMessage>{apiErrors.forms.join(', ')}</ErrorMessage>}
                </InputGroup>
              </FormColumn>

              <FormColumn>
                <InputGroup>
                  <Label required>Produtos</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.products}
                    onChange={(e) => handleInputChange('products', parseInt(e.target.value) || 0)}
                    hasError={!!errors.products || !!apiErrors.products}
                  />
                  {errors.products && <ErrorMessage>{errors.products}</ErrorMessage>}
                  {apiErrors.products && <ErrorMessage>{apiErrors.products.join(', ')}</ErrorMessage>}
                </InputGroup>
              </FormColumn>
            </FormRow>

            {/* Duração e Status */}
            <FormRow style={{ marginTop: theme.spacing.md }}>
              <FormColumn>
                <InputGroup>
                  <Label>Duração Estimada</Label>
                  <Input
                    type="text"
                    value={`${calculatedDuration} minutos (${Math.round(calculatedDuration / 60 * 100) / 100}h)`}
                    disabled
                  />
                </InputGroup>
              </FormColumn>

              <FormColumn>
                <InputGroup>
                  <Label>Status</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
                    <input
                      type="checkbox"
                      id="completed"
                      checked={formData.completed}
                      onChange={(e) => handleInputChange('completed', e.target.checked)}
                    />
                    <label htmlFor="completed">Marcar como concluída</label>
                  </div>
                </InputGroup>
              </FormColumn>
            </FormRow>

            {/* Endereço */}
            <div style={{ marginTop: theme.spacing.lg }}>
              <h3 style={{ marginBottom: theme.spacing.md, color: theme.colors.gray[700] }}>Endereço</h3>

              <FormRow>
                <FormColumn style={{ maxWidth: '200px' }}>
                  <InputGroup>
                    <Label required>CEP</Label>
                    <Input
                      type="text"
                      placeholder="00000-000"
                      value={formData.address.postal_code}
                      onChange={(e) => handleCepChange(e.target.value)}
                      hasError={!!errors['address.postal_code'] || !!apiErrors['address.postal_code']}
                      disabled={cepLoading}
                    />
                    {errors['address.postal_code'] && <ErrorMessage>{errors['address.postal_code']}</ErrorMessage>}
                    {apiErrors['address.postal_code'] && <ErrorMessage>{apiErrors['address.postal_code'].join(', ')}</ErrorMessage>}
                  </InputGroup>
                </FormColumn>

                <FormColumn>
                  <InputGroup>
                    <Label required>Bairro</Label>
                    <Input
                      type="text"
                      value={formData.address.sublocality}
                      onChange={(e) => handleInputChange('address.sublocality', e.target.value)}
                      hasError={!!errors['address.sublocality'] || !!apiErrors['address.sublocality']}
                    />
                    {errors['address.sublocality'] && <ErrorMessage>{errors['address.sublocality']}</ErrorMessage>}
                    {apiErrors['address.sublocality'] && <ErrorMessage>{apiErrors['address.sublocality'].join(', ')}</ErrorMessage>}
                  </InputGroup>
                </FormColumn>
              </FormRow>

              <FormRow style={{ marginTop: theme.spacing.md }}>
                <FormColumn style={{ flex: 2 }}>
                  <InputGroup>
                    <Label required>Rua</Label>
                    <Input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      hasError={!!errors['address.street'] || !!apiErrors['address.street']}
                    />
                    {errors['address.street'] && <ErrorMessage>{errors['address.street']}</ErrorMessage>}
                    {apiErrors['address.street'] && <ErrorMessage>{apiErrors['address.street'].join(', ')}</ErrorMessage>}
                  </InputGroup>
                </FormColumn>

                <FormColumn style={{ maxWidth: '120px' }}>
                  <InputGroup>
                    <Label required>Número</Label>
                    <Input
                      type="text"
                      value={formData.address.street_number}
                      onChange={(e) => handleInputChange('address.street_number', e.target.value)}
                      hasError={!!errors['address.street_number'] || !!apiErrors['address.street_number']}
                    />
                    {errors['address.street_number'] && <ErrorMessage>{errors['address.street_number']}</ErrorMessage>}
                    {apiErrors['address.street_number'] && <ErrorMessage>{apiErrors['address.street_number'].join(', ')}</ErrorMessage>}
                  </InputGroup>
                </FormColumn>
              </FormRow>

              <FormRow style={{ marginTop: theme.spacing.md }}>
                <FormColumn>
                  <InputGroup>
                    <Label>Complemento</Label>
                    <Input
                      type="text"
                      placeholder="Apartamento, bloco, etc."
                      value={formData.address.complement}
                      onChange={(e) => handleInputChange('address.complement', e.target.value)}
                    />
                  </InputGroup>
                </FormColumn>
              </FormRow>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="secondary" type="button" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : state.modal.mode === 'create' ? 'Criar Visita' : 'Salvar Alterações'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );

  return createPortal(modal, document.body);
}
