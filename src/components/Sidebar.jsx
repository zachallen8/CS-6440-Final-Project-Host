import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../css/Sidebar.css'

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const location = useLocation()

  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/profile', label: 'Profile' },
    { path: '/symptom-tracking', label: 'Symptom Tracking' },
    { path: '/health-tracking', label: 'Health Tracking' },
    { path: '/messaging', label: 'Messaging' },
  ]

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? '◀' : '▶'}
      </button>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            title={!isExpanded ? item.label : ''}
          >
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
