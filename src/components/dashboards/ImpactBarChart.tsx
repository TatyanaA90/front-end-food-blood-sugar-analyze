import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface Props {
  data: Array<{ group: string; change: number; count?: number }>;
  color: string;
  label: string;
}

const ImpactBarChart: React.FC<Props> = ({ data, color, label }) => {
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
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="change" name={label} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImpactBarChart;


