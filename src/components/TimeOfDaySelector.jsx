import React from 'react';
import PropTypes from 'prop-types';

function TimeOfDaySelector({ selectedTimes, onChange }) {
  const times = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const handleToggle = (time) => {
    if (selectedTimes.includes(time)) {
      onChange(selectedTimes.filter((t) => t !== time));
    } else {
      onChange([...selectedTimes, time]);
    }
  };

  return (
    <div className="time-of-day-selector">
      <label className="time-label">Time of Day:</label>
      <div className="time-checkboxes">
        {times.map((time) => (
          <label key={time} className="time-checkbox-label">
            <input
              type="checkbox"
              checked={selectedTimes.includes(time)}
              onChange={() => handleToggle(time)}
              aria-label={`${time} symptom occurrence`}
            />
            <span className="checkbox-custom"></span>
            <span className="time-text">{time}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

TimeOfDaySelector.propTypes = {
  selectedTimes: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TimeOfDaySelector;
