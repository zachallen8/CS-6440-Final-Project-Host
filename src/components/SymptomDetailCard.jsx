import React from 'react';
import PropTypes from 'prop-types';
import SeverityScale from './SeverityScale';
import TimeOfDaySelector from './TimeOfDaySelector';

function SymptomDetailCard({ symptom, onUpdate, onRemove }) {
  const handleSeverityChange = (newSeverity) => {
    onUpdate({
      ...symptom,
      severity: newSeverity,
    });
  };

  const handleTimeChange = (newTimes) => {
    onUpdate({
      ...symptom,
      timeOfDay: newTimes,
    });
  };

  const handleNotesChange = (e) => {
    onUpdate({
      ...symptom,
      notes: e.target.value,
    });
  };

  return (
    <div className="symptom-detail-card card">
      <div className="symptom-card-header">
        <h3 className="symptom-name">{symptom.name}</h3>
        <button
          type="button"
          className="remove-symptom-btn"
          onClick={() => onRemove(symptom.id)}
          aria-label={`Remove ${symptom.name}`}
        >
          ✕
        </button>
      </div>

      <SeverityScale
        value={symptom.severity}
        onChange={handleSeverityChange}
      />

      <TimeOfDaySelector
        selectedTimes={symptom.timeOfDay}
        onChange={handleTimeChange}
      />

      <div className="symptom-notes">
        <label htmlFor={`notes-${symptom.id}`} className="notes-label">
          Notes:
        </label>
        <textarea
          id={`notes-${symptom.id}`}
          value={symptom.notes}
          onChange={handleNotesChange}
          placeholder="Add any additional details (triggers, what helped, etc.)"
          rows="3"
          className="notes-textarea"
        />
      </div>
    </div>
  );
}

SymptomDetailCard.propTypes = {
  symptom: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    severity: PropTypes.number.isRequired,
    timeOfDay: PropTypes.arrayOf(PropTypes.string).isRequired,
    notes: PropTypes.string.isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SymptomDetailCard;
