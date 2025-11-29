import React, { useState } from 'react';
import PropTypes from 'prop-types';

function SymptomCalendar({ historyData }) {
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [hoveredDate, setHoveredDate] = useState(null);

  // Generate dates for the current week (Sunday - Saturday)
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek); // Set to Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate dates for the current month
  const getMonthDates = () => {
    const dates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the Sunday before the first day
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // End on the Saturday after the last day
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    // Generate all dates
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getSymptomCountForDate = (date) => {
    const dateStr = formatDate(date);
    const dayData = historyData.find((entry) => entry.date === dateStr);
    return dayData ? dayData.symptoms.length : 0;
  };

  const getSymptomsForDate = (date) => {
    const dateStr = formatDate(date);
    const dayData = historyData.find((entry) => entry.date === dateStr);
    return dayData ? dayData.symptoms : [];
  };

  const getIntensityClass = (count) => {
    if (count === 0) return 'intensity-none';
    if (count <= 2) return 'intensity-low';
    if (count <= 4) return 'intensity-medium';
    return 'intensity-high';
  };

  const isToday = (date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const isCurrentMonth = (date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth();
  };

  const datesToDisplay = viewMode === 'week' ? weekDates : monthDates;

  return (
    <div className="symptom-calendar card">
      <div className="calendar-header">
        <h3>Symptom History</h3>
        <div className="calendar-view-toggle">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
      </div>

      {viewMode === 'month' && (
        <div className="calendar-day-names">
          {dayNames.map((name) => (
            <div key={name} className="calendar-day-name">
              {name}
            </div>
          ))}
        </div>
      )}

      <div className={`calendar-grid ${viewMode === 'month' ? 'month-view' : ''}`}>
        {datesToDisplay.map((date, index) => {
          const count = getSymptomCountForDate(date);
          const symptoms = getSymptomsForDate(date);
          const dayOfWeek = date.getDay();
          const dateStr = formatDate(date);
          return (
            <div
              key={dateStr}
              className={`calendar-day ${getIntensityClass(count)} ${
                isToday(date) ? 'today' : ''
              } ${viewMode === 'month' && !isCurrentMonth(date) ? 'other-month' : ''}`}
              onMouseEnter={() => count > 0 && setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {viewMode === 'week' && <div className="day-name">{dayNames[dayOfWeek]}</div>}
              <div className="day-number">{date.getDate()}</div>
              <div className="day-count">{count > 0 ? count : ''}</div>

              {hoveredDate === dateStr && symptoms.length > 0 && (
                <div className="calendar-tooltip">
                  <div className="tooltip-date">
                    {dayNames[dayOfWeek]}, {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="tooltip-symptoms">
                    {symptoms.map((symptom, idx) => (
                      <div key={idx} className="tooltip-symptom">
                        <span className="tooltip-symptom-name">{symptom.name}</span>
                        <span className="tooltip-symptom-severity">Severity: {symptom.severity}/5</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot intensity-none"></span>
          <span>No symptoms</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot intensity-low"></span>
          <span>1-2 symptoms</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot intensity-medium"></span>
          <span>3-4 symptoms</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot intensity-high"></span>
          <span>5+ symptoms</span>
        </div>
      </div>

      <div className="week-summary">
        <h4>This Week Summary:</h4>
        <ul className="summary-list">
          <li>Morning Sickness: 5 days</li>
          <li>Fatigue: 7 days</li>
          <li>Back Pain: 3 days</li>
        </ul>
      </div>
    </div>
  );
}

SymptomCalendar.propTypes = {
  historyData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      symptoms: PropTypes.array.isRequired,
    })
  ).isRequired,
};

export default SymptomCalendar;
