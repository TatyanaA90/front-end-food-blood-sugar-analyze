import React from 'react';

type RangeMode = 'hour' | 'day' | 'week' | 'custom';

interface Props {
  rangeMode: RangeMode;
  startDate: string; // local 'YYYY-MM-DDTHH:mm'
  endDate: string;   // local 'YYYY-MM-DDTHH:mm'
  onChangeMode: (mode: RangeMode) => void;
  onChangeStart: (local: string) => void;
  onChangeEnd: (local: string) => void;
}

// Values provided are already local-formatted; no extra conversion

const TimeRangeControls: React.FC<Props> = ({ rangeMode, startDate, endDate, onChangeMode, onChangeStart, onChangeEnd }) => {
  return (
    <div className="dashboard-card">
      <div className="time-range-controls">
        <h3 className="dashboard-section-title">Time Range</h3>
        <div className="time-range-controls-right">
          <div className="time-range-buttons">
            <button type="button" onClick={() => onChangeMode('hour')} className={`time-range-btn ${rangeMode === 'hour' ? 'active' : ''}`}>Last Hour</button>
            <button type="button" onClick={() => onChangeMode('day')} className={`time-range-btn ${rangeMode === 'day' ? 'active' : ''}`}>Today</button>
            <button type="button" onClick={() => onChangeMode('week')} className={`time-range-btn ${rangeMode === 'week' ? 'active' : ''}`}>Last 7 Days</button>
            <button type="button" onClick={() => onChangeMode('custom')} className={`time-range-btn ${rangeMode === 'custom' ? 'active' : ''}`}>Custom</button>
          </div>
          {rangeMode === 'custom' && (
            <div className="time-range-custom">
              <label className="time-range-label">From</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => onChangeStart(e.target.value)}
              />
              <label className="time-range-label">To</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => onChangeEnd(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeRangeControls;


