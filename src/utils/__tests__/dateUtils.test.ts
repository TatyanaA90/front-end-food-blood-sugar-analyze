import { describe, it, expect } from 'vitest';
import { 
  toLocalDateTimeString, 
  localDateTimeToUtcIso, 
  utcTimestampToLocalDateTimeString,
  ensureUtcIso 
} from '../dateUtils';

describe('dateUtils', () => {
  describe('toLocalDateTimeString', () => {
    it('should convert Date to local datetime string', () => {
      const date = new Date('2024-08-15T14:30:00');
      const result = toLocalDateTimeString(date);
      expect(result).toBe('2024-08-15T14:30');
    });
  });

  describe('localDateTimeToUtcIso', () => {
    it('should convert local datetime string to UTC ISO without timezone shifting', () => {
      const localTime = '2024-08-15T14:30';
      const result = localDateTimeToUtcIso(localTime);
      
      // The result should preserve the local time as UTC time
      // If user selects 2:30 PM local time, it should be stored as 2:30 PM UTC
      expect(result).toMatch(/^2024-08-15T14:30:00\.\d{3}Z$/);
    });

    it('should preserve 8:36 PM as 8:36 PM UTC', () => {
      const localTime = '2025-08-17T20:36';
      const result = localDateTimeToUtcIso(localTime);
      
      // 8:36 PM local time should become 8:36 PM UTC (not 6:36 AM)
      expect(result).toMatch(/^2025-08-17T20:36:00\.\d{3}Z$/);
    });

    it('should handle empty string', () => {
      const result = localDateTimeToUtcIso('');
      expect(result).toBe('');
    });
  });

  describe('utcTimestampToLocalDateTimeString', () => {
    it('should convert UTC timestamp to local datetime string for form inputs', () => {
      const utcTimestamp = '2024-08-15T14:30:00.000Z';
      const result = utcTimestampToLocalDateTimeString(utcTimestamp);
      
      // Should convert UTC back to local time for form display
      expect(result).toMatch(/^2024-08-15T\d{2}:\d{2}$/);
    });

    it('should handle empty string', () => {
      const result = utcTimestampToLocalDateTimeString('');
      expect(result).toBe('');
    });
  });

  describe('ensureUtcIso', () => {
    it('should add Z suffix to timestamps without timezone info', () => {
      const timestamp = '2024-08-15T14:30:00';
      const result = ensureUtcIso(timestamp);
      expect(result).toBe('2024-08-15T14:30:00Z');
    });

    it('should not modify timestamps that already have timezone info', () => {
      const timestampWithZ = '2024-08-15T14:30:00Z';
      const timestampWithOffset = '2024-08-15T14:30:00+00:00';
      
      expect(ensureUtcIso(timestampWithZ)).toBe(timestampWithZ);
      expect(ensureUtcIso(timestampWithOffset)).toBe(timestampWithOffset);
    });
  });
});
