import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Scatter } from 'recharts';
import { formatTimestampForDisplay, formatTimestampForTooltip } from '../../utils/dateUtils';

interface SeriesPoint {
  ts: number;
  glucose: number | null;
  meal: number | null;
  insulin: number | null;
  activity: number | null;
}

interface Props {
  data: SeriesPoint[];
  rangeStartMs: number;
  rangeEndMs: number;
  hasRealData?: boolean;
}

const TimelineWithEventsChart: React.FC<Props> = ({ data, rangeStartMs, rangeEndMs, hasRealData = true }) => {
  // Define target ranges
  const targetLow = 70;
  const targetHigh = 180;

  // Transform data for visualization
  const chartData = data
    .filter(point => point.glucose !== null)
    .map(point => ({
      time: point.ts,
      glucose: point.glucose,
      meal: point.meal !== null ? point.glucose : null,
      insulin: point.insulin !== null ? point.glucose : null,
      activity: point.activity !== null ? point.glucose : null
    }))
    .sort((a, b) => a.time - b.time);

  if (!hasRealData) {
    return (
      <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 8 }}>
        <p style={{ color: '#64748b', fontSize: 14 }}>No glucose data for selected time range</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

          <XAxis
            dataKey="time"
            type="number"
            domain={[rangeStartMs, rangeEndMs]}
            tickFormatter={formatTimestampForDisplay}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 10 }}
            domain={[40, 350]}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            labelFormatter={formatTimestampForTooltip}
            formatter={(value: any, name: string) => {
              if (name === 'glucose') return [`${value} mg/dL`, 'Glucose'];
              if (name === 'meal') return ['Meal Event', 'Meal'];
              if (name === 'insulin') return ['Insulin Event', 'Insulin'];
              if (name === 'activity') return ['Activity Event', 'Activity'];
              return [value, name];
            }}
            contentStyle={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8
            }}
          />

          {/* Target Range Reference Lines */}
          <ReferenceLine y={targetLow} stroke="#10b981" strokeDasharray="3 3" strokeWidth={2} />
          <ReferenceLine y={targetHigh} stroke="#10b981" strokeDasharray="3 3" strokeWidth={2} />

          {/* Glucose Line */}
          <Line
            type="monotone"
            dataKey="glucose"
            name="glucose"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2563eb' }}
            activeDot={{ r: 6 }}
            connectNulls
            isAnimationActive={false}
          />

          {/* Event Markers */}
          <Scatter
            dataKey="meal"
            name="meal"
            fill="#059669"
            stroke="#047857"
            strokeWidth={2}
            r={8}
            shape="diamond"
          />

          <Scatter
            dataKey="insulin"
            name="insulin"
            fill="#f97316"
            stroke="#ea580c"
            strokeWidth={2}
            r={8}
            shape="triangle"
          />

          <Scatter
            dataKey="activity"
            name="activity"
            fill="#7c3aed"
            stroke="#6d28d9"
            strokeWidth={2}
            r={8}
            shape="square"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Event Summary */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center', fontSize: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 3, background: '#2563eb', borderRadius: 2 }}></div>
          <span>Glucose</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 2, background: '#10b981', borderTop: '1px dashed #10b981' }}></div>
          <span>Target (70-180)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, background: '#059669', transform: 'rotate(45deg)' }}></div>
          <span>Meals: {chartData.filter(d => d.meal !== null).length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, background: '#f97316', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          <span>Insulin: {chartData.filter(d => d.insulin !== null).length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, background: '#7c3aed' }}></div>
          <span>Activities: {chartData.filter(d => d.activity !== null).length}</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineWithEventsChart;


