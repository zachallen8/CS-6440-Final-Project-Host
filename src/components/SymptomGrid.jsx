import React from 'react';
import PropTypes from 'prop-types';

const SYMPTOM_CATEGORIES = {
  Digestive: [
    { id: 'nausea', name: 'Morning Sickness' },
    { id: 'heartburn', name: 'Heartburn' },
    { id: 'food-aversion', name: 'Food Aversions' },
    { id: 'constipation', name: 'Constipation' },
  ],
  'Physical Pain': [
    { id: 'back-pain', name: 'Back Pain' },
    { id: 'headache', name: 'Headache' },
    { id: 'cramping', name: 'Cramping' },
    { id: 'breast-tenderness', name: 'Breast Tenderness' },
    { id: 'round-ligament', name: 'Round Ligament Pain' },
  ],
  Energy: [
    { id: 'fatigue', name: 'Fatigue' },
    { id: 'insomnia', name: 'Insomnia' },
    { id: 'dizziness', name: 'Dizziness' },
  ],
  Swelling: [
    { id: 'swelling-hands', name: 'Swelling - Hands' },
    { id: 'swelling-feet', name: 'Swelling - Feet' },
    { id: 'swelling-face', name: 'Swelling - Face' },
  ],
  Emotional: [
    { id: 'anxiety', name: 'Anxiety' },
    { id: 'mood-swings', name: 'Mood Swings' },
    { id: 'irritability', name: 'Irritability' },
  ],
  Other: [
    { id: 'braxton-hicks', name: 'Braxton Hicks' },
    { id: 'shortness-breath', name: 'Shortness of Breath' },
    { id: 'frequent-urination', name: 'Frequent Urination' },
  ],
};

function SymptomGrid({ selectedSymptomIds, onSymptomToggle }) {
  const isSelected = (symptomId) => selectedSymptomIds.includes(symptomId);

  return (
    <div className="symptom-grid">
      {Object.entries(SYMPTOM_CATEGORIES).map(([category, symptoms]) => (
        <div key={category} className="symptom-category">
          <h4 className="category-title">{category}</h4>
          <div className="symptom-buttons">
            {symptoms.map((symptom) => (
              <button
                key={symptom.id}
                type="button"
                className={`symptom-button ${
                  isSelected(symptom.id) ? 'selected' : ''
                }`}
                onClick={() => onSymptomToggle(symptom)}
                aria-label={`${
                  isSelected(symptom.id) ? 'Remove' : 'Add'
                } ${symptom.name}`}
                aria-pressed={isSelected(symptom.id)}
              >
                <span className="symptom-button-name">{symptom.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

SymptomGrid.propTypes = {
  selectedSymptomIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSymptomToggle: PropTypes.func.isRequired,
};

export default SymptomGrid;
