import { createContext, Dispatch, PropsWithChildren, useContext, useMemo, useReducer } from 'react';

import { createRpgSandboxState, RpgSandboxAction, RpgSandboxState, rpgSandboxReducer } from '@/src/domain/rpgSandbox';

type RpgSandboxContextValue = {
  state: RpgSandboxState;
  dispatch: Dispatch<RpgSandboxAction>;
  reset: () => void;
};

const RpgSandboxContext = createContext<RpgSandboxContextValue | undefined>(undefined);

export function RpgSandboxProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(rpgSandboxReducer, undefined, createRpgSandboxState);
  const value = useMemo(() => ({ state, dispatch, reset: () => dispatch({ type: 'reset' }) }), [state]);
  return <RpgSandboxContext.Provider value={value}>{children}</RpgSandboxContext.Provider>;
}

export function useRpgSandbox() {
  const value = useContext(RpgSandboxContext);
  if (!value) throw new Error('useRpgSandbox must be used inside RpgSandboxProvider');
  return value;
}
