import React, { useState, useMemo, useCallback } from 'react';
import { Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useGlucoseUnitUtils } from '../hooks/useGlucoseUnit';
import { useGlucoseReadings } from '../hooks/useGlucoseReadings';
import api from '../services/api';
import { calculateTimeRange, getDefaultTimeRange } from '../utils/dateUtils';
import NavigationHeader from '../components/layout/NavigationHeader';
import TimeRangeControls from '../components/dashboards/TimeRangeControls';
import RecentGlucoseChart from '../components/dashboards/RecentGlucoseChart';
import TimelineWithEventsChart from '../components/dashboards/TimelineWithEventsChart';
// import ImpactBarChart from '../components/dashboards/ImpactBarChart';
import InsulinImpactChart from '../components/dashboards/InsulinImpactChart';
import './Analytics.css';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, /* ReferenceLine, */ Scatter, Legend } from 'recharts';
import TimeInRangePie from '../components/dashboards/TimeInRangePie';
import GlucoseVariabilityCard from '../components/dashboards/GlucoseVariabilityCard';

// Interface for the API response data structure
interface ApiTimelinePoint {
  ts: string | number;
  glucose?: number;
  meal?: number;
  insulin?: number;
  activity?: number;
}

// interface ApiTimelineEvent {
//   timestamp: string | number;
//   type: string;
//   description?: string;
// }

