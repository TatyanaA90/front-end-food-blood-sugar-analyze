import React from 'react';

interface VariabilityMetrics {
  standard_deviation: number | null;
  coefficient_of_variation: number | null;
  glucose_management_indicator: number | null;
  mean_glucose?: number | null;
}

interface Props {
  metrics: VariabilityMetrics;
  unit: 'mg/dL' | 'mmol/L';
}

const format = (v: number | null, unit?: string) => {
  if (v === null || v === undefined) return '—';
  return unit ? `${v}${unit}` : String(v);
};

const GlucoseVariabilityCard: React.FC<Props> = ({ metrics, unit }) => {
  return (
    <div className="dashboard-card" style={{ padding: 16 }}>
      <div className="dashboard-card-header">
        <h3 className="dashboard-section-title">Glucose Variability</h3>
      </div>
      <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <div className="dashboard-stat-item" style={{ padding: 12 }}>
          <div className="dashboard-stat-label">Std Dev</div>
          <div className="dashboard-stat-value">{format(metrics.standard_deviation, ` ${unit}`)}</div>
        </div>
        <div className="dashboard-stat-item" style={{ padding: 12 }}>
          <div className="dashboard-stat-label">CV</div>
          <div className="dashboard-stat-value">{format(metrics.coefficient_of_variation, ' %')}</div>
        </div>
        <div className="dashboard-stat-item" style={{ padding: 12 }}>
          <div className="dashboard-stat-label">GMI</div>
          <div className="dashboard-stat-value">{format(metrics.glucose_management_indicator, ' %')}</div>
        </div>
        {metrics.mean_glucose != null && (
          <div className="dashboard-stat-item" style={{ padding: 12 }}>
            <div className="dashboard-stat-label">Mean</div>
            <div className="dashboard-stat-value">{format(metrics.mean_glucose, ` ${unit}`)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlucoseVariabilityCard;


