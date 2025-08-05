import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Activity, BarChart3, Plus } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-container">
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
                        <button className="dashboard-action-button">
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

                {/* Recent Activity Placeholder */}
                <section className="dashboard-section">
                    <div className="dashboard-card">
                        <h3 className="dashboard-section-title">Recent Activity</h3>
                        <div className="dashboard-empty-state">
                            <BarChart3 className="dashboard-empty-icon" />
                            <p className="dashboard-empty-text">No recent activity to display</p>
                            <p className="dashboard-empty-subtext">Start by adding your first blood sugar reading</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard; 