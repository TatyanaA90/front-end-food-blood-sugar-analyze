import { createContext } from 'react';

export type GlucoseUnit = 'mg/dL' | 'mmol/L';

export interface GlucoseUnitContextType {
  preferredUnit: GlucoseUnit;
  setPreferredUnit: (unit: GlucoseUnit) => void;
  convertValue: (value: number, fromUnit: GlucoseUnit, toUnit?: GlucoseUnit) => number;
  formatValue: (value: number, unit: GlucoseUnit) => string;
  displayValue: (value: number, originalUnit: GlucoseUnit) => { value: number; unit: GlucoseUnit; converted: boolean };
}

export interface GlucoseUnitProviderProps {
  children: React.ReactNode;
}

export const GlucoseUnitContext = createContext<GlucoseUnitContextType | undefined>(undefined);
