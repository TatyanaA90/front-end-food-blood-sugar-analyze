import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Scatter } from 'recharts';
import { formatTimestampForDisplay } from '../../utils/dateUtils';
import { useGlucoseUnitUtils } from '../../hooks/useGlucoseUnit';
import './TimelineWithEventsChart.css';

interface SeriesPoint {
  ts: number;
  glucose: number | null;
  meal: number | null;
  insulin: number | null;
  activity: number | null;
  mealLabel?: string;
  insulinLabel?: string;
  activityLabel?: string;
}

interface Props {
  data: SeriesPoint[];
  rangeStartMs: number;
  rangeEndMs: number;
  hasRealData?: boolean;
}

const TimelineWithEventsChart: React.FC<Props> = ({ data, rangeStartMs, rangeEndMs, hasRealData = true }) => {
  const { preferredUnit, convertValue } = useGlucoseUnitUtils();
  // Define target ranges in display unit
  const targetLow = preferredUnit === 'mg/dL' ? 70 : convertValue(70, 'mg/dL', 'mmol/L');
  const targetHigh = preferredUnit === 'mg/dL' ? 180 : convertValue(180, 'mg/dL', 'mmol/L');

  // Transform data for visualization
  const chartData = data
    .filter(point => point.glucose !== null)
    .map(point => ({
      time: point.ts,
      glucose: preferredUnit === 'mg/dL' ? Number(point.glucose) : convertValue(Number(point.glucose), 'mg/dL', 'mmol/L'),
      meal: point.meal !== null ? (preferredUnit === 'mg/dL' ? Number(point.glucose) : convertValue(Number(point.glucose), 'mg/dL', 'mmol/L')) : null,
      insulin: point.insulin !== null ? (preferredUnit === 'mg/dL' ? Number(point.glucose) : convertValue(Number(point.glucose), 'mg/dL', 'mmol/L')) : null,
      activity: point.activity !== null ? (preferredUnit === 'mg/dL' ? Number(point.glucose) : convertValue(Number(point.glucose), 'mg/dL', 'mmol/L')) : null,
      mealLabel: point.mealLabel,
      insulinLabel: point.insulinLabel,
      activityLabel: point.activityLabel
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
              domain={preferredUnit === 'mg/dL' ? [40, 350] : [2, 20]}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={({ label, payload }) => {
                const ts = Number(label);
                const rows: Array<{ label: string; value: string; color: string }> = [];
                const unit = preferredUnit === 'mg/dL' ? 'mg/dL' : 'mmol/L';
                const g = payload?.find((p: any) => p?.dataKey === 'glucose');
                if (g && g.value != null) rows.push({ label: 'Glucose', value: `${preferredUnit === 'mg/dL' ? Number(g.value).toFixed(0) : Number(g.value).toFixed(1)} ${unit}`, color: '#00d4ff' });
                const meal = payload?.find((p: any) => p?.dataKey === 'meal');
                if (meal) rows.push({ label: 'Meal', value: String(meal.payload?.mealLabel || meal.payload?.label || 'meal'), color: '#00ff88' });
                const insulin = payload?.find((p: any) => p?.dataKey === 'insulin');
                if (insulin) rows.push({ label: 'Insulin', value: String(insulin.payload?.insulinLabel || insulin.payload?.label || 'insulin'), color: '#ff6b35' });
                const act = payload?.find((p: any) => p?.dataKey === 'activity');
                if (act) rows.push({ label: 'Activity', value: String(act.payload?.activityLabel || act.payload?.label || 'activity'), color: '#8a2be2' });
                if (rows.length === 0) return null;
                return (
                  <div className="tooltip-glucose">
                    <div className="tooltip-glucose-time">{new Date(ts).toLocaleString()}</div>
                    {rows.map((r, i) => (
                      <div key={i} className="tooltip-glucose-row">
                        <span className="tooltip-swatch" style={{ background: r.color }} />
                        <span className="tooltip-glucose-label">{r.label}:</span>
                        <span className="tooltip-glucose-value">{r.value}</span>
                      </div>
                    ))}
                  </div>
                );
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
          <div className="timeline-legend-line glucose" data-w="12" data-h="3"></div>
          <span>Glucose</span>
        </div>
        <div className="timeline-legend-item target">
          <div className="timeline-legend-line target" data-w="12" data-h="2"></div>
          <span>Target (70-180)</span>
        </div>
        <div className="timeline-legend-item meal">
          <div className="timeline-legend-shape meal" data-w="8" data-h="8"></div>
          <span>Meals: {chartData.filter(d => d.meal !== null).length}</span>
        </div>
        <div className="timeline-legend-item insulin">
          <div className="timeline-legend-shape insulin" data-w="8" data-h="8"></div>
          <span>Insulin: {chartData.filter(d => d.insulin !== null).length}</span>
        </div>
        <div className="timeline-legend-item activity">
          <div className="timeline-legend-shape activity" data-w="8" data-h="8"></div>
          <span>Activities: {chartData.filter(d => d.activity !== null).length}</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineWithEventsChart;


