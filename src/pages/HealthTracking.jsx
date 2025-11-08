import React, { useState, useEffect } from 'react';
import '../css/HealthTracking.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { supabase } from '../SupabaseClient';


function formatMetricName(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function HealthChart({ metricName, data }) {
  return (
    <div className="metric-chart">
      <h3>{formatMetricName(metricName)}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="created_at" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function HealthTracking() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const { data, error } = await supabase
          .from('health_metrics')
          .select('*')
          .order('created_at', { ascending: true }); // oldest to newest

        if (error) throw error;
        setHealthData(data);
      } catch (err) {
        console.error('Error fetching health data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  if (loading) return <p>Loading health metrics...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!healthData || healthData.length === 0) return <p>No health data found.</p>;


  const latestMetrics = healthData[healthData.length - 1];


  const chartsData = [];


  ['weight', 'heart_rate', 'blood_sugar', 'temperature'].forEach(key => {
    chartsData.push({
      metricName: key,
      data: healthData.map(row => ({
        created_at: new Date(row.created_at).toLocaleDateString(),
        value: row[key],
      })),
    });
  });

  // Blood pressure - split into systolic and diastolic
  const systolicData = healthData.map(row => {
    const [systolic] = row.blood_pressure.split('/').map(Number);
    return {
      created_at: new Date(row.created_at).toLocaleDateString(),
      value: systolic,
    };
  });
  const diastolicData = healthData.map(row => {
    const [, diastolic] = row.blood_pressure.split('/').map(Number);
    return {
      created_at: new Date(row.created_at).toLocaleDateString(),
      value: diastolic,
    };
  });

  chartsData.push({ metricName: 'systolic_blood_pressure', data: systolicData });
  chartsData.push({ metricName: 'diastolic_blood_pressure', data: diastolicData });

  const metricKeys = ['weight', 'blood_pressure', 'heart_rate', 'blood_sugar', 'temperature'];

  return (
    <div className="health-tracking-page">
      <h1>Health Metrics Dashboard</h1>

      <div className="metrics-container">
        {metricKeys.map(key => (
          <div key={key} className="metric-card">
            <h2>{formatMetricName(key)}</h2>
            <p>{latestMetrics[key]}</p>
          </div>
        ))}
      </div>

      <div className="charts-container">
        {chartsData.map(chart => (
          <HealthChart
            key={chart.metricName}
            metricName={chart.metricName}
            data={chart.data}
          />
        ))}
      </div>
    </div>
  );
}

export default HealthTracking;
