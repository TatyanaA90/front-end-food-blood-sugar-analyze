import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

type TimeInRange = {
  very_low: number;
  low: number;
  in_range: number;
  high: number;
  very_high: number;
};

interface Props {
  tir: TimeInRange;
  unit: 'mg/dL' | 'mmol/L';
  height?: number;
  outerRadius?: number;
  innerRadius?: number;
  showLegend?: boolean;
}

const COLORS = {
  very_low: 'var(--danger)',
  low: 'var(--warning)',
  in_range: 'var(--success)',
  high: 'var(--info)',
  very_high: 'var(--violet)'
} as const;

const TimeInRangePie: React.FC<Props> = ({ tir, height = 280, outerRadius = 90, innerRadius = 40, showLegend = true }) => {
  const data = [
    { name: 'Very Low', value: tir.very_low, key: 'very_low' },
    { name: 'Low', value: tir.low, key: 'low' },
    { name: 'In Range', value: tir.in_range, key: 'in_range' },
    { name: 'High', value: tir.high, key: 'high' },
    { name: 'Very High', value: tir.very_high, key: 'very_high' },
  ];

  const renderTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; fill?: string }> }) => {
    if (!active || !payload || payload.length === 0) return null;
    const p = payload[0] as { name?: string; value?: number; fill?: string };
    return (
      <div className="tooltip-glucose">
        <div className="tooltip-glucose-row">
          <span className="tooltip-swatch" style={{ background: p.fill }} />
          <span className="tooltip-glucose-label">{p.name}:</span>
          <span className="tooltip-glucose-value">{Number(p.value).toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  const RADIAN = Math.PI / 180;
  const renderLabel = (props: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; payload: { value?: number } }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, payload } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const value = Number(payload.value);
    if (!value || value <= 0) return null;
    return (
      <text x={x} y={y} fill={getComputedStyle(document.documentElement).getPropertyValue('--text-on-emphasis').trim() || '#ffffff'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: 12, fontWeight: 700 }}>
        {`${Math.round(value)}%`}
      </text>
    );
  };

  return (
    <div className="chart-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={outerRadius} innerRadius={innerRadius} stroke="none" labelLine={false} label={(p: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; payload: { value?: number } }) => renderLabel(p)}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeInRangePie;


