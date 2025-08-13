import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Scatter,
  ScatterChart
} from 'recharts';
import { TrendingDown, Target, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { convertGlucoseValue, formatGlucoseValue } from '../../utils/glucoseUtils';
import type { GlucoseUnit } from '../../contexts/GlucoseUnitContext';
import './InsulinImpactChart.css';

interface InsulinImpactData {
  group: string;
  avg_glucose_change: number;
  avg_insulin_units: number;
  insulin_sensitivity: number;
  num_doses: number;
  response_time_minutes: number;
  effectiveness_score: number;
  correlation_coefficient: number | null;
  std_dev_change: number;
}

interface OverallAnalysis {
  total_doses_analyzed: number;
  avg_insulin_sensitivity: number | null;
  most_effective_dose_range: string | null;
  recommendations: string[];
}

interface Props {
  data: InsulinImpactData[];
  overallAnalysis: OverallAnalysis | null;
  unit: GlucoseUnit;
  showTrends?: boolean;
}

const InsulinImpactChart: React.FC<Props> = ({
  data,
  overallAnalysis,
  unit,
  showTrends = true
}) => {
  const [selectedChart, setSelectedChart] = useState<'effectiveness' | 'response-time' | 'sensitivity'>('effectiveness');

  // Convert data to display units
  const convertedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      avg_glucose_change: convertGlucoseValue(item.avg_glucose_change, 'mg/dL', unit),
      insulin_sensitivity: convertGlucoseValue(item.insulin_sensitivity, 'mg/dL', unit)
    }));
  }, [data, unit]);

  // Calculate trend data (moving average)
  const trendData = useMemo(() => {
    if (!showTrends || convertedData.length < 3) return null;
    
    const windowSize = Math.min(3, Math.floor(convertedData.length / 2));
    const trends = [] as Array<{
      group: string;
      glucose_change: number;
      effectiveness: number;
      moving_avg_change: number;
      moving_avg_effectiveness: number;
    }>;
    
    for (let i = windowSize - 1; i < convertedData.length; i++) {
      const window = convertedData.slice(i - windowSize + 1, i + 1);
      const avgChange = window.reduce((sum, item) => sum + item.avg_glucose_change, 0) / window.length;
      const avgEffectiveness = window.reduce((sum, item) => sum + item.effectiveness_score, 0) / window.length;
      
      trends.push({
        group: convertedData[i].group,
        glucose_change: convertedData[i].avg_glucose_change,
        effectiveness: convertedData[i].effectiveness_score,
        moving_avg_change: avgChange,
        moving_avg_effectiveness: avgEffectiveness
      });
    }
    
    return trends;
  }, [convertedData, showTrends]);

  // Format tooltip values with proper units
  const formatTooltipValue = (value: number, name: string) => {
    if (name.includes('glucose') || name.includes('sensitivity')) {
      return [formatGlucoseValue(value, unit), name];
    }
    if (name.includes('effectiveness')) {
      return [`${(value * 100).toFixed(1)}%`, name];
    }
    if (name.includes('time')) {
      return [`${value.toFixed(1)} min`, name];
    }
    return [value, name];
  };

  if (!data || data.length === 0) {
    return (
      <div className="insulin-impact-empty">
        <Activity className="empty-icon" />
        <p>No insulin impact data for the selected range</p>
        <small>Add insulin doses and glucose readings to see analysis</small>
      </div>
    );
  }

  return (
    <div className="insulin-impact-chart">
      {/* Summary Cards */}
      {overallAnalysis && (
        <div className="summary-cards">
          <div className="summary-card total-doses">
            <Target className="card-icon" />
            <div className="card-content">
              <h4>Total Doses</h4>
              <span className="card-value" aria-label="total-doses">
                {Number(overallAnalysis.total_doses_analyzed ?? 0)}
              </span>
            </div>
          </div>
          
          <div className="summary-card sensitivity">
            <TrendingDown className="card-icon" />
            <div className="card-content">
              <h4>Avg Sensitivity</h4>
              <span className="card-value" aria-label="avg-sensitivity">
                {overallAnalysis.avg_insulin_sensitivity !== null && overallAnalysis.avg_insulin_sensitivity !== undefined
                  ? formatGlucoseValue(convertGlucoseValue(overallAnalysis.avg_insulin_sensitivity, 'mg/dL', unit), unit)
                  : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="summary-card effectiveness">
            <CheckCircle className="card-icon" />
            <div className="card-content">
              <h4>Most Effective</h4>
              <span className="card-value" aria-label="most-effective">
                {(overallAnalysis.most_effective_dose_range || 'N/A').replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Type Selector */}
      <div className="chart-controls">
        <button
          className={`chart-btn ${selectedChart === 'effectiveness' ? 'active' : ''}`}
          onClick={() => setSelectedChart('effectiveness')}
        >
          Effectiveness
        </button>
        <button
          className={`chart-btn ${selectedChart === 'response-time' ? 'active' : ''}`}
          onClick={() => setSelectedChart('response-time')}
        >
          Response Time
        </button>
        <button
          className={`chart-btn ${selectedChart === 'sensitivity' ? 'active' : ''}`}
          onClick={() => setSelectedChart('sensitivity')}
        >
          Sensitivity
        </button>
      </div>

      {/* Main Chart */}
      <div className="chart-container">
        {selectedChart === 'effectiveness' && (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={trendData || convertedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis yAxisId="left" orientation="left" label={{ value: `Glucose Change (${unit})`, angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Effectiveness (%)', angle: 90, position: 'insideRight' }} />
              
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              
              {/* Glucose Change Bars */}
              <Bar 
                yAxisId="left"
                dataKey="glucose_change" 
                name={`Glucose Change (${unit})`}
                fill="#ff6b35" 
                opacity={0.9}
                radius={[4, 4, 0, 0]}
              />
              
              {/* Effectiveness Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="effectiveness"
                name="Effectiveness"
                stroke="#00d4ff"
                strokeWidth={4}
                dot={{ r: 8, fill: '#00d4ff', stroke: '#ffffff', strokeWidth: 2 }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Moving Average Trends */}
              {trendData && showTrends && (
                <>
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="moving_avg_change"
                    name="Moving Avg Change"
                    stroke="#00ff88"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    dot={false}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="moving_avg_effectiveness"
                    name="Moving Avg Effectiveness"
                    stroke="#8a2be2"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    dot={false}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              
              {/* Baseline Reference */}
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {selectedChart === 'response-time' && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={convertedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis label={{ value: 'Response Time (minutes)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} min`, 'Response Time']} />
              <Legend />
              <Bar dataKey="response_time_minutes" name="Response Time" fill="#8a2be2" radius={[4, 4, 0, 0]} />
              <ReferenceLine y={45} stroke="#00ff88" strokeDasharray="5 5" label="Optimal (45 min)" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {selectedChart === 'sensitivity' && (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={convertedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="avg_insulin_units" label={{ value: 'Insulin Units', position: 'bottom' }} />
              <YAxis label={{ value: `Sensitivity (${unit})`, angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Scatter dataKey="insulin_sensitivity" name="Sensitivity" fill="#ff6b35" />
              <ReferenceLine y={0} stroke="#00d4ff" strokeDasharray="5 5" />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recommendations */}
      {overallAnalysis?.recommendations && overallAnalysis.recommendations.length > 0 && (
        <div className="recommendations">
          <h4>Recommendations</h4>
          <div className="recommendation-list">
            {overallAnalysis.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                {rec.includes('High insulin sensitivity') && <AlertTriangle className="warning-icon" />}
                {rec.includes('Most effective') && <CheckCircle className="success-icon" />}
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsulinImpactChart;


