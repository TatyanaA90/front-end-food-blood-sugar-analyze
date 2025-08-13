import {
  calculateMovingAverage,
  calculateEMA,
  calculateConfidenceInterval,
  calculateTrend,
  calculateLoessSmoothing,
  detectOutliers,
  calculateSeasonality
} from '../trendUtils';

describe('Trend Utilities', () => {
  describe('calculateMovingAverage', () => {
    it('should calculate moving average with window size 3', () => {
      const data = [1, 2, 3, 4, 5, 6];
      const result = calculateMovingAverage(data, 3);
      expect(result).toEqual([2, 3, 4, 5]);
    });

    it('should return original data if window size is larger than data', () => {
      const data = [1, 2, 3];
      const result = calculateMovingAverage(data, 5);
      expect(result).toEqual(data);
    });
  });

  describe('calculateEMA', () => {
    it('should calculate exponential moving average', () => {
      const data = [1, 2, 3, 4, 5];
      const result = calculateEMA(data, 0.5);
      expect(result).toHaveLength(5);
      expect(result[0]).toBe(1);
    });

    it('should handle empty array', () => {
      const result = calculateEMA([]);
      expect(result).toEqual([]);
    });
  });

  describe('calculateConfidenceInterval', () => {
    it('should calculate confidence interval for normal data', () => {
      const data = [1, 2, 3, 4, 5];
      const result = calculateConfidenceInterval(data);
      expect(result).toHaveProperty('lower');
      expect(result).toHaveProperty('upper');
      expect(result).toHaveProperty('mean');
      expect(result.mean).toBe(3);
    });

    it('should handle single value', () => {
      const data = [5];
      const result = calculateConfidenceInterval(data);
      expect(result.lower).toBe(5);
      expect(result.upper).toBe(5);
      expect(result.mean).toBe(5);
    });
  });

  describe('calculateTrend', () => {
    it('should detect increasing trend', () => {
      const data = [1, 2, 3, 4, 5];
      const result = calculateTrend(data);
      expect(result.direction).toBe('increasing');
      expect(result.strength).toBeGreaterThan(0);
    });

    it('should detect decreasing trend', () => {
      const data = [5, 4, 3, 2, 1];
      const result = calculateTrend(data);
      expect(result.direction).toBe('decreasing');
      expect(result.strength).toBeGreaterThan(0);
    });

    it('should detect stable trend', () => {
      const data = [3, 3, 3, 3, 3];
      const result = calculateTrend(data);
      expect(result.direction).toBe('stable');
      expect(result.strength).toBe(0);
    });
  });

  describe('detectOutliers', () => {
    it('should detect outliers using IQR method', () => {
      const data = [1, 2, 3, 100, 4, 5, 6];
      const result = detectOutliers(data);
      expect(result).toContain(100);
    });

    it('should handle data with no outliers', () => {
      const data = [1, 2, 3, 4, 5];
      const result = detectOutliers(data);
      expect(result).toEqual([]);
    });
  });

  describe('calculateSeasonality', () => {
    it('should calculate seasonal patterns', () => {
      const data = [1, 2, 1, 2, 1, 2, 1, 2];
      const result = calculateSeasonality(data, 2);
      expect(result).toHaveLength(8);
    });

    it('should handle insufficient data for seasonality', () => {
      const data = [1, 2, 3];
      const result = calculateSeasonality(data, 4);
      expect(result).toEqual(data);
    });
  });
});
