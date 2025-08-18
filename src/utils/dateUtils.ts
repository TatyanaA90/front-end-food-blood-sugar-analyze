export interface TimeRange {
  startMs: number;
  endMs: number;
  startIso: string;
  endIso: string;
}

// Parse local datetime string to Date object
export const parseLocalDateTime = (dateTimeString: string): Date => {
  if (!dateTimeString) return new Date();

  // Handle both date-only and date-time formats
  const [datePart, timePart = '00:00'] = dateTimeString.split('T');
  const fullDateTimeString = `${datePart}T${timePart}`;

  // Create date in local timezone
  const date = new Date(fullDateTimeString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateTimeString}`);
  }
  return date;
};

// Convert Date to local datetime string for input fields
export const toLocalDateTimeString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Convert local datetime string to UTC ISO string without timezone shifting
// This preserves the local time as-is when converting to UTC
export const localDateTimeToUtcIso = (localDateTimeString: string): string => {
  if (!localDateTimeString) return '';
  
  // Create a Date object from the local datetime string
  // JavaScript will treat this as local time
  const localDate = new Date(localDateTimeString);
  
  // Get the timezone offset in minutes
  const timezoneOffset = localDate.getTimezoneOffset();
  
  // Adjust the time by the timezone offset to get UTC time
  // This preserves the local time as the UTC time
  const utcDate = new Date(localDate.getTime() - (timezoneOffset * 60 * 1000));
  
  return utcDate.toISOString();
};

// Ensure a timestamp string is in UTC ISO format
export const ensureUtcIso = (timestamp: string): string => {
  if (!timestamp) return timestamp;
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(timestamp)) {
    return timestamp;
  }
  return `${timestamp}Z`;
};

// Convert any timestamp to milliseconds since epoch
export const toMilliseconds = (timestamp: string | number | Date): number => {
  if (typeof timestamp === 'number') {
    return timestamp;
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  return new Date(timestamp).getTime();
};

// Calculate time range from start/end date strings
export const calculateTimeRange = (startDate: string, endDate: string): TimeRange => {
  const start = parseLocalDateTime(startDate);
  const end = parseLocalDateTime(endDate);

  // Only add 23:59:59 if the end date is a date-only string (no time specified)
  // This preserves exact times for hour/week ranges while ensuring full day coverage for day ranges
  if (endDate.includes('T') && endDate.split('T')[1] !== '00:00') {
    // Time is specified, use it as-is
  } else {
    // Date only, add end of day
    end.setHours(23, 59, 59, 999);
  }

  return {
    startMs: start.getTime(),
    endMs: end.getTime(),
    startIso: start.toISOString(),
    endIso: end.toISOString()
  };
};

// Get default time ranges for different modes
export const getDefaultTimeRange = (mode: 'hour' | 'day' | 'week' | 'custom'): { startDate: string; endDate: string } => {
  const now = new Date();

  switch (mode) {
    case 'hour': {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      return {
        startDate: toLocalDateTimeString(oneHourAgo),
        endDate: toLocalDateTimeString(now)
      };
    }
    case 'day': {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return {
        startDate: toLocalDateTimeString(today),
        endDate: toLocalDateTimeString(today)
      };
    }
    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        startDate: toLocalDateTimeString(weekAgo),
        endDate: toLocalDateTimeString(now)
      };
    }
    case 'custom':
    default: {
      const todayDefault = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return {
        startDate: toLocalDateTimeString(todayDefault),
        endDate: toLocalDateTimeString(todayDefault)
      };
    }
  }
};

// Filter data points within a time range
export const filterByTimeRange = <T extends { time: number }>(data: T[], timeRange: TimeRange): T[] => {
  return data.filter(item =>
    item.time >= timeRange.startMs && item.time <= timeRange.endMs
  );
};

// Format timestamp for chart axis display
export const formatTimestampForDisplay = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format timestamp for chart tooltip display
export const formatTimestampForTooltip = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
