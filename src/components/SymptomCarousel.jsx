import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SymptomDetailCard from './SymptomDetailCard';

function SymptomCarousel({ symptoms, onUpdate, onRemove }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (symptoms.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : symptoms.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < symptoms.length - 1 ? prev + 1 : 0));
  };

  const currentSymptom = symptoms[currentIndex];

  return (
    <div className="symptom-carousel">
      <div className="carousel-header">
        <h3>Active Symptoms</h3>
        <div className="carousel-counter">
          {currentIndex + 1} of {symptoms.length}
        </div>
      </div>

      <div className="carousel-container">
        {symptoms.length > 1 && (
          <button
            type="button"
            className="carousel-arrow carousel-arrow-left"
            onClick={handlePrevious}
            aria-label="Previous symptom"
          >
            ‹
          </button>
        )}

        <div className="carousel-content">
          <SymptomDetailCard
            symptom={currentSymptom}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        </div>

        {symptoms.length > 1 && (
          <button
            type="button"
            className="carousel-arrow carousel-arrow-right"
            onClick={handleNext}
            aria-label="Next symptom"
          >
            ›
          </button>
        )}
      </div>

      {symptoms.length > 1 && (
        <div className="carousel-dots">
          {symptoms.map((symptom, index) => (
            <button
              key={symptom.id}
              type="button"
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to ${symptom.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

SymptomCarousel.propTypes = {
  symptoms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      severity: PropTypes.number.isRequired,
      timeOfDay: PropTypes.arrayOf(PropTypes.string).isRequired,
      notes: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SymptomCarousel;
