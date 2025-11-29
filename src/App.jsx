import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import SymptomTracking from './pages/SymptomTracking'
import HealthTracking from './pages/HealthTracking'
import Messaging from './pages/Messaging'
import './css/App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/symptom-tracking" element={<SymptomTracking />} />
            <Route path="/health-tracking" element={<HealthTracking />} />
            <Route path="/messaging" element={<Messaging />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
