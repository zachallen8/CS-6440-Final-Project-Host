import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../css/SymptomTracking.css';
import SymptomGrid from '../components/SymptomGrid';
import SymptomCarousel from '../components/SymptomCarousel';
import SymptomCalendar from '../components/SymptomCalendar';

const supabaseUrl = "https://bxrjmfqsmrpbfrtsloui.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4cmptZnFzbXJwYmZydHNsb3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODQwODYsImV4cCI6MjA3NzI2MDA4Nn0.muDg95w2PpgVDo4Cs4lu4ZqaejmQtsAdHLSaYJMOGKI";
const supabase = createClient(supabaseUrl, supabaseKey);

function SymptomTracking() {
  const [activeSymptoms, setActiveSymptoms] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch symptom tracking data from Supabase
  useEffect(() => {
    const fetchSymptomHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('symptom_logs')
          .select('*')
          .eq('patient_id', 1) // Assuming patient_id = 1, adjust as needed
          .order('entry_date', { ascending: false });

        if (error) throw error;

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

      console.log('Entry saved successfully:', data);
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
