import { useContext } from 'react';
import { GlucoseUnitContext } from '../contexts/GlucoseUnitContextDef';
import type { GlucoseUnitContextType } from '../contexts/GlucoseUnitContextDef';
import type { GlucoseReading } from '../types/glucose';

export const useGlucoseUnit = (): GlucoseUnitContextType => {
  const context = useContext(GlucoseUnitContext);
  if (context === undefined) {
    throw new Error('useGlucoseUnit must be used within a GlucoseUnitProvider');
  }
  return context;
};

export const useGlucoseUnitUtils = () => {
    const { preferredUnit, setPreferredUnit, convertValue, formatValue, displayValue } = useGlucoseUnit();

    // Convert a glucose reading to the preferred unit
    const convertReading = (reading: GlucoseReading) => {
        const converted = reading.unit !== preferredUnit;
        const displayValue = converted ? convertValue(reading.reading, reading.unit, preferredUnit) : reading.reading;

        return {
            ...reading,
            displayValue,
            displayUnit: preferredUnit,
            converted,
            formattedValue: formatValue(displayValue, preferredUnit)
        };
    };

    // Get status based on converted value
    const getReadingStatus = (reading: GlucoseReading) => {
        const value = reading.unit === 'mg/dL' ? reading.reading : convertValue(reading.reading, reading.unit, 'mg/dL');

        if (value < 70) return { status: 'low', color: '#ef4444', label: 'Low' };
        if (value > 180) return { status: 'high', color: '#f59e0b', label: 'High' };
        return { status: 'normal', color: '#10b981', label: 'Normal' };
    };

    // Get range labels for the preferred unit
    const getRangeLabels = () => {
        if (preferredUnit === 'mg/dL') {
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

    // Get validation ranges for the preferred unit
    const getValidationRanges = () => {
        if (preferredUnit === 'mg/dL') {
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

    return {
        preferredUnit,
        setPreferredUnit,
        convertValue,
        formatValue,
        displayValue,
        convertReading,
        getReadingStatus,
        getRangeLabels,
        getValidationRanges
    };
}; 