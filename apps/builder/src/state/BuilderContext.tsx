import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  builderReducer,
  createInitialBuilderState,
  type BuilderAction,
  type BuilderState,
} from "./builderState";

type BuilderContextValue = {
  state: BuilderState;
  dispatch: Dispatch<BuilderAction>;
};

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    builderReducer,
    undefined,
    createInitialBuilderState
  );
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilder must be used within BuilderProvider");
  }
  return context;
}
