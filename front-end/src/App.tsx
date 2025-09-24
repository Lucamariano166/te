import React from 'react';
import { ThemeProvider } from 'styled-components';
import { VisitsProvider } from './contexts/VisitsContext';
import { UIProvider } from './contexts/UIContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { Header } from './components/Header/Header';
import { VisitsList } from './components/VisitsList/VisitsList';
import { VisitModal } from './components/VisitModal/VisitModal';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <UIProvider>
        <VisitsProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{
              flex: 1,
              padding: '32px 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}>
              <VisitsList />
            </main>
            <VisitModal />
          </div>
        </VisitsProvider>
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;
