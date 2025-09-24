import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${theme.colors.background.main};
    color: ${theme.colors.primary.black};
    overflow-x: hidden;
    width: 100%;
    margin: 0;
    padding: 0;
    line-height: 1.6;
  }

  #root {
    min-height: 100vh;
    width: 100%;
    margin: 0 auto;
  }

  /* Scrollbar customization */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.gray[100]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.gray[300]};
    border-radius: ${theme.borderRadius.md};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.gray[400]};
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid ${theme.colors.primary.blue};
    outline-offset: 2px;
  }

  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid ${theme.colors.primary.blue};
    outline-offset: 2px;
  }

  /* Loading animations */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-10px);
      opacity: 0;
    }
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  /* Toast container */
  .toast-container {
    position: fixed;
    top: ${theme.spacing.lg};
    right: ${theme.spacing.lg};
    z-index: ${theme.zIndex.modal + 1};
    pointer-events: none;
  }

  .toast-container > * {
    pointer-events: auto;
  }
`;