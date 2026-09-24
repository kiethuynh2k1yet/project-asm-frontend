'use client';

import { GlobalStyle } from '@/app/styles/global-styles';

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <>
      <GlobalStyle />
      {children}
    </>
  );
}