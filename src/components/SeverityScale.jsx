import React from 'react';
import PropTypes from 'prop-types';

function SeverityScale({ value, onChange }) {
  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="severity-scale">
      <label className="severity-label">Severity:</label>
      <div className="severity-dots">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            className={`severity-dot ${value >= level ? 'active' : ''} ${
              value >= level ? `severity-${level}` : ''
            }`}
            onClick={() => onChange(level)}
            aria-label={`Severity level ${level} of 5`}
          >
            <span className="severity-dot-inner"></span>
          </button>
        ))}
      </div>
      <span className="severity-value">{value}/5</span>
    </div>
  );
}

SeverityScale.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SeverityScale;
