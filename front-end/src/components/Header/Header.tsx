import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from '../styled/Button';
import { useUI } from '../../contexts/UIContext';
import { useVisits } from '../../contexts/VisitsContext';

const HeaderContainer = styled.header`
  background: ${theme.colors.background.card};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  box-shadow: ${theme.shadows.card};
  padding: ${theme.spacing.lg} 0;
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.header};
  width: 100%;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.md} 0;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing.md};
    align-items: stretch;
    padding: 0 ${theme.spacing.sm};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: transform ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};

  &:hover {
    transform: translateY(-2px);
  }
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${theme.colors.primary.gradient};
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: ${theme.shadows.insta};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: ${theme.colors.primary.gradient};
    border-radius: ${theme.borderRadius.xl};
    z-index: -1;
    opacity: 0;
    transition: opacity ${theme.transitions.duration.normal};
  }

  &:hover::before {
    opacity: 0.3;
  }
`;

const LogoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const LogoText = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  background: ${theme.colors.primary.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: ${theme.typography.lineHeight.tight};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const LogoSubtext = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
  font-weight: ${theme.typography.fontWeight.medium};
  letter-spacing: 0.5px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    justify-content: center;
  }
`;

const StatsBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: 0 ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.background.accent};
  height: 36px;

  @media (max-width: ${theme.breakpoints.sm}) {
    display: none;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const StatIcon = styled.span`
  font-size: 16px;
`;

const StatNumber = styled.span`
  color: ${theme.colors.primary.main};
  font-weight: ${theme.typography.fontWeight.bold};
`;

export function Header() {
  const { openModal } = useUI();
  const { state } = useVisits();

  const handleNewVisit = () => {
    openModal('create');
  };

  const totalVisits = state.visits.length;
  const completedVisits = state.visits.filter(v => v.completed).length;
  const pendingVisits = totalVisits - completedVisits;

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <LogoIcon>✨</LogoIcon>
          <LogoContent>
            <LogoText>VisitPro</LogoText>
            <LogoSubtext>Agendador Profissional</LogoSubtext>
          </LogoContent>
        </Logo>

        <StatsBar>
          <StatItem>
            <StatIcon>📊</StatIcon>
            <StatNumber>{totalVisits}</StatNumber>
            <span>Visitas</span>
          </StatItem>
          <StatItem>
            <StatIcon>✅</StatIcon>
            <StatNumber>{completedVisits}</StatNumber>
            <span>Concluídas</span>
          </StatItem>
          <StatItem>
            <StatIcon>⏳</StatIcon>
            <StatNumber>{pendingVisits}</StatNumber>
            <span>Pendentes</span>
          </StatItem>
        </StatsBar>

        <Actions>
          <Button
            variant="primary"
            size="md"
            onClick={handleNewVisit}
          >
            ✨ Nova Visita
          </Button>
        </Actions>
      </HeaderContent>
    </HeaderContainer>
  );
}