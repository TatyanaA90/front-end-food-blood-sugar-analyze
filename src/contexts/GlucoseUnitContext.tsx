import React, { useState, useEffect } from 'react';
import { GlucoseUnitContext } from './GlucoseUnitContextDef';
import type { GlucoseUnitContextType, GlucoseUnit, GlucoseUnitProviderProps } from './GlucoseUnitContextDef';
import { convertMgDlToMmolL, convertMmolLToMgDl } from '../utils/glucoseUtils';

const STORAGE_KEY = 'glucose_preferred_unit';

// Unit conversion provided by shared utils

export const GlucoseUnitProvider: React.FC<GlucoseUnitProviderProps> = ({ children }) => {
  const [preferredUnit, setPreferredUnitState] = useState<GlucoseUnit>('mg/dL');

  // Load preferred unit from localStorage on mount
  useEffect(() => {
    const storedUnit = localStorage.getItem(STORAGE_KEY) as GlucoseUnit;
    if (storedUnit && (storedUnit === 'mg/dL' || storedUnit === 'mmol/L')) {
      setPreferredUnitState(storedUnit);
    }
  }, []);

  const setPreferredUnit = (unit: GlucoseUnit) => {
    setPreferredUnitState(unit);
    localStorage.setItem(STORAGE_KEY, unit);
  };

  const convertValue = (value: number, fromUnit: GlucoseUnit, toUnit?: GlucoseUnit): number => {
    const targetUnit = toUnit || preferredUnit;

    if (fromUnit === targetUnit) {
      return value;
    }

    if (fromUnit === 'mg/dL' && targetUnit === 'mmol/L') {
      return convertMgDlToMmolL(value);
    } else if (fromUnit === 'mmol/L' && targetUnit === 'mg/dL') {
      return convertMmolLToMgDl(value);
    }

    return value;
  };

  const formatValue = (value: number, unit: GlucoseUnit): string => {
    if (unit === 'mmol/L') {
      return value.toFixed(1);
    }
    return Math.round(value).toString();
  };

  const displayValue = (value: number, originalUnit: GlucoseUnit) => {
    const converted = originalUnit !== preferredUnit;
    const displayValue = converted ? convertValue(value, originalUnit, preferredUnit) : value;

    return {
      value: displayValue,
      unit: preferredUnit,
      converted
    };
  };

  const value: GlucoseUnitContextType = {
    preferredUnit,
    setPreferredUnit,
    convertValue,
    formatValue,
    displayValue
  };

  return (
    <GlucoseUnitContext.Provider value={value}>
      {children}
    </GlucoseUnitContext.Provider>
  );
};

