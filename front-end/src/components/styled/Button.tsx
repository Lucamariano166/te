import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const getVariantStyles = (variant: ButtonProps['variant']) => {
  switch (variant) {
    case 'primary':
      return css`
        background: ${theme.colors.primary.gradient};
        color: ${theme.colors.primary.white};
        border: none;
        box-shadow: ${theme.shadows.insta};
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left ${theme.transitions.duration.slow} ease;
        }

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: ${theme.shadows.lg};

          &::before {
            left: 100%;
          }
        }

        &:active {
          transform: translateY(0);
        }

        &:focus {
          box-shadow: 0 0 0 3px rgba(225, 48, 108, 0.3);
        }
      `;

    case 'secondary':
      return css`
        background-color: ${theme.colors.background.card};
        color: ${theme.colors.gray[700]};
        border: 2px solid ${theme.colors.gray[200]};

        &:hover:not(:disabled) {
          border-color: ${theme.colors.primary.main};
          color: ${theme.colors.primary.main};
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.sm};
        }

        &:focus {
          box-shadow: 0 0 0 3px rgba(225, 48, 108, 0.15);
        }
      `;

    case 'danger':
      return css`
        background-color: ${theme.colors.error};
        color: ${theme.colors.primary.white};
        border: none;
        box-shadow: ${theme.shadows.sm};

        &:hover:not(:disabled) {
          background-color: #d32f2f;
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.md};
        }

        &:focus {
          box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.3);
        }
      `;

    case 'success':
      return css`
        background-color: ${theme.colors.success};
        color: ${theme.colors.primary.white};
        border: none;
        box-shadow: ${theme.shadows.sm};

        &:hover:not(:disabled) {
          background-color: #00c5a4;
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.md};
        }

        &:focus {
          box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.3);
        }
      `;

    default:
      return css`
        background: ${theme.colors.primary.gradient};
        color: ${theme.colors.primary.white};
        border: none;
      `;
  }
};

const getSizeStyles = (size: ButtonProps['size']) => {
  switch (size) {
    case 'sm':
      return css`
        padding: ${theme.spacing.xs} ${theme.spacing.sm};
        font-size: ${theme.typography.fontSize.sm};
        line-height: ${theme.typography.lineHeight.tight};
      `;

    case 'lg':
      return css`
        padding: ${theme.spacing.md} ${theme.spacing.lg};
        font-size: ${theme.typography.fontSize.lg};
        line-height: ${theme.typography.lineHeight.normal};
      `;

    case 'md':
    default:
      return css`
        padding: ${theme.spacing.sm} ${theme.spacing.md};
        font-size: ${theme.typography.fontSize.base};
        line-height: ${theme.typography.lineHeight.normal};
      `;
  }
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  font-family: inherit;
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  user-select: none;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  cursor: pointer;
  white-space: nowrap;

  ${({ variant }) => getVariantStyles(variant)}
  ${({ size }) => getSizeStyles(size)}

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    `}

  ${({ loading }) =>
    loading &&
    css`
      cursor: not-allowed;
      pointer-events: none;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin ${theme.transitions.duration.normal} linear infinite;
      }
    `}
`;

export const IconButton = styled.button<{ size?: 'sm' | 'md' | 'lg' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ size }) => {
    switch (size) {
      case 'sm':
        return theme.spacing.xs;
      case 'lg':
        return theme.spacing.md;
      default:
        return theme.spacing.sm;
    }
  }};
  background: transparent;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: background-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  color: ${theme.colors.gray[600]};

  &:hover {
    background-color: ${theme.colors.gray[100]};
    color: ${theme.colors.gray[800]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;