import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { useGlucoseUnitUtils } from '../../hooks/useGlucoseUnit';

interface Point { ts: number; value: number }

interface Props {
  data: Point[];
  rangeStartMs: number;
  rangeEndMs: number;
}

const RecentGlucoseChart: React.FC<Props> = ({ data, rangeStartMs, rangeEndMs }) => {
  const { preferredUnit, convertValue } = useGlucoseUnitUtils();

  // API values are in mg/dL. Convert for display if needed.
  const displayData = (data || []).map(p => ({
    ts: p.ts,
    value: preferredUnit === 'mg/dL' ? p.value : convertValue(p.value, 'mg/dL', 'mmol/L')
  }));

  const yDomain = preferredUnit === 'mg/dL' ? [40, 350] : [2, 20];
  const valueFormatter = (v: number) => preferredUnit === 'mg/dL' ? Number(v).toFixed(0) : Number(v).toFixed(1);
  const seriesName = preferredUnit === 'mg/dL' ? 'Glucose (mg/dL)' : 'Glucose (mmol/L)';
  return (
    <div className="recent-glucose-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={displayData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, rgba(148,163,184,0.3))" />
          <XAxis
            dataKey="ts"
            type="number"
            domain={[rangeStartMs, rangeEndMs]}
            tickFormatter={(ts) => new Date(Number(ts)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            tick={{ fontSize: 12, fill: 'var(--chart-tick, #374151)' }}
          />
          <YAxis tick={{ fontSize: 12, fill: 'var(--chart-tick, #374151)' }} domain={yDomain} />
          <Tooltip
            labelFormatter={(ts) => new Date(Number(ts)).toLocaleString()}
            formatter={(val: number) => [valueFormatter(val), seriesName]}
          />
          <Legend />
          <ReferenceLine x={rangeEndMs} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Now', position: 'top', fontSize: 10 }} />
          <Line type="monotone" dataKey="value" name={seriesName} stroke="var(--chart-line, #2563eb)" dot isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RecentGlucoseChart;


