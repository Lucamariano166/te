import styled, { css, keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const fadeIn = keyframes`
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
  to {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
`;

const slideIn = keyframes`
  from {
    transform: scale(0.95) translateY(40px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  to {
    transform: scale(0.95) translateY(40px);
    opacity: 0;
  }
`;

interface ModalOverlayProps {
  isClosing?: boolean;
}

export const ModalOverlay = styled.div<ModalOverlayProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(38, 38, 38, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: ${theme.spacing.lg};
  overflow-y: auto;

  animation: ${({ isClosing }) => (isClosing ? fadeOut : fadeIn)}
    ${theme.transitions.duration.slow} ${theme.transitions.easing.easeInOut};

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.md};
    align-items: center;
    padding-top: ${theme.spacing.lg};
    padding-bottom: ${theme.spacing.lg};
  }

  @media (max-height: 700px) {
    align-items: flex-start;
    padding-top: ${theme.spacing.lg};
  }
`;

interface ModalContentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isClosing?: boolean;
}

const getModalSize = (size: ModalContentProps['size']) => {
  switch (size) {
    case 'sm':
      return css`
        max-width: 400px;
      `;
    case 'lg':
      return css`
        max-width: 800px;
      `;
    case 'xl':
      return css`
        max-width: 1200px;
      `;
    case 'md':
    default:
      return css`
        max-width: 600px;
      `;
  }
};

export const ModalContent = styled.div<ModalContentProps>`
  background: ${theme.colors.background.card};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  width: 100%;
  ${({ size }) => getModalSize(size)}
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);

  animation: ${({ isClosing }) => (isClosing ? slideOut : slideIn)}
    ${theme.transitions.duration.slow} ${theme.transitions.easing.easeInOut};

  @media (max-width: ${theme.breakpoints.sm}) {
    max-height: 85vh;
    margin: auto;
    width: calc(100% - ${theme.spacing.md} * 2);
  }

  @media (max-height: 700px) {
    max-height: calc(100vh - ${theme.spacing.lg} * 2);
    margin: 0 auto;
  }
`;

export const ModalHeader = styled.div`
  padding: ${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${theme.colors.primary.gradient};
    border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.lg} ${theme.spacing.md} ${theme.spacing.md};
  }
`;

export const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  background: ${theme.colors.primary.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: ${theme.typography.lineHeight.tight};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &::before {
    content: '';
    font-size: ${theme.typography.fontSize.xl};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

export const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
  overflow-y: auto;
  flex: 1;

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.md};
  }

  /* Custom scrollbar for modal body */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.gray[100]};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.gray[300]};
    border-radius: ${theme.borderRadius.full};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.gray[400]};
  }
`;

export const ModalFooter = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.gray[200]};
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
  flex-shrink: 0;

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.md};
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: ${theme.colors.background.accent};
  border: 2px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.full};
  cursor: pointer;
  color: ${theme.colors.gray[600]};
  font-size: 18px;
  font-weight: bold;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};

  &:hover {
    background: ${theme.colors.error};
    border-color: ${theme.colors.error};
    color: ${theme.colors.primary.white};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: 3px solid rgba(225, 48, 108, 0.3);
    outline-offset: 2px;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Loading overlay para quando modal está carregando
export const ModalLoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  &::after {
    content: '';
    width: 32px;
    height: 32px;
    border: 3px solid ${theme.colors.gray[200]};
    border-top: 3px solid ${theme.colors.primary.blue};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
`;