const Analytics: React.FC = () => {
  const { preferredUnit, convertValue } = useGlucoseUnitUtils();

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
  const [mealImpact, setMealImpact] = useState<Array<{ group: string; avg_glucose_change: number; avg_peak_delta?: number; num_meals: number }>>([]);
  const [mealImpactMeta, setMealImpactMeta] = useState<Record<string, unknown> | null>(null);
  const [mealImpactGroups, setMealImpactGroups] = useState<Array<{ key: string; n: number; avg_delta: number; peak_delta?: number; time_to_peak_min?: number; return_to_baseline_min?: number }>>([]);
  const [mealImpactOverall, setMealImpactOverall] = useState<Record<string, unknown> | null>(null);
  // const [mealImpactTimeline, setMealImpactTimeline] = useState<Array<{ ts: string; delta_series: Array<[number, number]> }>>([]);
  // const [selectedMealIdx, setSelectedMealIdx] = useState<number>(0);
  // Selected meal name (aggregates all occurrences in range)
  const [selectedMealName, setSelectedMealName] = useState<string>('');
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
  // const [seriesPoints, setSeriesPoints] = useState<Array<{ ts: number; glucose: number | null; meal: number | null; insulin: number | null; activity: number | null }>>([]);
  const [mealGroupBy] = useState<'time_of_day' | 'meal_type' | 'carb_range'>('time_of_day');
  const [tirData, setTirData] = useState<Record<string, number> | null>(null);
  const [variability, setVariability] = useState<Record<string, number | null> | null>(null);

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
    params.set('group_by', mealGroupBy);
    api.get(`/analytics/meal-impact?${params.toString()}`).then(r => {
      setMealImpact(r.data.meal_impacts || r.data.groups || []);
      setMealImpactMeta(r.data.meta || null);
      setMealImpactGroups(r.data.groups || []);
      setMealImpactOverall(r.data.overall || null);
      // setMealImpactTimeline(Array.isArray(r.data.timeline) ? r.data.timeline : []);
      // setSelectedMealIdx(0);
    }).catch(() => {
      setMealImpact([]);
      setMealImpactMeta(null);
      setMealImpactGroups([]);
      setMealImpactOverall(null);
      setMealImpactTimeline([]);
    });
    
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
       // const points = Array.isArray(r.data?.points) ? r.data.points : [];
      // if (points.length > 0) {
      //   const mapped = points.map((p: ApiTimelinePoint) => ({
      //     ts: typeof p.ts === 'string' ? new Date(p.ts).getTime() : Number(p.ts),
      //     glucose: p.glucose ?? null,
      //     meal: p.meal ?? null,
      //     insulin: p.insulin ?? null,
      //     activity: p.activity ?? null,
      //   })).filter((p) => Number.isFinite(p.ts));
      //   setSeriesPoints(mapped);
      // } else {
      //   setSeriesPoints([]);
      // }

      const timelineReadingsData = (r.data.points || []).map((p: ApiTimelinePoint) => ({
        time: (typeof p.ts === 'string' ? new Date(p.ts).getTime() : Number(p.ts)),
        value: p.glucose || 0
      })).filter((r) => r.value > 0);

      const events = (r.data.events || r.data?.events || []).map((ev: { timestamp: string | number; type: string; description?: string; activity_type?: string; units?: number }) => {
              const time = (typeof ev.timestamp === 'string' ? new Date(ev.timestamp.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(ev.timestamp) ? ev.timestamp : `${ev.timestamp}Z`).getTime() : Number(ev.timestamp));
        let label = ev.description || ev.type;
        if (ev.type === 'activity') {
          label = ev.activity_type || ev.type;
        } else if (ev.type === 'insulin_dose') {
          label = typeof ev.units === 'number' ? String(ev.units) : 'insulin';
        }
        return { time, type: ev.type, label };
      });

      const filteredReadings = timelineReadingsData.filter((p) => p.time >= timeRange.startMs && p.time <= timeRange.endMs);
      const filteredEvents = events.filter((e) => e.time >= timeRange.startMs && e.time <= timeRange.endMs);
      setTimelineReadings(filteredReadings);
      setTimelineEvents(filteredEvents);
    }).catch(() => { setTimelineReadings([]); setTimelineEvents([]); /* setSeriesPoints([]); */ });

    // Time in Range
    const tirParams = new URLSearchParams();
    tirParams.set('window', 'custom');
    tirParams.set('start_date', timeRange.startIso.split('T')[0]);
    tirParams.set('end_date', timeRange.endIso.split('T')[0]);
    tirParams.set('unit', preferredUnit === 'mg/dL' ? 'mg/dl' : 'mmol/l');
    tirParams.set('show_percentage', 'true');
    api.get(`/analytics/time-in-range?${tirParams.toString()}`).then(r => {
      setTirData(r.data?.time_in_range || null);
    }).catch(() => setTirData(null));

    // Glucose variability
    const gvParams = new URLSearchParams();
    gvParams.set('window', 'custom');
    gvParams.set('start_date', timeRange.startIso.split('T')[0]);
    gvParams.set('end_date', timeRange.endIso.split('T')[0]);
    api.get(`/analytics/glucose-variability?${gvParams.toString()}`).then(r => {
      setVariability(r.data?.variability_metrics || null);
    }).catch(() => setVariability(null));
  }, [startDate, endDate, preferredUnit, mealGroupBy, convertValue]);

  const glucoseChartData = useMemo(() => {
    return timelineReadings
      .map(r => ({ ts: r.time, value: r.value }))
      .sort((a, b) => a.ts - b.ts);
  }, [timelineReadings]);

  /* const mealImpactData = useMemo(() => {
    const sourceUnit = (mealImpactMeta?.requested_unit as 'mg/dL' | 'mmol/L' | undefined) || 'mg/dL';
    return (mealImpact || []).map((g: { group?: string; key?: string; avg_peak_delta?: number; avg_glucose_change?: number; avg_delta?: number; num_meals?: number; n?: number }) => {
      const label = g.group ?? g.key ?? '—';
      const rawDelta =
        typeof g.avg_peak_delta === 'number'
          ? g.avg_peak_delta
          : typeof g.avg_glucose_change === 'number'
          ? g.avg_glucose_change
          : g.avg_delta ?? 0;
      const displayPeak =
        sourceUnit === preferredUnit
          ? g.avg_peak_delta ?? rawDelta
          : convertValue(rawDelta, sourceUnit, preferredUnit);
      const rawAvg = typeof g.avg_glucose_change === 'number' ? g.avg_glucose_change : g.avg_delta ?? rawDelta;
      const displayAvg = sourceUnit === preferredUnit ? rawAvg : convertValue(rawAvg, sourceUnit, preferredUnit);
      const count = g.num_meals ?? g.n ?? 0;
      return { group: label, avg: displayAvg, peak: displayPeak, count };
    });
  }, [mealImpact, preferredUnit, mealImpactMeta, convertValue]); */

  // Meal options in current range (moved below to reference filteredTimelineEvents safely)

  const timeRange = calculateTimeRange(startDate, endDate);
  const rangeStartMs = timeRange.startMs;
  const rangeEndMs = timeRange.endMs;

  const recentGlucoseSeries = useMemo(() => {
    return glucoseChartData.filter(point =>
      point.ts >= rangeStartMs && point.ts <= rangeEndMs
    );
  }, [glucoseChartData, rangeStartMs, rangeEndMs]);

  // Build glucose line (converted to preferred unit) and helpers
  const glucoseLineData = useMemo(() => {
    return recentGlucoseSeries.map(p => ({ ts: p.ts, value: preferredUnit === 'mg/dL' ? p.value : convertValue(p.value, 'mg/dL', 'mmol/L') }));
  }, [recentGlucoseSeries, preferredUnit, convertValue]);

  // Keep vertical scale stable based only on the glucose line (not markers)
  const yDomain = useMemo<[number, number]>(() => {
    const values = glucoseLineData.map(d => d.value);
    if (values.length === 0) return [0, 10];
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) { min -= 1; max += 1; }
    const pad = Math.max((max - min) * 0.1, 0.5);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [glucoseLineData]);

  // Custom tooltip to show only the glucose line value (hide extra series/fields)
  const renderGlucoseTooltip = (info: { label?: number | string; payload?: Array<{ dataKey?: string; value?: number }> }) => {
    const { label, payload } = info || {};
    if (!payload || payload.length === 0) return null;
    const lineItem = payload.find((p) => p && p.dataKey === 'value');
    if (!lineItem) return null;
    const ts = Number(label);
    const val = Number(lineItem.value);
    const display = preferredUnit === 'mg/dL' ? val.toFixed(0) : val.toFixed(1);
    return (
      <div className="tooltip-glucose">
        <div className="tooltip-glucose-time">{new Date(ts).toLocaleString()}</div>
        <div className="tooltip-glucose-row">
          <span className="tooltip-swatch line" />
          <span className="tooltip-glucose-label">Glucose:</span>
          <span className="tooltip-glucose-value">{display}</span>
        </div>
        {selectedMealPoints.length > 0 && (
          <div className="tooltip-glucose-row" style={{ marginTop: 4 }}>
            <span className="tooltip-swatch meal" />
            <span className="tooltip-glucose-label">Selected meals</span>
          </div>
        )}
      </div>
    );
  };

  const nearestY = useCallback((t: number) => {
    if (glucoseLineData.length === 0) return null;
    let best = glucoseLineData[0];
    let minDiff = Math.abs(glucoseLineData[0].ts - t);
    for (const p of glucoseLineData) {
      const d = Math.abs(p.ts - t);
      if (d < minDiff) { best = p; minDiff = d; }
    }
    return best.value;
  }, [glucoseLineData]);

  // selectedMealPoints is defined after filteredTimelineEvents to avoid initialization order issues.

  const trendInfo = useMemo(() => {
    if (recentGlucoseSeries.length < 2) {
      return { label: 'Not enough data', color: 'var(--text-secondary)', icon: <Minus className="dashboard-trend-icon normal" /> };
    }
    const first = recentGlucoseSeries[0].value;
    const last = recentGlucoseSeries[recentGlucoseSeries.length - 1].value;
    const delta = last - first;
    const absDelta = Math.abs(delta);
    const threshold = 10;
    if (delta > threshold) {
      return { label: `Rising (+${absDelta.toFixed(0)})`, color: 'var(--success)', icon: <TrendingUp className="dashboard-trend-icon high" /> };
    }
    if (delta < -threshold) {
      return { label: `Falling (-${absDelta.toFixed(0)})`, color: 'var(--danger)', icon: <TrendingDown className="dashboard-trend-icon low" /> };
    }
    return { label: 'Stable', color: 'var(--text-secondary)', icon: <Minus className="dashboard-trend-icon normal" /> };
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

  // Meal options in current range (depends on filteredTimelineEvents)
  // const mealOptions = useMemo(() => {
  //   return filteredTimelineEvents
  //     .filter(e => e.type === 'meal')
  //     .map(e => ({ ts: e.time, label: new Date(e.time).toLocaleString() }));
  // }, [filteredTimelineEvents]);

  // Unique meal names for selection
  const mealNameOptions = useMemo(() => {
    const names = new Set<string>();
    for (const e of filteredTimelineEvents) {
      if (e.type === 'meal') {
        const name = (e.label || '').trim();
        if (name) names.add(name);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [filteredTimelineEvents]);

  const selectedMealPoints = useMemo(() => {
    if (!selectedMealName) return [] as Array<{ ts: number; y: number }>;
    const times: number[] = filteredTimelineEvents
      .filter(e => e.type === 'meal' && ((e.label || '').trim() === selectedMealName))
      .map(e => e.time);
    return times
      .map(ts => ({ ts, y: nearestY(ts) }))
      .filter(p => p.y !== null) as Array<{ ts: number; y: number }>;
  }, [selectedMealName, filteredTimelineEvents, nearestY]);

  const baselineY = 100;
  const timelineSeriesData = useMemo(() => {
    const byTs = new Map<number, { ts: number; glucose: number | null; meal: number | null; insulin: number | null; activity: number | null; mealLabel?: string; insulinLabel?: string; activityLabel?: string }>();
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
      if (ev.type === 'meal') { rec.meal = y; rec.mealLabel = ev.label; }
      else if (ev.type === 'insulin_dose') { rec.insulin = y; rec.insulinLabel = ev.label; }
      else if (ev.type === 'activity') { rec.activity = y; rec.activityLabel = ev.label; }
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
                  data={timelineSeriesData}
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

        {/* Time in Range & Variability */}
        <section className="dashboard-section">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-section-title">Time in Range</h3>
            </div>
            {tirData ? (
              <TimeInRangePie tir={tirData} unit={preferredUnit} />
            ) : (
              <div className="dashboard-empty-state"><p className="dashboard-empty-text">No TIR data</p></div>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <GlucoseVariabilityCard metrics={variability || { standard_deviation: null, coefficient_of_variation: null, glucose_management_indicator: null }} unit={preferredUnit} />
        </section>

        <section className="dashboard-section">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-section-title">Meal Impact Analysis</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label htmlFor="meal-name-select" style={{ fontSize: 12, opacity: 0.8 }}>Meal</label>
                <select
                  id="meal-name-select"
                  value={selectedMealName}
                  onChange={(e) => setSelectedMealName(e.target.value)}
                  className="glucose-form-select"
                  style={{ minWidth: 220 }}
                >
                  <option value="">All/None</option>
                  {mealNameOptions.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            {(mealImpact || []).length === 0 ? (
              <div className="dashboard-empty-state">
                <p className="dashboard-empty-text">No meal impact data for the selected range</p>
              </div>
            ) : (
              <>
                {/* Glucose line with meal markers */}
                <div style={{ marginTop: 28 }}>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={glucoseLineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ts" type="number" domain={[safeRangeStartMs, safeRangeEndMs]}
                               tickFormatter={(ts) => new Date(Number(ts)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                        <YAxis domain={yDomain} label={{ value: `Glucose (${preferredUnit})`, angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={renderGlucoseTooltip} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name={`Glucose (${preferredUnit})`} stroke="#06b6d4" dot={false} />
                        {/* Render marker series always so legend/size stay stable */}
                        <Scatter data={selectedMealPoints} dataKey="y" name="Selected meals" fill="#10b981" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <details className="debug-details" style={{ marginTop: 12 }}>
                  <summary>Debug Info</summary>
                  <div className="debug-body">
                    <p><strong>Window:</strong> {mealImpactMeta?.start_date} → {mealImpactMeta?.end_date}</p>
                    <p><strong>Params:</strong> group_by={mealGroupBy} pre={mealImpactMeta?.pre_meal_minutes ?? '—'} min_post_points={mealImpactMeta?.min_readings ?? '—'} post={mealImpactMeta?.post_meal_minutes ?? '—'} window={mealImpactMeta?.window_minutes ?? '—'} unit={mealImpactMeta?.requested_unit ?? preferredUnit}</p>
                    <p><strong>Total meals analyzed:</strong> {mealImpactMeta?.total_meals_analyzed ?? mealImpactOverall?.meals_analyzed ?? mealImpact.reduce((s, v) => s + (v?.num_meals || 0), 0)}</p>
                    {(mealImpactGroups?.length ?? 0) > 0 && (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="debug-table">
                          <thead>
                            <tr>
                              <th>Group</th>
                              <th>n</th>
                              <th>avgΔ</th>
                              <th>peakΔ</th>
                              <th>ttp</th>
                              <th>rtb</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mealImpactGroups.map((g) => {
                              const change = preferredUnit === 'mg/dL' ? g.avg_delta : convertValue(g.avg_delta, 'mg/dL', 'mmol/L');
                              const peak = preferredUnit === 'mg/dL' ? (g.peak_delta ?? 0) : convertValue(g.peak_delta ?? 0, 'mg/dL', 'mmol/L');
                              return (
                                <tr key={g.key}>
                                  <td>{g.key}</td>
                                  <td>{g.n}</td>
                                  <td>{change.toFixed(preferredUnit === 'mg/dL' ? 0 : 1)}</td>
                                  <td>{peak.toFixed(preferredUnit === 'mg/dL' ? 0 : 1)}</td>
                                  <td>{g.time_to_peak_min ?? '—'}</td>
                                  <td>{g.return_to_baseline_min ?? '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </details>
              </>
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


