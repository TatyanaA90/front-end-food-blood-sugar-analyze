import React, { useState, useMemo } from 'react';
import { Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useGlucoseUnitUtils } from '../hooks/useGlucoseUnit';
import { useGlucoseReadings } from '../hooks/useGlucoseReadings';
import api from '../services/api';
import { calculateTimeRange, getDefaultTimeRange } from '../utils/dateUtils';
import NavigationHeader from '../components/layout/NavigationHeader';
import TimeRangeControls from '../components/dashboards/TimeRangeControls';
import RecentGlucoseChart from '../components/dashboards/RecentGlucoseChart';
import TimelineWithEventsChart from '../components/dashboards/TimelineWithEventsChart';
import ImpactBarChart from '../components/dashboards/ImpactBarChart';
import InsulinImpactChart from '../components/insulin/InsulinImpactChart';
import './Analytics.css';

// Interface for the API response data structure
interface ApiTimelinePoint {
  ts: string | number;
  glucose?: number;
  meal?: number;
  insulin?: number;
  activity?: number;
}

interface ApiTimelineEvent {
  timestamp: string | number;
  type: string;
  description?: string;
}

const Analytics: React.FC = () => {
  const { preferredUnit } = useGlucoseUnitUtils();

  // Initialize with default time range (week instead of day to show more data)
  const defaultTimeRange = getDefaultTimeRange('week');
  const [rangeMode, setRangeMode] = useState<'hour' | 'day' | 'week' | 'custom'>('week');
  const [startDate, setStartDate] = useState<string>(defaultTimeRange.startDate);
  const [endDate, setEndDate] = useState<string>(defaultTimeRange.endDate);

  const datetimeFilters = useMemo(() => {
    const timeRange = calculateTimeRange(startDate, endDate);
    return { start_datetime: timeRange.startIso, end_datetime: timeRange.endIso };
  }, [startDate, endDate]);

  const { isLoading } = useGlucoseReadings(datetimeFilters);
  const [mealImpact, setMealImpact] = useState<Array<{ group: string; avg_glucose_change: number; num_meals: number }>>([]);
  const [insulinImpact, setInsulinImpact] = useState<Array<{
    group: string;
    avg_glucose_change: number;
    avg_insulin_units: number;
    insulin_sensitivity: number;
    num_doses: number;
    response_time_minutes: number;
    effectiveness_score: number;
    correlation_coefficient: number | null;
    std_dev_change: number;
  }>>([]);
  const [insulinOverallAnalysis, setInsulinOverallAnalysis] = useState<{
    total_doses_analyzed: number;
    avg_insulin_sensitivity: number | null;
    most_effective_dose_range: string | null;
    recommendations: string[];
  } | null>(null);
  const [timelineReadings, setTimelineReadings] = useState<{ time: number; value: number }[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<Array<{ time: number; type: string; label: string }>>([]);
  const [seriesPoints, setSeriesPoints] = useState<Array<{ ts: number; glucose: number | null; meal: number | null; insulin: number | null; activity: number | null }>>([]);

  const handleChangeMode = (mode: 'hour' | 'day' | 'week' | 'custom') => {
    setRangeMode(mode);
    const next = getDefaultTimeRange(mode);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
  };

  React.useEffect(() => {
    const timeRange = calculateTimeRange(startDate, endDate);
    const params = new URLSearchParams();
    params.set('window', 'custom');
    params.set('start_datetime', timeRange.startIso);
    params.set('end_datetime', timeRange.endIso);
    params.set('unit', preferredUnit);
    api.get(`/analytics/meal-impact?${params.toString()}`).then(r => setMealImpact(r.data.meal_impacts || [])).catch(() => setMealImpact([]));
    
    const insulinParams = new URLSearchParams();
    insulinParams.set('window', 'custom');
    insulinParams.set('start_datetime', timeRange.startIso);
    insulinParams.set('end_datetime', timeRange.endIso);
    insulinParams.set('unit', preferredUnit);
    insulinParams.set('include_partial_data', 'true'); // Include doses even with missing glucose readings
    api.get(`/analytics/insulin-glucose-correlation?${insulinParams.toString()}`).then(r => {
      console.log('Insulin API Response:', r.data);
      console.log('Time Range:', { start: timeRange.startIso, end: timeRange.endIso });
      setInsulinImpact(r.data.correlations || []);
      setInsulinOverallAnalysis(r.data.overall_analysis || null);
    }).catch((error) => {
      console.error('Insulin API Error:', error);
      setInsulinImpact([]);
      setInsulinOverallAnalysis(null);
    });

    const vparams = new URLSearchParams({ include_events: 'true', include_ingredients: 'false', unit: 'mg/dL', format: 'series' });
    vparams.set('window', 'custom');
    vparams.set('start_datetime', timeRange.startIso);
    vparams.set('end_datetime', timeRange.endIso);
    api.get(`/visualization/glucose-timeline?${vparams.toString()}`).then(r => {
      const points = Array.isArray(r.data?.points) ? r.data.points : [];
      if (points.length > 0) {
        const mapped = points.map((p: ApiTimelinePoint) => ({
          ts: typeof p.ts === 'string' ? new Date(p.ts).getTime() : Number(p.ts),
          glucose: p.glucose ?? null,
          meal: p.meal ?? null,
          insulin: p.insulin ?? null,
          activity: p.activity ?? null,
        })).filter((p) => Number.isFinite(p.ts));
        setSeriesPoints(mapped);
      } else {
        setSeriesPoints([]);
      }

      const timelineReadingsData = (r.data.points || []).map((p: ApiTimelinePoint) => ({
        time: (typeof p.ts === 'string' ? new Date(p.ts).getTime() : Number(p.ts)),
        value: p.glucose || 0
      })).filter((r) => r.value > 0);

      const events = (r.data.events || r.data?.events || []).map((ev: ApiTimelineEvent) => ({
        time: (typeof ev.timestamp === 'string' ? new Date(ev.timestamp).getTime() : Number(ev.timestamp)),
        type: ev.type,
        label: ev.description || ev.type
      }));

      const filteredReadings = timelineReadingsData.filter((p) => p.time >= timeRange.startMs && p.time <= timeRange.endMs);
      const filteredEvents = events.filter((e) => e.time >= timeRange.startMs && e.time <= timeRange.endMs);
      setTimelineReadings(filteredReadings);
      setTimelineEvents(filteredEvents);
    }).catch(() => { setTimelineReadings([]); setTimelineEvents([]); setSeriesPoints([]); });
  }, [startDate, endDate, preferredUnit]);

  const glucoseChartData = useMemo(() => {
    return timelineReadings
      .map(r => ({ ts: r.time, value: r.value }))
      .sort((a, b) => a.ts - b.ts);
  }, [timelineReadings]);

  const mealImpactData = useMemo(() => (
    (mealImpact || []).map((g) => ({ group: g.group, change: g.avg_glucose_change, count: g.num_meals }))
  ), [mealImpact]);

  const timeRange = calculateTimeRange(startDate, endDate);
  const rangeStartMs = timeRange.startMs;
  const rangeEndMs = timeRange.endMs;

  const recentGlucoseSeries = useMemo(() => {
    return glucoseChartData.filter(point =>
      point.ts >= rangeStartMs && point.ts <= rangeEndMs
    );
  }, [glucoseChartData, rangeStartMs, rangeEndMs]);

  const trendInfo = useMemo(() => {
    if (recentGlucoseSeries.length < 2) {
      return { label: 'Not enough data', color: '#64748b', icon: <Minus className="dashboard-trend-icon normal" /> };
    }
    const first = recentGlucoseSeries[0].value;
    const last = recentGlucoseSeries[recentGlucoseSeries.length - 1].value;
    const delta = last - first;
    const absDelta = Math.abs(delta);
    const threshold = 10;
    if (delta > threshold) {
      return { label: `Rising (+${absDelta.toFixed(0)})`, color: '#16a34a', icon: <TrendingUp className="dashboard-trend-icon high" /> };
    }
    if (delta < -threshold) {
      return { label: `Falling (-${absDelta.toFixed(0)})`, color: '#ef4444', icon: <TrendingDown className="dashboard-trend-icon low" /> };
    }
    return { label: 'Stable', color: '#64748b', icon: <Minus className="dashboard-trend-icon normal" /> };
  }, [recentGlucoseSeries]);

  const trendClass = useMemo(() => {
    const label = trendInfo.label.toLowerCase();
    if (label.includes('rising')) return 'rising';
    if (label.includes('falling')) return 'falling';
    if (label.includes('stable')) return 'stable';
    return 'none';
  }, [trendInfo.label]);

  const safeRangeStartMs = Number.isFinite(rangeStartMs) ? rangeStartMs : Date.now() - 60 * 60 * 1000;
  const safeRangeEndMsRaw = Number.isFinite(rangeEndMs) ? rangeEndMs : Date.now();
  const safeRangeEndMs = safeRangeEndMsRaw > safeRangeStartMs ? safeRangeEndMsRaw : safeRangeStartMs + 60 * 1000;

  const filteredTimelineReadings = useMemo(
    () => timelineReadings.filter(p => p.time >= rangeStartMs && p.time <= rangeEndMs).sort((a, b) => a.time - b.time),
    [timelineReadings, rangeStartMs, rangeEndMs]
  );
  const filteredTimelineEvents = useMemo(
    () => timelineEvents.filter(e => e.time >= rangeStartMs && e.time <= rangeEndMs),
    [timelineEvents, rangeStartMs, rangeEndMs]
  );

  const baselineY = 100;
  const timelineSeriesData = useMemo(() => {
    const byTs = new Map<number, { ts: number; glucose: number | null; meal: number | null; insulin: number | null; activity: number | null }>();
    const ensure = (ts: number) => {
      let rec = byTs.get(ts);
      if (!rec) {
        rec = { ts, glucose: null, meal: null, insulin: null, activity: null };
        byTs.set(ts, rec);
      }
      return rec;
    };

    if (filteredTimelineReadings.length > 0) {
      for (const r of filteredTimelineReadings) {
        ensure(r.time).glucose = Number(r.value);
      }
    } else {
      ensure(rangeStartMs).glucose = baselineY;
      ensure(rangeEndMs).glucose = baselineY;
    }

    const nearest = (t: number) => {
      const base = filteredTimelineReadings.length
        ? filteredTimelineReadings
        : [
            { time: rangeStartMs, value: baselineY },
            { time: rangeEndMs, value: baselineY },
          ];
      let best = base[0];
      let bd = Math.abs(base[0].time - t);
      for (const r of base) {
        const d = Math.abs(r.time - t);
        if (d < bd) { best = r; bd = d; }
      }
      return Number(best.value ?? baselineY);
    };

    for (const ev of filteredTimelineEvents) {
      const y = nearest(ev.time);
      const rec = ensure(ev.time);
      if (ev.type === 'meal') rec.meal = y;
      else if (ev.type === 'insulin_dose') rec.insulin = y;
      else if (ev.type === 'activity') rec.activity = y;
    }

    return Array.from(byTs.values()).sort((a, b) => a.ts - b.ts);
  }, [filteredTimelineReadings, filteredTimelineEvents, rangeStartMs, rangeEndMs]);

  return (
    <div className="analytics-page">
      <NavigationHeader title="Analytics" />
      <main className="dashboard-main">
        <section className="dashboard-section">
          <TimeRangeControls
            rangeMode={rangeMode}
            startDate={startDate}
            endDate={endDate}
            onChangeMode={handleChangeMode}
            onChangeStart={setStartDate}
            onChangeEnd={setEndDate}
          />
        </section>
      </main>
      <main className="dashboard-main">
        <section className="dashboard-section">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-section-title">
                Recent Glucose Readings
              </h3>
              <div className={`trend-badge ${trendClass}`}>
                {trendInfo.icon}
                <span className="trend-badge-text">Trend: {trendInfo.label}</span>
              </div>
            </div>

            {isLoading ? (
              <div className="dashboard-loading">
                <p>Loading readings...</p>
              </div>
            ) : recentGlucoseSeries.length === 0 ? (
              <div className="dashboard-empty-state">
                <Droplets className="dashboard-empty-icon" />
                <p className="dashboard-empty-text">No readings in the selected range</p>
              </div>
            ) : (
              <div className="dashboard-readings-list">
                <RecentGlucoseChart data={recentGlucoseSeries} rangeStartMs={safeRangeStartMs} rangeEndMs={safeRangeEndMs} />
              </div>
            )}
          </div>
        </section>
      </main>
      <main className="dashboard-main">
        <section className="dashboard-section">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-section-title">Glucose Timeline with Events</h3>
            </div>
            <div>
                <TimelineWithEventsChart
                  data={seriesPoints.length ? seriesPoints : timelineSeriesData}
                  rangeStartMs={safeRangeStartMs}
                  rangeEndMs={safeRangeEndMs}
                  hasRealData={filteredTimelineReadings.length > 0}
                />
                <div className="event-count-badges">
                  <span className="event-count-badge meals">Meals: {filteredTimelineEvents.filter(e => e.type === 'meal').length}</span>
                  <span className="event-count-badge insulin">Insulin: {filteredTimelineEvents.filter(e => e.type === 'insulin_dose').length}</span>
                  <span className="event-count-badge activities">Activities: {filteredTimelineEvents.filter(e => e.type === 'activity').length}</span>
                </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-section-title">Meal Impact Analysis</h3>
            </div>
            {(mealImpact || []).length === 0 ? (
              <div className="dashboard-empty-state">
                <p className="dashboard-empty-text">No meal impact data for the selected range</p>
              </div>
            ) : (
              <ImpactBarChart data={mealImpactData} color="#059669" label={`Avg Δ ${preferredUnit}`} />
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-section-title">Insulin Impact Analysis</h3>
            </div>
            {(insulinImpact || []).length === 0 ? (
              <div className="dashboard-empty-state">
                <p className="dashboard-empty-text">No insulin impact data for the selected range</p>
                {/* Debug information */}
                <details className="debug-details">
                  <summary>Debug Info</summary>
                  <div className="debug-body">
                    <p><strong>Time Range:</strong> {startDate} to {endDate}</p>
                    <p><strong>Raw Data:</strong> {JSON.stringify(insulinOverallAnalysis, null, 2)}</p>
                    <p><strong>Note:</strong> Insulin doses need glucose readings within 30min before and 180min after to be analyzed</p>
                  </div>
                </details>
              </div>
            ) : (
              <InsulinImpactChart 
                data={insulinImpact} 
                overallAnalysis={insulinOverallAnalysis}
                unit={preferredUnit}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Analytics;


