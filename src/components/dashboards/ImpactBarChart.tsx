import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from 'recharts';

interface Props {
  data: Array<{ group: string; avg: number; peak: number; count?: number }>;
  unit: 'mg/dL' | 'mmol/L';
}

const ImpactBarChart: React.FC<Props> = ({ data, unit }) => {
  if (!data || data.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p className="dashboard-empty-text">No data for the selected range</p>
      </div>
    );
  }
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="group" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={['dataMin', 'dataMax']} />
          <Tooltip formatter={(v: number) => [unit === 'mg/dL' ? v.toFixed(0) : v.toFixed(1), '']} />
          <Legend />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          <Bar dataKey="avg" name={`Avg Δ ${unit}`} fill="#34d399" />
          <Bar dataKey="peak" name={`Peak Δ ${unit}`} fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImpactBarChart;


