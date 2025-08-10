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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h3 className="dashboard-section-title" style={{ margin: 0 }}>Time Range</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => onChangeMode('hour')} className={`btn ${rangeMode === 'hour' ? 'active' : ''}`} style={{ padding: '4px 8px', borderRadius: 8 }}>Last Hour</button>
            <button type="button" onClick={() => onChangeMode('day')} className={`btn ${rangeMode === 'day' ? 'active' : ''}`} style={{ padding: '4px 8px', borderRadius: 8 }}>Today</button>
            <button type="button" onClick={() => onChangeMode('week')} className={`btn ${rangeMode === 'week' ? 'active' : ''}`} style={{ padding: '4px 8px', borderRadius: 8 }}>Last 7 Days</button>
            <button type="button" onClick={() => onChangeMode('custom')} className={`btn ${rangeMode === 'custom' ? 'active' : ''}`} style={{ padding: '4px 8px', borderRadius: 8 }}>Custom</button>
          </div>
          {rangeMode === 'custom' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 12 }}>From</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => onChangeStart(e.target.value)}
              />
              <label style={{ fontSize: 12 }}>To</label>
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


