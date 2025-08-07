import type { GlucoseUnit } from '../contexts/GlucoseUnitContext';

// Unit conversion functions
export const convertMgDlToMmolL = (mgDl: number): number => {
  return Math.round((mgDl / 18) * 10) / 10;
};

export const convertMmolLToMgDl = (mmolL: number): number => {
  return Math.round(mmolL * 18);
};

export const convertGlucoseValue = (value: number, fromUnit: GlucoseUnit, toUnit: GlucoseUnit): number => {
  if (fromUnit === toUnit) {
    return value;
  }

  if (fromUnit === 'mg/dL' && toUnit === 'mmol/L') {
    return convertMgDlToMmolL(value);
  } else if (fromUnit === 'mmol/L' && toUnit === 'mg/dL') {
    return convertMmolLToMgDl(value);
  }

  return value;
};

export const formatGlucoseValue = (value: number, unit: GlucoseUnit): string => {
  if (unit === 'mmol/L') {
    return value.toFixed(1);
  }
  return Math.round(value).toString();
};

export const getGlucoseStatus = (value: number, unit: GlucoseUnit) => {
  // Convert to mg/dL for status calculation
  const mgDlValue = unit === 'mg/dL' ? value : convertMmolLToMgDl(value);
  
  if (mgDlValue < 70) return { status: 'low', color: '#ef4444', label: 'Low' };
  if (mgDlValue > 180) return { status: 'high', color: '#f59e0b', label: 'High' };
  return { status: 'normal', color: '#10b981', label: 'Normal' };
};

export const getGlucoseRanges = (unit: GlucoseUnit) => {
  if (unit === 'mg/dL') {
    return {
      low: '< 70',
      normal: '70 - 180',
      high: '> 180'
    };
  } else {
    return {
      low: '< 3.9',
      normal: '3.9 - 10.0',
      high: '> 10.0'
    };
  }
};

export const getValidationRanges = (unit: GlucoseUnit) => {
  if (unit === 'mg/dL') {
    return {
      min: 0,
      max: 1000,
      step: 1
    };
  } else {
    return {
      min: 0,
      max: 55,
      step: 0.1
    };
  }
}; 