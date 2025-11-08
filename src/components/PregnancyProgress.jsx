import React from 'react'
import PropTypes from 'prop-types'

// TODO: replace with dynamic user data
export default function PregnancyProgress({ weeks = 20, name = 'You' }) {
  const weeksAlong = Math.max(0, Math.min(weeks, 40))

  const trimester = weeksAlong < 13 ? 'First trimester' : weeksAlong < 28 ? 'Second trimester' : 'Third trimester'

  function babySizeText(w) {
    if (w < 4) return 'poppy seed 🌱'
    if (w < 8) return 'blueberry 🫐'
    if (w < 12) return 'lime 🍈'
    if (w < 16) return 'avocado 🥑'
    if (w < 20) return 'banana 🍌'
    if (w < 24) return 'ear of corn 🌽'
    if (w < 28) return 'eggplant 🍆'
    if (w < 32) return 'squash 🥒'
    if (w < 36) return 'butternut squash 🎃'
    return 'pumpkin 🎃'
  }

  const percent = Math.round((weeksAlong / 40) * 100)

  return (
    <section className="pregnancy-progress" aria-live="polite">
      <div className="progress-card cute">
        <div className="progress-row">
          <div>
            <h2 className="greeting">Hey {name}! <span className="flower" aria-hidden="true">🌸</span></h2>
            <p className="muted">You're <strong>{weeksAlong} weeks</strong> along — {trimester.toLowerCase()} • baby is about the size of a <em>{babySizeText(weeksAlong)}</em></p>
          </div>
        </div>

        <div className="progress-bar" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </section>
  )
}

PregnancyProgress.propTypes = {
  weeks: PropTypes.number,
  name: PropTypes.string,
}
