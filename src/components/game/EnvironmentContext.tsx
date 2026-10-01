"use client";

import { createContext, useContext, type ReactNode } from "react";

import { ENVIRONMENTS, type Lexicon, type PackEnvironment } from "../../lib/packs/environment";

const EnvironmentContext = createContext<PackEnvironment>(ENVIRONMENTS.ocean);

export function EnvironmentProvider({
  environment,
  children,
}: Readonly<{ environment: PackEnvironment; children: ReactNode }>) {
  return <EnvironmentContext.Provider value={environment}>{children}</EnvironmentContext.Provider>;
}

export const useEnvironment = (): PackEnvironment => useContext(EnvironmentContext);
export const useLexicon = (): Lexicon => useContext(EnvironmentContext).lexicon;
