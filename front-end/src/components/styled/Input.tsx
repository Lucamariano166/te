import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface InputProps {
  hasError?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
`;

export const Label = styled.label<{ required?: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[700]};
  line-height: ${theme.typography.lineHeight.tight};

  ${({ required }) =>
    required &&
    css`
      &::after {
        content: ' *';
        color: ${theme.colors.error};
      }
    `}
`;

export const Input = styled.input<InputProps>`
  width: 100%;
  padding: ${({ size }) => {
    switch (size) {
      case 'sm':
        return `${theme.spacing.xs} ${theme.spacing.sm}`;
      case 'lg':
        return `${theme.spacing.md} ${theme.spacing.lg}`;
      default:
        return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm':
        return theme.typography.fontSize.sm;
      case 'lg':
        return theme.typography.fontSize.lg;
      default:
        return theme.typography.fontSize.base;
    }
  }};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${theme.colors.gray[800]};
  background-color: ${theme.colors.primary.white};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};

  &::placeholder {
    color: ${theme.colors.gray[400]};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.blue};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  ${({ hasError }) =>
    hasError &&
    css`
      border-color: ${theme.colors.error};
      background-color: #fff5f5;

      &:focus {
        border-color: ${theme.colors.error};
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${theme.colors.gray[100]};
      color: ${theme.colors.gray[500]};
      cursor: not-allowed;
      border-color: ${theme.colors.gray[200]};

      &:focus {
        box-shadow: none;
      }
    `}
`;

export const Textarea = styled.textarea<InputProps>`
  width: 100%;
  min-height: 80px;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${theme.colors.gray[800]};
  background-color: ${theme.colors.primary.white};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  resize: vertical;
  font-family: inherit;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};

  &::placeholder {
    color: ${theme.colors.gray[400]};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.blue};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  ${({ hasError }) =>
    hasError &&
    css`
      border-color: ${theme.colors.error};
      background-color: #fff5f5;

      &:focus {
        border-color: ${theme.colors.error};
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${theme.colors.gray[100]};
      color: ${theme.colors.gray[500]};
      cursor: not-allowed;
      border-color: ${theme.colors.gray[200]};

      &:focus {
        box-shadow: none;
      }
    `}
`;

export const Select = styled.select<InputProps>`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${theme.colors.gray[800]};
  background-color: ${theme.colors.primary.white};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.blue};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  ${({ hasError }) =>
    hasError &&
    css`
      border-color: ${theme.colors.error};
      background-color: #fff5f5;

      &:focus {
        border-color: ${theme.colors.error};
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${theme.colors.gray[100]};
      color: ${theme.colors.gray[500]};
      cursor: not-allowed;
      border-color: ${theme.colors.gray[200]};

      &:focus {
        box-shadow: none;
      }
    `}
`;

export const ErrorMessage = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error};
  line-height: ${theme.typography.lineHeight.tight};
  margin-top: ${theme.spacing.xs};
`;

export const HelperText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[500]};
  line-height: ${theme.typography.lineHeight.tight};
  margin-top: ${theme.spacing.xs};
`;