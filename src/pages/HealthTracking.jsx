import React, { useState, useEffect } from 'react';
import '../css/HealthTracking.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

import { supabase } from '../SupabaseClient';

function formatMetricName(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

//FHIR mapping

function mapToFhirObservations(row) {
  const date = row.created_at;

  const LOINC = {
    weight: "29463-7",
    heart_rate: "8867-4",
    blood_sugar: "15074-8",
    temperature: "8310-5",
    bp_panel: "85354-9",
    systolic: "8480-6",
    diastolic: "8462-4"
  };

  let systolic = null;
  let diastolic = null;

  if (row.blood_pressure) {
    const parts = row.blood_pressure.split("/").map(Number);
    systolic = parts[0];
    diastolic = parts[1];
  }

  return [
    {
      resourceType: "Observation",
      code: { coding: [{ system: "http://loinc.org", code: LOINC.weight }] },
      effectiveDateTime: date,
      valueQuantity: { value: row.weight, unit: "kg" }
    },
    {
      resourceType: "Observation",
      code: { coding: [{ system: "http://loinc.org", code: LOINC.heart_rate }] },
      effectiveDateTime: date,
      valueQuantity: { value: row.heart_rate, unit: "beats/min" }
    },
    {
      resourceType: "Observation",
      code: { coding: [{ system: "http://loinc.org", code: LOINC.blood_sugar }] },
      effectiveDateTime: date,
      valueQuantity: { value: row.blood_sugar, unit: "mg/dL" }
    },
    {
      resourceType: "Observation",
      code: { coding: [{ system: "http://loinc.org", code: LOINC.temperature }] },
      effectiveDateTime: date,
      valueQuantity: { value: row.temperature, unit: "°F" }
    },
    {
      resourceType: "Observation",
      code: { coding: [{ system: "http://loinc.org", code: LOINC.bp_panel }] },
      effectiveDateTime: date,
      component: [
        {
          code: { coding: [{ system: "http://loinc.org", code: LOINC.systolic }] },
          valueQuantity: { value: systolic, unit: "mmHg" }
        },
        {
          code: { coding: [{ system: "http://loinc.org", code: LOINC.diastolic }] },
          valueQuantity: { value: diastolic, unit: "mmHg" }
        }
      ]
    }
  ];
}


function HealthChart({ metricName, data }) {
  return (
    <div className="metric-chart">
      <h3>{formatMetricName(metricName)}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function HealthTracking() {
  const [fhirData, setFhirData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Supabase then Convert to FHIR
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const { data, error } = await supabase
          .from('health_metrics')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        const fhirObservations = data.flatMap(mapToFhirObservations);
        setFhirData(fhirObservations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

 //FHIR observations to chart data

  const getByCode = (code) => {
    return fhirData
      .filter(obs => obs.code.coding[0].code === code && obs.valueQuantity)
      .map(obs => ({
        date: new Date(obs.effectiveDateTime).toLocaleDateString(),
        value: obs.valueQuantity.value
      }));
  };

  const bloodPressureObs = fhirData.filter(
    obs => obs.code.coding[0].code === "85354-9"
  );

  const systolicData = bloodPressureObs.map(obs => ({
    date: new Date(obs.effectiveDateTime).toLocaleDateString(),
    value: obs.component.find(c => c.code.coding[0].code === "8480-6")?.valueQuantity.value
  }));

  const diastolicData = bloodPressureObs.map(obs => ({
    date: new Date(obs.effectiveDateTime).toLocaleDateString(),
    value: obs.component.find(c => c.code.coding[0].code === "8462-4")?.valueQuantity.value
  }));

  const chartsData = [
    { metricName: "weight", data: getByCode("29463-7") },
    { metricName: "heart_rate", data: getByCode("8867-4") },
    { metricName: "blood_sugar", data: getByCode("15074-8") },
    { metricName: "temperature", data: getByCode("8310-5") },
    { metricName: "systolic_blood_pressure", data: systolicData },
    { metricName: "diastolic_blood_pressure", data: diastolicData }
  ];

  if (loading) return <p>Loading health metrics...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="health-tracking-page">
      <h1>FHIR Health Metrics Dashboard</h1>

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
