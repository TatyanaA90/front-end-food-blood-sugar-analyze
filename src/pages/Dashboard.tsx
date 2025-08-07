import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGlucoseReadings } from '../hooks/useGlucoseReadings';
import { useGlucoseUnitUtils } from '../hooks/useGlucoseUnit';
import { Activity, BarChart3, Plus, Droplets, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/layout/NavigationHeader';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: readings = [], isLoading } = useGlucoseReadings({});
    const { convertReading, getReadingStatus, preferredUnit, getRangeLabels } = useGlucoseUnitUtils();
    const rangeLabels = getRangeLabels();

    // Get recent readings (last 5)
    const recentReadings = readings.slice(0, 5);
    
    // Calculate summary stats
    const totalReadings = readings.length;
    const todayReadings = readings.filter(reading => {
        const readingDate = new Date(reading.reading_time).toDateString();
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

    return (
        <div className="dashboard-container">
            <NavigationHeader 
                title="Dashboard" 
                icon={<BarChart3 size={24} />}
                showBack={false}
            />
            <main className="dashboard-main">
                {/* Welcome Section */}
                <section className="dashboard-section">
                    <div className="dashboard-card">
                        <h2 className="dashboard-welcome-title">
                            Welcome back, {user?.username}!
                        </h2>
                        <p className="dashboard-welcome-text">
                            Track your blood sugar, meals, activities, and get insights to manage your diabetes effectively.
                        </p>
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

                        <button className="dashboard-action-button">
                            <div className="dashboard-action-content">
                                <Plus className="dashboard-action-icon-green" />
                                <div>
                                    <h4 className="dashboard-action-title">Add Meal</h4>
                                    <p className="dashboard-action-subtitle">Track food intake</p>
                                </div>
                            </div>
                        </button>

                        <button className="dashboard-action-button">
                            <div className="dashboard-action-content">
                                <Activity className="dashboard-action-icon-purple" />
                                <div>
                                    <h4 className="dashboard-action-title">Add Activity</h4>
                                    <p className="dashboard-action-subtitle">Log exercise</p>
                                </div>
                            </div>
                        </button>

                        <button className="dashboard-action-button">
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
                        </div>
                    </div>
                </section>

                {/* Recent Glucose Readings */}
                <section className="dashboard-section">
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h3 className="dashboard-section-title">
                                <Clock size={20} />
                                Recent Glucose Readings
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
                                <p className="dashboard-empty-text">No glucose readings yet</p>
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
                                                    {new Date(reading.reading_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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