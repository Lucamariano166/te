import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { VisitItem } from '../VisitItem/VisitItem';
import { Visit, GroupedVisits } from '../../types';

interface VisitGroupProps {
  date: string;
  group: GroupedVisits[string];
  onEditVisit: (visitId: number) => void;
  onCompleteVisit: (visitId: number) => void;
  onCloseDay: (date: string) => void;
}

const GroupContainer = styled.div`
  background: ${theme.colors.background.card};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.card};
  margin-bottom: ${theme.spacing.lg};
  overflow: hidden;
  transition: transform ${theme.transitions.duration.normal} ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const GroupHeader = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background.accent};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${theme.colors.primary.gradient};
  }
`;

const DateRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
    align-items: flex-start;
  }
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const DateIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${theme.colors.primary.gradient};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: ${theme.shadows.sm};
`;

const DateText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DateLabel = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.black};
  margin: 0;
  line-height: 1.2;
`;

const DateSubtext = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const StatsRow = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: center;
  flex-wrap: wrap;
`;

const StatBadge = styled.div<{ variant?: 'primary' | 'success' | 'warning' | 'error' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};

  background-color: ${({ variant }) => {
    switch (variant) {
      case 'success': return `${theme.colors.success}15`;
      case 'warning': return `${theme.colors.warning}15`;
      case 'error': return `${theme.colors.error}15`;
      default: return `${theme.colors.primary.main}15`;
    }
  }};

  color: ${({ variant }) => {
    switch (variant) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.primary.main;
    }
  }};
`;

const ProgressContainer = styled.div`
  margin-top: ${theme.spacing.md};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number; color: string }>`
  height: 100%;
  width: ${({ percentage }) => Math.min(percentage, 100)}%;
  background: ${({ color }) => color};
  border-radius: ${theme.borderRadius.full};
  transition: width ${theme.transitions.duration.slow} ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const GroupBody = styled.div`
  padding: ${theme.spacing.lg};
`;

const VisitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const CloseButton = styled.button`
  background: ${theme.colors.primary.gradient};
  color: ${theme.colors.primary.white};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: transform ${theme.transitions.duration.fast} ease;
  box-shadow: ${theme.shadows.sm};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
  }
`;

export function VisitGroup({ date, group, onEditVisit, onCompleteVisit, onCloseDay }: VisitGroupProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    }

    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    const formatted = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${weekday}. ${formatted}`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 60) return theme.colors.error;
    if (percentage > 90) return theme.colors.success;
    return theme.colors.primary.main;
  };

  const usagePercentage = (group.totalDuration / 480) * 100; // 480 min = 8 hours
  const completionRate = group.completionRate;
  const pendingCount = group.totalCount - group.completedCount;

  return (
    <GroupContainer>
      <GroupHeader>
        <DateRow>
          <DateInfo>
            <DateIcon>📅</DateIcon>
            <DateText>
              <DateLabel>{formatDate(date)}</DateLabel>
              <DateSubtext>{group.visits.length} visitas agendadas</DateSubtext>
            </DateText>
          </DateInfo>

          {pendingCount === 0 && group.visits.length > 0 && (
            <CloseButton onClick={() => onCloseDay(date)}>
              Fechar Dia
            </CloseButton>
          )}
        </DateRow>

        <StatsRow>
          <StatBadge>
            <span>📊</span>
            {group.visits.length} visitas
          </StatBadge>

          <StatBadge variant="success">
            <span>✅</span>
            {group.completedCount} concluídas
          </StatBadge>

          <StatBadge variant="warning">
            <span>⏳</span>
            {pendingCount} pendentes
          </StatBadge>

          <StatBadge variant={usagePercentage > 100 ? 'error' : 'primary'}>
            <span>⏰</span>
            {group.totalDuration}min de 480min
          </StatBadge>
        </StatsRow>

        <ProgressContainer>
          <ProgressLabel>
            <span>Ocupação do dia</span>
            <span>{Math.round(usagePercentage)}%</span>
          </ProgressLabel>
          <ProgressBar>
            <ProgressFill
              percentage={usagePercentage}
              color={getProgressColor(usagePercentage)}
            />
          </ProgressBar>
        </ProgressContainer>
      </GroupHeader>

      <GroupBody>
        <VisitsList>
          {group.visits.map((visit: Visit) => (
            <VisitItem
              key={visit.id}
              visit={visit}
              onEdit={() => onEditVisit(visit.id!)}
              onComplete={() => onCompleteVisit(visit.id!)}
            />
          ))}
        </VisitsList>
      </GroupBody>
    </GroupContainer>
  );
}