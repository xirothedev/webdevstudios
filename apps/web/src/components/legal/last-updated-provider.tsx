'use client';

import { createContext, useContext } from 'react';

interface LastUpdatedContextValue {
  date: string;
}

const LastUpdatedContext = createContext<LastUpdatedContextValue | null>(null);

export function LastUpdatedProvider({
  date,
  children,
}: {
  date: string;
  children: React.ReactNode;
}) {
  return (
    <LastUpdatedContext.Provider value={{ date }}>
      {children}
    </LastUpdatedContext.Provider>
  );
}

export function useLastUpdated() {
  return useContext(LastUpdatedContext);
}
