import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from 'recharts';

interface Point { ts: number; value: number }

interface Props {
  data: Point[];
  rangeStartMs: number;
  rangeEndMs: number;
}

const RecentGlucoseChart: React.FC<Props> = ({ data, rangeStartMs, rangeEndMs }) => {
  return (
    <div className="recent-glucose-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="ts"
            type="number"
            domain={[rangeStartMs, rangeEndMs]}
            tickFormatter={(ts) => new Date(Number(ts)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} domain={[40, 350]} />
          <Tooltip
            labelFormatter={(ts) => new Date(Number(ts)).toLocaleString()}
            formatter={(val: number, name: string) => [Number(val).toFixed(0), name]}
          />
          <Legend />
          <ReferenceLine x={rangeEndMs} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Now', position: 'top', fontSize: 10 }} />
          <Line type="monotone" dataKey="value" name="Glucose" stroke="#2563eb" dot isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RecentGlucoseChart;


