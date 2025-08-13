import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Scatter } from 'recharts';
import { formatTimestampForDisplay, formatTimestampForTooltip } from '../../utils/dateUtils';
import './TimelineWithEventsChart.css';

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
      <div className="timeline-empty-state">
        <p>No glucose data for selected time range</p>
      </div>
    );
  }

  return (
    <div className="timeline-with-events-chart">
      <div className="timeline-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.2)" />

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
              formatter={(value: number | null, name: string) => {
                if (name === 'glucose') return [`${value} mg/dL`, 'Glucose'];
                if (name === 'meal') return ['Meal Event', 'Meal'];
                if (name === 'insulin') return ['Insulin Event', 'Insulin'];
                if (name === 'activity') return ['Activity Event', 'Activity'];
                return [value, name];
              }}
              contentStyle={{
                background: 'rgba(0, 0, 0, 0.95)',
                border: '1px solid rgba(0, 212, 255, 0.6)',
                borderRadius: 12,
                backdropFilter: 'blur(15px)'
              }}
            />

            {/* Target Range Reference Lines */}
            <ReferenceLine y={targetLow} stroke="#00ff88" strokeDasharray="3 3" strokeWidth={2} />
            <ReferenceLine y={targetHigh} stroke="#00ff88" strokeDasharray="3 3" strokeWidth={2} />

            {/* Glucose Line */}
            <Line
              type="monotone"
              dataKey="glucose"
              name="glucose"
              stroke="#00d4ff"
              strokeWidth={3}
              dot={{ r: 4, fill: '#00d4ff', stroke: '#ffffff', strokeWidth: 1 }}
              activeDot={{ r: 6, fill: '#00d4ff', stroke: '#ffffff', strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />

            {/* Event Markers */}
            <Scatter
              dataKey="meal"
              name="meal"
              fill="#00ff88"
              stroke="#00cc6a"
              strokeWidth={2}
              r={8}
              shape="diamond"
            />

            <Scatter
              dataKey="insulin"
              name="insulin"
              fill="#ff6b35"
              stroke="#f7931e"
              strokeWidth={2}
              r={8}
              shape="triangle"
            />

            <Scatter
              dataKey="activity"
              name="activity"
              fill="#8a2be2"
              stroke="#6d28d9"
              strokeWidth={2}
              r={8}
              shape="square"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Event Summary */}
      <div className="timeline-event-summary">
        <div className="timeline-legend-item glucose">
          <div className="timeline-legend-line glucose" style={{ width: 12, height: 3 }}></div>
          <span>Glucose</span>
        </div>
        <div className="timeline-legend-item target">
          <div className="timeline-legend-line target" style={{ width: 12, height: 2 }}></div>
          <span>Target (70-180)</span>
        </div>
        <div className="timeline-legend-item meal">
          <div className="timeline-legend-shape meal" style={{ width: 8, height: 8 }}></div>
          <span>Meals: {chartData.filter(d => d.meal !== null).length}</span>
        </div>
        <div className="timeline-legend-item insulin">
          <div className="timeline-legend-shape insulin" style={{ width: 8, height: 8 }}></div>
          <span>Insulin: {chartData.filter(d => d.insulin !== null).length}</span>
        </div>
        <div className="timeline-legend-item activity">
          <div className="timeline-legend-shape activity" style={{ width: 8, height: 8 }}></div>
          <span>Activities: {chartData.filter(d => d.activity !== null).length}</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineWithEventsChart;


