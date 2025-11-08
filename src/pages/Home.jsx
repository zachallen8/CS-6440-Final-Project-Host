import '../css/Home.css'
import ArticleList from '../components/ArticleList'
import PregnancyProgress from '../components/PregnancyProgress'
import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { supabase } from '../SupabaseClient';

function Home() {
  const [patientName, setPatientName] = useState(null)
  const [loadingPatient, setLoadingPatient] = useState(true)
  const [patientWeeks, setPatientWeeks] = useState(null)

  useEffect(() => {
    let mounted = true
    async function fetchPatient() {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('name, conception_date')
          .eq('id', 1)
          .single()

        if (error) throw error
        if (mounted) {
          setPatientName(data?.name ?? null)
          if (data?.conception_date) {
            try {
              const weeks = computeWeeksFromConception(data.conception_date)
              setPatientWeeks(weeks)
            } catch (e) {

              console.error('Error computing weeks from conception_date:', e)
            }
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching patient name:', err)
      } finally {
        if (mounted) setLoadingPatient(false)
      }
    }

    fetchPatient()
    return () => { mounted = false }
  }, [])

  function computeWeeksFromConception(conceptionDate) {
    const c = new Date(conceptionDate)
    if (Number.isNaN(c.getTime())) throw new Error('Invalid conception_date')
    const now = new Date()
    const diffMs = now - c
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const weeks = Math.max(0, Math.min(40, Math.round(diffDays / 7)))
    return weeks
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="site-brand">
          <img src={`${import.meta.env.BASE_URL}assets/TransparentLogo.png`} alt="logo" className="site-logo" />
          <h1 className="site-title">Maternal Health App</h1>
        </div>
        <p className="lead">Personalized health tracking and resources for pregnancy.</p>
      </header>

  <PregnancyProgress weeks={patientWeeks !== null ? patientWeeks : 22} name={loadingPatient ? 'You' : (patientName || 'You')} />

  <section className="about-section">
        <h2>What this app is for</h2>
        <p>
          This app helps expectant mothers track their health during pregnancy. Use the
          symptom tracker, log vitals, and access articles and resources tailored to each
          trimester. The features are designed to support maternal wellbeing and provide
          timely information to help you make informed decisions.
        </p>
      </section>

      <section className="articles-section">
        <h2>Featured articles</h2>
        <div className="articles-list-wrapper">
          <ArticleList />
        </div>
      </section>

      <aside className="resources-section">
        <h2>Information & resources</h2>
        <ul>
          <li><Link to="/health-tracking">Checkups schedule</Link></li>
          <li>
            <a href="https://www.hopkinsmedicine.org/health/wellness-and-prevention/common-tests-during-pregnancy" target="_blank" rel="noopener noreferrer">Recommended screenings</a>
          </li>
        </ul>
      </aside>
    </div>
  )
}

export default Home
