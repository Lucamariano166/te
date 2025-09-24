import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';
import { Visit } from '../../types';

interface VisitItemProps {
  visit: Visit;
  onEdit: () => void;
  onComplete: () => void;
}

const ItemContainer = styled.div<{ completed: boolean }>`
  background: ${theme.colors.background.card};
  border: 2px solid ${({ completed }) =>
    completed ? theme.colors.success : theme.colors.gray[200]
  };
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  transition: all ${theme.transitions.duration.normal} ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: ${({ completed }) =>
      completed
        ? theme.colors.success
        : theme.colors.primary.gradient
    };
  }

  &:hover {
    border-color: ${theme.colors.primary.main};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }

  ${({ completed }) =>
    completed &&
    css`
      background: ${theme.colors.success}05;

      &::after {
        content: '✓';
        position: absolute;
        top: ${theme.spacing.sm};
        right: ${theme.spacing.sm};
        font-size: 20px;
        opacity: 0.7;
      }
    `}
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
  gap: ${theme.spacing.md};
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
`;

const StatusBadge = styled.div<{ variant: 'pending' | 'completed' }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};

  ${({ variant }) => {
    switch (variant) {
      case 'completed':
        return css`
          background: ${theme.colors.success}15;
          color: ${theme.colors.success};
        `;
      case 'pending':
      default:
        return css`
          background: ${theme.colors.warning}15;
          color: ${theme.colors.warning};
        `;
    }
  }}
`;

const MetricsRow = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
`;

const MetricIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

const MetricValue = styled.span`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary.black};
`;

const AddressSection = styled.div`
  background: ${theme.colors.background.accent};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const AddressTitle = styled.h4`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[700]};
  margin: 0 0 ${theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const AddressText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
  margin: 0;
  line-height: 1.4;
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'success' }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.duration.fast} ease;

  ${({ variant }) => {
    switch (variant) {
      case 'success':
        return css`
          background: ${theme.colors.success};
          color: ${theme.colors.primary.white};

          &:hover {
            background: #00c5a4;
            transform: translateY(-1px);
          }
        `;
      case 'primary':
      default:
        return css`
          background: ${theme.colors.background.card};
          color: ${theme.colors.gray[700]};
          border: 2px solid ${theme.colors.gray[200]};

          &:hover {
            border-color: ${theme.colors.primary.main};
            color: ${theme.colors.primary.main};
            transform: translateY(-1px);
          }
        `;
    }
  }}

  &:active {
    transform: translateY(0);
  }
`;

const DurationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.primary.gradient};
  color: ${theme.colors.primary.white};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  box-shadow: ${theme.shadows.sm};
`;

export function VisitItem({ visit, onEdit, onComplete }: VisitItemProps) {
  const formatAddress = () => {
    if (!visit.address) return 'Endereço não informado';

    const { street, street_number, postal_code } = visit.address;
    return `${street}, ${street_number} - ${postal_code}`;
  };

  const formatLocation = () => {
    if (!visit.address) return '';

    const { sublocality } = visit.address;
    return sublocality || 'Localização não informada';
  };

  const getDurationText = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  return (
    <ItemContainer completed={visit.completed}>
      <ItemHeader>
        <ItemInfo>
          <ItemTitle>
            <StatusBadge variant={visit.completed ? 'completed' : 'pending'}>
              {visit.completed ? '✅ Concluída' : '⏳ Pendente'}
            </StatusBadge>
          </ItemTitle>

          <MetricsRow>
            <MetricItem>
              <MetricIcon>📝</MetricIcon>
              <MetricValue>{visit.forms}</MetricValue>
              <span>formulário{visit.forms !== 1 ? 's' : ''}</span>
            </MetricItem>

            <MetricItem>
              <MetricIcon>📦</MetricIcon>
              <MetricValue>{visit.products}</MetricValue>
              <span>produto{visit.products !== 1 ? 's' : ''}</span>
            </MetricItem>

            <MetricItem>
              <MetricIcon>⏱️</MetricIcon>
              <span>Duração estimada:</span>
              <MetricValue>{getDurationText(visit.duration || 0)}</MetricValue>
            </MetricItem>
          </MetricsRow>
        </ItemInfo>

        <DurationBadge>
          <span>⏰</span>
          {getDurationText(visit.duration || 0)}
        </DurationBadge>
      </ItemHeader>

      <AddressSection>
        <AddressTitle>
          <span>📍</span>
          Endereço da Visita
        </AddressTitle>
        <AddressText>
          <strong>{formatAddress()}</strong>
          <br />
          {formatLocation()}
        </AddressText>
      </AddressSection>

      <Actions>
        {!visit.completed && (
          <>
            <ActionButton onClick={onEdit}>
              <span>✏️</span>
              Editar
            </ActionButton>
            <ActionButton variant="success" onClick={onComplete}>
              <span>✅</span>
              Concluir
            </ActionButton>
          </>
        )}

        {visit.completed && (
          <ActionButton onClick={onEdit}>
            <span>👁️</span>
            Ver Detalhes
          </ActionButton>
        )}
      </Actions>
    </ItemContainer>
  );
}