import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRecentGlucoseReadings, useGlucoseStats } from '../hooks/useGlucoseReadings';
import { useGlucoseUnitUtils } from '../hooks/useGlucoseUnit';
import { Activity, BarChart3, Plus, Droplets, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/layout/NavigationHeader';
import TimeInRangePie from '../components/dashboards/TimeInRangePie';
import { ensureUtcIso } from '../utils/dateUtils';
import api from '../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: readings = [], isLoading } = useRecentGlucoseReadings();
    const { convertReading, getReadingStatus, preferredUnit, getRangeLabels } = useGlucoseUnitUtils();
    const [tirData, setTirData] = React.useState<Record<string, number> | null>(null);
    const rangeLabels = getRangeLabels();

    // Stats window: last 7 days
    const statsEnd = new Date();
    const statsStart = new Date();
    statsStart.setDate(statsEnd.getDate() - 7);
    const statsStartStr = statsStart.toISOString().split('T')[0];
    const statsEndStr = statsEnd.toISOString().split('T')[0];
    const { data: glucoseStats } = useGlucoseStats({ start_date: statsStartStr, end_date: statsEndStr });
    const [variability, setVariability] = React.useState<Record<string, number | null> | null>(null);

    // Get recent readings (last 5), ordered by displayed time (newest first)
    const recentReadings = [...readings]
        .sort((a, b) => new Date(ensureUtcIso(b.reading_time)).getTime() - new Date(ensureUtcIso(a.reading_time)).getTime())
        .slice(0, 5);

    // Calculate summary stats
    const totalReadings = readings.length;
    const todayReadings = readings.filter(reading => {
        const readingDate = new Date(ensureUtcIso(reading.reading_time)).toDateString();
        const today = new Date().toDateString();
        return readingDate === today;
    }).length;

    const getTrendIcon = (status: string) => {
        switch (status) {
            case 'high': return <TrendingUp className="dashboard-trend-icon high" />;
            case 'low': return <TrendingDown className="dashboard-trend-icon low" />;
            default: return <Minus className="dashboard-trend-icon normal" />;
        }
    };

    React.useEffect(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        const params = new URLSearchParams();
        params.set('window', 'custom');
        params.set('start_date', start.toISOString().split('T')[0]);
        params.set('end_date', end.toISOString().split('T')[0]);
        params.set('unit', preferredUnit === 'mg/dL' ? 'mg/dl' : 'mmol/l');
        params.set('show_percentage', 'true');
        api.get(`/analytics/time-in-range?${params.toString()}`)
          .then(r => setTirData(r.data?.time_in_range || null))
          .catch(() => setTirData(null));

        // Also fetch variability (for GMI) and mean glucose
        const gvParams = new URLSearchParams();
        gvParams.set('window', 'custom');
        gvParams.set('start_date', start.toISOString().split('T')[0]);
        gvParams.set('end_date', end.toISOString().split('T')[0]);
        api.get(`/analytics/glucose-variability?${gvParams.toString()}`)
          .then(r => setVariability(r.data?.variability_metrics || null))
          .catch(() => setVariability(null));
    }, [preferredUnit]);

    return (
        <div className="dashboard-container">
            <NavigationHeader
                title="Dashboard"
                icon={<BarChart3 size={24} />}
                showBack={false}
            />
            <main className="dashboard-main">
                {/* Welcome + Right-side Time in Range widget */}
                <section className="dashboard-section dashboard-hero-grid">
                    <div className="dashboard-card dashboard-hero-left">
                        <h2 className="dashboard-welcome-title">
                            Welcome back, {user?.username}!
                        </h2>
                        <p className="dashboard-welcome-text">
                            Track your blood sugar, meals, activities, and get insights to manage your diabetes effectively.
                        </p>
                        <div className="dashboard-inline-stats">
                            {(() => {
                                const avgSrc = (glucoseStats?.average ?? variability?.mean_glucose ?? null) as number | null;
                                if (avgSrc == null) {
                                    return (
                                        <span className="dashboard-unit-display">Average: —</span>
                                    );
                                }
                                const avgConverted = preferredUnit === 'mg/dL' ? avgSrc : (avgSrc != null ? (convertReading({ reading: avgSrc, unit: 'mg/dL', reading_time: new Date().toISOString(), id: -1 }).displayValue) : null);
                                const formattedAvg = avgConverted == null ? '—' : (preferredUnit === 'mg/dL' ? Math.round(avgConverted).toString() : avgConverted.toFixed(1));
                                return (
                                    <span className="dashboard-unit-display">Average: {formattedAvg} {preferredUnit}</span>
                                );
                            })()}
                            <span className="dashboard-unit-display">GMI: {variability?.glucose_management_indicator != null ? `${Number(variability.glucose_management_indicator).toFixed(1)} %` : '—'}</span>
                        </div>
                    </div>
                    <div className="dashboard-card dashboard-hero-right">
                        <div className="dashboard-card-header" style={{ marginBottom: 8 }}>
                            <h3 className="dashboard-section-title" style={{ fontSize: '1.125rem' }}>
                                Time in Range
                            </h3>
                        </div>
                        <div style={{ width: '100%', height: 180 }}>
                            <TimeInRangePie
                                tir={tirData || { very_low: 0, low: 0, in_range: 0, high: 0, very_high: 0 }}
                                unit={preferredUnit}
                                height={180}
                                outerRadius={70}
                                innerRadius={32}
                                showLegend={false}
                            />
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="dashboard-section">
                    <h3 className="dashboard-section-title">Quick Actions</h3>
                    <div className="dashboard-grid">
                        <button
                            className="dashboard-action-button"
                            onClick={() => navigate('/glucose-readings')}
                        >
                            <div className="dashboard-action-content">
                                <Plus className="dashboard-action-icon-blue" />
                                <div>
                                    <h4 className="dashboard-action-title">Add Reading</h4>
                                    <p className="dashboard-action-subtitle">Log blood sugar</p>
                                </div>
                            </div>
                        </button>

                        <button
                            className="dashboard-action-button"
                            onClick={() => navigate('/meals')}
                        >
                            <div className="dashboard-action-content">
                                <Plus className="dashboard-action-icon-green" />
                                <div>
                                    <h4 className="dashboard-action-title">Add Meal</h4>
                                    <p className="dashboard-action-subtitle">Track food intake</p>
                                </div>
                            </div>
                        </button>

                        <button
                            className="dashboard-action-button"
                            onClick={() => navigate('/activities')}
                        >
                            <div className="dashboard-action-content">
                                <Activity className="dashboard-action-icon-purple" />
                                <div>
                                    <h4 className="dashboard-action-title">Add Activity</h4>
                                    <p className="dashboard-action-subtitle">Log exercise</p>
                                </div>
                            </div>
                        </button>

                        <button
                            className="dashboard-action-button"
                            onClick={() => navigate('/analytics')}
                        >
                            <div className="dashboard-action-content">
                                <BarChart3 className="dashboard-action-icon-orange" />
                                <div>
                                    <h4 className="dashboard-action-title">View Analytics</h4>
                                    <p className="dashboard-action-subtitle">See insights</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                {/* Glucose Summary */}
                <section className="dashboard-section">
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h3 className="dashboard-section-title">
                                <Droplets size={20} />
                                Glucose Summary
                            </h3>
                            <div className="dashboard-unit-display">
                                Unit: {preferredUnit}
                            </div>
                        </div>

                        <div className="dashboard-stats-grid">
                            <div className="dashboard-stat-item">
                                <div className="dashboard-stat-value">{totalReadings}</div>
                                <div className="dashboard-stat-label">Total Readings</div>
                            </div>
                            <div className="dashboard-stat-item">
                                <div className="dashboard-stat-value">{todayReadings}</div>
                                <div className="dashboard-stat-label">Today's Readings</div>
                            </div>
                            <div className="dashboard-stat-item">
                                <div className="dashboard-stat-value">{rangeLabels.normal}</div>
                                <div className="dashboard-stat-label">Target Range</div>
                            </div>
                            <div className="dashboard-stat-item">
                                <div className={`dashboard-stat-value ${(() => {
                                    if (readings.length < 2) return '';

                                    const sortedReadings = [...readings]
                                        .sort((a, b) => new Date(ensureUtcIso(a.reading_time)).getTime() - new Date(ensureUtcIso(b.reading_time)).getTime());

                                    const firstReading = convertReading(sortedReadings[0]);
                                    const lastReading = convertReading(sortedReadings[sortedReadings.length - 1]);
                                    const change = lastReading.displayValue - firstReading.displayValue;

                                    if (Math.abs(change) < 5) return 'trend-stable';
                                    return change > 0 ? 'trend-up' : 'trend-down';
                                })()}`}>
                                    {(() => {
                                        if (readings.length < 2) return '--';

                                        const sortedReadings = [...readings]
                                            .sort((a, b) => new Date(ensureUtcIso(a.reading_time)).getTime() - new Date(ensureUtcIso(b.reading_time)).getTime());

                                        const firstReading = convertReading(sortedReadings[0]);
                                        const lastReading = convertReading(sortedReadings[sortedReadings.length - 1]);
                                        const change = lastReading.displayValue - firstReading.displayValue;

                                        if (Math.abs(change) < 5) return '→';
                                        return change > 0 ? '↗' : '↘';
                                    })()}
                                </div>
                                <div className="dashboard-stat-label">
                                    Last Hour Trend
                                    {(() => {
                                        if (readings.length < 2) return '';

                                        const sortedReadings = [...readings]
                                            .sort((a, b) => new Date(ensureUtcIso(a.reading_time)).getTime() - new Date(ensureUtcIso(b.reading_time)).getTime());

                                        const firstReading = convertReading(sortedReadings[0]);
                                        const lastReading = convertReading(sortedReadings[sortedReadings.length - 1]);
                                        const change = lastReading.displayValue - firstReading.displayValue;

                                        if (Math.abs(change) < 5) return '';
                                        const sign = change > 0 ? '+' : '';
                                        return ` (${sign}${Math.round(change)})`;
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Glucose Readings (Last Hour) */}
                <section className="dashboard-section">
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h3 className="dashboard-section-title">
                                <Clock size={20} />
                                Recent Glucose Readings (Last Hour)
                            </h3>
                            <button
                                className="dashboard-view-all-btn"
                                onClick={() => navigate('/glucose-readings')}
                            >
                                View All
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="dashboard-loading">
                                <p>Loading recent readings...</p>
                            </div>
                        ) : recentReadings.length === 0 ? (
                            <div className="dashboard-empty-state">
                                <Droplets className="dashboard-empty-icon" />
                                <p className="dashboard-empty-text">No glucose readings in the last hour</p>
                                <p className="dashboard-empty-subtext">Start by adding your first blood sugar reading</p>
                                <button
                                    className="dashboard-empty-btn"
                                    onClick={() => navigate('/glucose-readings')}
                                >
                                    Add First Reading
                                </button>
                            </div>
                        ) : (
                            <div className="dashboard-readings-list">
                                {recentReadings.map((reading) => {
                                    const convertedReading = convertReading(reading);
                                    const status = getReadingStatus(reading);
                                    return (
                                        <div key={reading.id} className="dashboard-reading-item">
                                            <div className="dashboard-reading-value">
                                                <span className="dashboard-reading-number">
                                                    {convertedReading.formattedValue}
                                                </span>
                                                <span className="dashboard-reading-unit">
                                                    {convertedReading.displayUnit}
                                                    {convertedReading.converted && (
                                                        <span className="dashboard-reading-converted-indicator" title={`Originally ${reading.reading} ${reading.unit}`}>
                                                            *
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="dashboard-reading-details">
                                                <div className="dashboard-reading-time">
                                                    {new Date(ensureUtcIso(reading.reading_time)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="dashboard-reading-status" style={{ backgroundColor: status.color }}>
                                                    {getTrendIcon(status.status)}
                                                    {status.label}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;