import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useVisits } from '../../contexts/VisitsContext';
import { useUI } from '../../contexts/UIContext';
import { VisitGroup } from '../VisitGroup/VisitGroup';
import { WorkdayService } from '../../services/workdayService';

const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing.sm};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl} ${theme.spacing.lg};
  background: ${theme.colors.background.card};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.card};
  margin: ${theme.spacing.xl} 0;
`;

const EmptyIcon = styled.div`
  font-size: 80px;
  margin-bottom: ${theme.spacing.lg};
  background: ${theme.colors.primary.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const EmptyTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  background: ${theme.colors.primary.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${theme.spacing.sm};
`;

const EmptyDescription = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.gray[600]};
  max-width: 500px;
  margin: 0 auto ${theme.spacing.lg} auto;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const EmptyActions = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const StartButton = styled.button`
  background: ${theme.colors.primary.gradient};
  color: ${theme.colors.primary.white};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: transform ${theme.transitions.duration.normal} ease;
  box-shadow: ${theme.shadows.insta};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }
`;

const VisitsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.gray[600]};
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${theme.colors.gray[200]};
  border-top: 4px solid ${theme.colors.primary.main};
  border-radius: 50%;
  margin: 0 auto ${theme.spacing.lg} auto;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export function VisitsList() {
  const { state, completeVisit } = useVisits();
  const { openModal, setLoading, showToast } = useUI();

  const handleEditVisit = (visitId: number) => {
    openModal('edit', visitId);
  };

  const handleCompleteVisit = (visitId: number) => {
    try {
      completeVisit(visitId);
      showToast('Visita marcada como concluída!', 'success');
    } catch (error) {
      showToast('Erro ao completar visita', 'error');
    }
  };

  const handleCloseDay = async (date: string) => {
    try {
      setLoading(true);
      showToast('Fechando dia e realocando visitas pendentes...', 'info');

      await WorkdayService.closeDay(date);
      showToast('Dia fechado! Visitas pendentes foram realocadas.', 'success');

      // Refresh visits after reallocation
      // This would trigger a refresh in the context

    } catch (error) {
      showToast('Erro ao fechar o dia', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartFirstVisit = () => {
    openModal('create');
  };

  if (state.loading.isLoading) {
    return (
      <Container>
        <LoadingState>
          <LoadingSpinner />
          <h3>Carregando visitas...</h3>
          <p>Aguarde enquanto buscamos suas informações</p>
        </LoadingState>
      </Container>
    );
  }

  if (state.visits.length === 0) {
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>🚀</EmptyIcon>
          <EmptyTitle>Bem-vindo ao VisitPro!</EmptyTitle>
          <EmptyDescription>
            Organize suas visitas de forma profissional e eficiente.
            Comece criando sua primeira visita e transforme seu dia de trabalho!
          </EmptyDescription>
          <EmptyActions>
            <StartButton onClick={handleStartFirstVisit}>
              <span>+</span>
              Criar Primeira Visita
            </StartButton>
          </EmptyActions>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <VisitsContainer>
        {Object.entries(state.groupedVisits)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, group]) => (
            <VisitGroup
              key={date}
              date={date}
              group={group}
              onEditVisit={handleEditVisit}
              onCompleteVisit={handleCompleteVisit}
              onCloseDay={handleCloseDay}
            />
          ))
        }
      </VisitsContainer>
    </Container>
  );
}