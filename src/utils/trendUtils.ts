/**
 * Trend calculation utilities for insulin impact analysis
 */

/**
 * Calculate simple moving average for a given window size
 */
export const calculateMovingAverage = (
  data: number[],
  windowSize: number
): number[] => {
  if (data.length < windowSize) return data;
  
  const result: number[] = [];
  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
    result.push(average);
  }
  
  return result;
};

/**
 * Calculate exponential moving average (EMA)
 */
export const calculateEMA = (
  data: number[],
  alpha: number = 0.3
): number[] => {
  if (data.length === 0) return [];
  
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
    result.push(ema);
  }
  
  return result;
};

/**
 * Calculate confidence interval for a dataset
 */
export const calculateConfidenceInterval = (
  data: number[],
  confidenceLevel: number = 0.95
): { lower: number; upper: number; mean: number } => {
  if (data.length < 2) {
    const value = data[0] || 0;
    return { lower: value, upper: value, mean: value };
  }
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
  const stdDev = Math.sqrt(variance);
  
  // Z-score for 95% confidence (1.96)
  const zScore = 1.96;
  const marginOfError = zScore * (stdDev / Math.sqrt(data.length));
  
  return {
    lower: mean - marginOfError,
    upper: mean + marginOfError,
    mean
  };
};

/**
 * Calculate trend direction and strength
 */
export const calculateTrend = (
  data: number[]
): { direction: 'increasing' | 'decreasing' | 'stable'; strength: number } => {
  if (data.length < 2) {
    return { direction: 'stable', strength: 0 };
  }
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  const strength = Math.abs(difference) / Math.max(Math.abs(firstAvg), 0.1);
  
  if (Math.abs(difference) < 0.1) {
    return { direction: 'stable', strength: 0 };
  }
  
  return {
    direction: difference > 0 ? 'increasing' : 'decreasing',
    strength: Math.min(strength, 1)
  };
};

/**
 * Apply LOESS smoothing to data points
 * Simplified implementation using local polynomial regression
 */
export const calculateLoessSmoothing = (
  data: number[],
  windowSize: number = 5
): number[] => {
  if (data.length < windowSize) return data;
  
  const result: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(data.length, i + halfWindow + 1);
    const window = data.slice(start, end);
    
    // Simple local average for smoothing
    const smoothed = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(smoothed);
  }
  
  return result;
};

/**
 * Detect outliers using IQR method
 */
export const detectOutliers = (data: number[]): number[] => {
  if (data.length < 4) return [];
  
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return data.filter(val => val < lowerBound || val > upperBound);
};

/**
 * Calculate seasonality patterns (basic implementation)
 */
export const calculateSeasonality = (
  data: number[],
  period: number
): number[] => {
  if (data.length < period * 2) return data;
  
  const seasonalPatterns: number[] = [];
  for (let i = 0; i < period; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = i; j < data.length; j += period) {
      sum += data[j];
      count++;
    }
    
    seasonalPatterns.push(count > 0 ? sum / count : 0);
  }
  
  // Apply seasonal pattern to data
  return data.map((val, index) => {
    const seasonalIndex = index % period;
    return seasonalPatterns[seasonalIndex];
  });
};
