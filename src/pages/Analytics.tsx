import React, { useMemo, useState } from 'react';
import NavigationHeader from '../components/layout/NavigationHeader';
import { useAuth } from '../hooks/useAuth';
import { useGlucoseReadings } from '../hooks/useGlucoseReadings';
import { useGlucoseUnitUtils } from '../hooks/useGlucoseUnit';
import { BarChart3, Clock, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import api from '../services/api';
import TimeRangeControls from '../components/dashboards/TimeRangeControls';
import RecentGlucoseChart from '../components/dashboards/RecentGlucoseChart';
import TimelineWithEventsChart from '../components/dashboards/TimelineWithEventsChart';
import ImpactBarChart from '../components/dashboards/ImpactBarChart';
import {
  calculateTimeRange,
  getDefaultTimeRange,
  filterByTimeRange,
  toMilliseconds,
} from '../utils/dateUtils';
import type { TimeRange } from '../utils/dateUtils';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const { convertReading, getReadingStatus } = useGlucoseUnitUtils();

  // Initialize with default time range (today)
  const defaultTimeRange = getDefaultTimeRange('day');
  const [startDate, setStartDate] = useState<string>(defaultTimeRange.startDate);
  const [endDate, setEndDate] = useState<string>(defaultTimeRange.endDate);
  const [rangeMode, setRangeMode] = useState<'hour' | 'day' | 'week' | 'custom'>('day');

  const applyRangeMode = (mode: 'hour' | 'day' | 'week' | 'custom') => {
    setRangeMode(mode);
    const timeRange = getDefaultTimeRange(mode);
    setStartDate(timeRange.startDate);
    setEndDate(timeRange.endDate);
  };

  const datetimeFilters = useMemo(() => {
    const timeRange = calculateTimeRange(startDate, endDate);
    return { start_datetime: timeRange.startIso, end_datetime: timeRange.endIso } as any;
  }, [startDate, endDate]);

  const { data: readings = [], isLoading } = useGlucoseReadings(datetimeFilters);
  const [mealImpact, setMealImpact] = useState<any[]>([]);
  const [insulinImpact, setInsulinImpact] = useState<any[]>([]);
  const [timelineReadings, setTimelineReadings] = useState<{ time: number; value: number }[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<Array<{ time: number; type: string; label: string }>>([]);
  const [seriesPoints, setSeriesPoints] = useState<Array<{ ts: number; glucose: number | null; meal: number | null; insulin: number | null; activity: number | null }>>([]);

  React.useEffect(() => {
    const timeRange = calculateTimeRange(startDate, endDate);
    const params = new URLSearchParams();
    params.set('window', 'custom');
    params.set('start_datetime', timeRange.startIso);
    params.set('end_datetime', timeRange.endIso);
    api.get(`/analytics/meal-impact?${params.toString()}`).then(r => setMealImpact(r.data.meal_impacts || [])).catch(() => setMealImpact([]));
    api.get(`/analytics/insulin-glucose-correlation?${params.toString()}`).then(r => {
      setInsulinImpact(r.data.correlations || []);
    }).catch(() => {
      setInsulinImpact([]);
    });

    const vparams = new URLSearchParams({ include_events: 'true', include_ingredients: 'false', unit: 'mg/dL', format: 'series' });
    vparams.set('window', 'custom');
    vparams.set('start_datetime', timeRange.startIso);
    vparams.set('end_datetime', timeRange.endIso);
    api.get(`/visualization/glucose-timeline?${vparams.toString()}`).then(r => {
      const points = Array.isArray(r.data?.points) ? r.data.points : [];
      if (points.length > 0) {
        const mapped = points.map((p: any) => ({
          ts: typeof p.ts === 'string' ? new Date(p.ts).getTime() : Number(p.ts),
          glucose: p.glucose ?? null,
          meal: p.meal ?? null,
          insulin: p.insulin ?? null,
          activity: p.activity ?? null,
        })).filter((p: any) => Number.isFinite(p.ts));
        setSeriesPoints(mapped);
      } else {
        setSeriesPoints([]);
      }

      let readings = (r.data.points || []).map((p: any) => ({
        time: (typeof p.ts === 'string' ? new Date(p.ts).getTime() : Number(p.ts)),
        value: p.glucose || 0
      })).filter((r: any) => r.value > 0);

      let events = (r.data.events || r.data?.events || []).map((ev: any) => ({
        time: (typeof ev.timestamp === 'string' ? new Date(ev.timestamp).getTime() : Number(ev.timestamp)),
        type: ev.type,
        label: ev.description || ev.type
      }));

      readings = readings.filter((p: any) => p.time >= timeRange.startMs && p.time <= timeRange.endMs);
      events = events.filter((e: any) => e.time >= timeRange.startMs && e.time <= timeRange.endMs);
      setTimelineReadings(readings);
      setTimelineEvents(events);
    }).catch(() => { setTimelineReadings([]); setTimelineEvents([]); setSeriesPoints([]); });
  }, [startDate, endDate, rangeMode]);

  const glucoseChartData = useMemo(() => {
    return timelineReadings
      .map(r => ({ ts: r.time, value: r.value }))
      .sort((a, b) => a.ts - b.ts);
  }, [timelineReadings]);

  const mealImpactData = useMemo(() => (
    (mealImpact || []).map((g: any) => ({ group: g.group, change: g.avg_glucose_change, count: g.num_meals }))
  ), [mealImpact]);

  const insulinImpactData = useMemo(() => (
    (insulinImpact || []).map((g: any) => ({ group: g.group, change: g.avg_glucose_change, count: g.num_doses }))
  ), [insulinImpact]);

  const getTrendIcon = (status: string) => {
    switch (status) {
      case 'high': return <TrendingUp className="dashboard-trend-icon high" />;
      case 'low': return <TrendingDown className="dashboard-trend-icon low" />;
      default: return <Minus className="dashboard-trend-icon normal" />;
    }
  };

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
    <div className="dashboard-container">
      <NavigationHeader title="Analytics" icon={<BarChart3 size={24} />} showBack={false} />
      <main className="dashboard-main">
        <section className="dashboard-section">
          <TimeRangeControls
            rangeMode={rangeMode}
            startDate={startDate}
            endDate={endDate}
            onChangeMode={applyRangeMode}
            onChangeStart={(local) => setStartDate(local)}
            onChangeEnd={(local) => setEndDate(local)}
          />
        </section>
        <section className="dashboard-section">
          <div className="dashboard-card">
            <h2 className="dashboard-welcome-title">Hello, {user?.username}</h2>
            <p className="dashboard-welcome-text">All dashboards in one place.</p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-card">
            <div className="dashboard-card-header" style={{ justifyContent: 'space-between' }}>
              <h3 className="dashboard-section-title">
                <Clock size={20} />
                Recent Glucose Readings
              </h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 8, background: trendInfo.color, color: '#fff' }}>
                  {trendInfo.icon}
                  <span style={{ fontSize: 12 }}>Trend: {trendInfo.label}</span>
                </div>
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
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: '#059669', color: '#fff', borderRadius: 6, padding: '2px 6px', fontSize: 12 }}>Meals: {filteredTimelineEvents.filter(e => e.type === 'meal').length}</span>
                  <span style={{ background: '#f97316', color: '#fff', borderRadius: 6, padding: '2px 6px', fontSize: 12 }}>Insulin: {filteredTimelineEvents.filter(e => e.type === 'insulin_dose').length}</span>
                  <span style={{ background: '#7c3aed', color: '#fff', borderRadius: 6, padding: '2px 6px', fontSize: 12 }}>Activities: {filteredTimelineEvents.filter(e => e.type === 'activity').length}</span>
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
              <ImpactBarChart data={mealImpactData} color="#059669" label="Avg Δ mg/dL" />
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
              </div>
            ) : (
              <ImpactBarChart data={insulinImpactData} color="#f97316" label="Avg Δ mg/dL" />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Analytics;


