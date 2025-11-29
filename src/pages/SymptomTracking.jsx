import { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';
import '../css/SymptomTracking.css';
import SymptomGrid from '../components/SymptomGrid';
import SymptomCarousel from '../components/SymptomCarousel';
import SymptomCalendar from '../components/SymptomCalendar';

// FHIR mapping for symptom observations
function mapToFhirSymptomObservation(row) {
  // SNOMED CT codes for common pregnancy symptoms
  const SNOMED = {
    "Nausea": "422587007",
    "Fatigue": "84229001",
    "Headache": "25064002",
    "Back Pain": "161891005",
    "Swelling": "442672001",
    "Dizziness": "404640003",
    "Cramping": "55300003",
    "Mood Changes": "366979004",
    "Heartburn": "16331000",
    "Insomnia": "193462001",
    "Constipation": "14760008",
    "Shortness of Breath": "267036007"
  };

  return {
    resourceType: "Observation",
    id: row.id?.toString(),
    status: "final",
    category: [{
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/observation-category",
        code: "survey",
        display: "Survey"
      }]
    }],
    code: {
      coding: [{
        system: "http://snomed.info/sct",
        code: SNOMED[row.symptom_name] || "418799008", // Default: Finding reported by subject
        display: row.symptom_name
      }]
    },
    subject: {
      reference: `Patient/${row.patient_id}`
    },
    effectiveDateTime: row.entry_date,
    valueInteger: row.severity,
    note: row.notes ? [{ text: row.notes }] : undefined,
    extension: row.time_of_day && row.time_of_day.length > 0 ? [{
      url: "http://hl7.org/fhir/StructureDefinition/observation-time-of-day",
      valueString: Array.isArray(row.time_of_day) ? row.time_of_day.join(", ") : row.time_of_day
    }] : undefined
  };
}

function SymptomTracking() {
  const [activeSymptoms, setActiveSymptoms] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [fhirSymptoms, setFhirSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch symptom tracking data from Supabase and convert to FHIR
  useEffect(() => {
    const fetchSymptomHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('symptom_logs')
          .select('*')
          .eq('patient_id', 1) // Assuming patient_id = 1, adjust as needed
          .order('entry_date', { ascending: false });

        if (error) throw error;

        // Convert to FHIR observations
        const fhirObservations = data.map(mapToFhirSymptomObservation);
        setFhirSymptoms(fhirObservations);

        // Transform the data to match the expected format
        const groupedByDate = data.reduce((acc, entry) => {
          const dateKey = entry.entry_date;
          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: dateKey,
              symptoms: [],
            };
          }
          acc[dateKey].symptoms.push({
            id: entry.symptom_id,
            name: entry.symptom_name,
            severity: entry.severity,
          });
          return acc;
        }, {});

        const formattedHistory = Object.values(groupedByDate);
        setHistoryData(formattedHistory);
      } catch (err) {
        console.error('Error fetching symptom history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSymptomHistory();
  }, []);

  const handleSymptomToggle = (symptom) => {
    const exists = activeSymptoms.find((s) => s.id === symptom.id);

    if (exists) {
      // Remove symptom
      setActiveSymptoms(activeSymptoms.filter((s) => s.id !== symptom.id));
    } else {
      // Add symptom with default values
      setActiveSymptoms([
        ...activeSymptoms,
        {
          id: symptom.id,
          name: symptom.name,
          severity: 3,
          timeOfDay: [],
          notes: '',
        },
      ]);
    }
  };

  const handleSymptomUpdate = (updatedSymptom) => {
    setActiveSymptoms(
      activeSymptoms.map((s) =>
        s.id === updatedSymptom.id ? updatedSymptom : s
      )
    );
  };

  const handleSymptomRemove = (symptomId) => {
    setActiveSymptoms(activeSymptoms.filter((s) => s.id !== symptomId));
  };

  const handleSaveEntry = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Insert each symptom as a separate row in the database
      const entries = activeSymptoms.map(symptom => ({
        patient_id: 1, // Adjust this to the actual patient ID
        entry_date: today,
        symptom_id: symptom.id,
        symptom_name: symptom.name,
        severity: symptom.severity,
        time_of_day: symptom.timeOfDay || [],
        notes: symptom.notes || '',
      }));

      const { data, error } = await supabase
        .from('symptom_logs')
        .insert(entries)
        .select();

      if (error) throw error;

      // Convert saved entries to FHIR observations
      const newFhirObservations = data.map(mapToFhirSymptomObservation);
      setFhirSymptoms(prev => [...newFhirObservations, ...prev]);

      alert('Symptom entry saved successfully!');

      // Clear active symptoms after saving
      setActiveSymptoms([]);

      // Refresh the history data
      const { data: updatedData, error: fetchError } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('patient_id', 1)
        .order('entry_date', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform and update history data
      const groupedByDate = updatedData.reduce((acc, entry) => {
        const dateKey = entry.entry_date;
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            symptoms: [],
          };
        }
        acc[dateKey].symptoms.push({
          id: entry.symptom_id,
          name: entry.symptom_name,
          severity: entry.severity,
        });
        return acc;
      }, {});

      const formattedHistory = Object.values(groupedByDate);
      setHistoryData(formattedHistory);
    } catch (err) {
      console.error('Error saving entry:', err);
      alert('Error saving entry: ' + err.message);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="symptom-tracking-page">
        <h1>Symptom Tracker</h1>
        <p>Loading symptom history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="symptom-tracking-page">
        <h1>Symptom Tracker</h1>
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="symptom-tracking-page">
      <h1>Symptom Tracker</h1>

      <div className="symptom-tracking-container">
        {/* Left Column: Today's Log */}
        <div className="today-log">
          <div className="card">
            <div className="today-header">
              <h2>Today&apos;s Log</h2>
              <p className="today-date">{getTodayDate()}</p>
            </div>

            <SymptomGrid
              selectedSymptomIds={activeSymptoms.map((s) => s.id)}
              onSymptomToggle={handleSymptomToggle}
            />

            {activeSymptoms.length > 0 && (
              <div className="active-symptoms-section">
                <SymptomCarousel
                  symptoms={activeSymptoms}
                  onUpdate={handleSymptomUpdate}
                  onRemove={handleSymptomRemove}
                />

                <button
                  type="button"
                  className="save-entry-btn"
                  onClick={handleSaveEntry}
                >
                  Save Today&apos;s Entry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="symptom-history">
            <SymptomCalendar historyData={historyData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SymptomTracking;
