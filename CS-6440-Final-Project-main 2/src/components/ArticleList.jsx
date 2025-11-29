import React, { useEffect, useMemo, useState } from 'react'
import ArticleCard from './ArticleCard'

function ArticleList() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadArticles() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}articles.json`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to load articles')
        const data = await res.json()
        setArticles(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadArticles()

    return () => controller.abort()
  }, [])

  const items = useMemo(() => {
    return (articles || []).map((article) => (
      <ArticleCard key={article.id} article={article} />
    ))
  }, [articles])

  if (loading) return <div className="articles-loading">Loading articles…</div>
  if (error) return <div className="articles-error">{error}</div>

  return (
    <div className="articles-grid" role="list">
      {items}
    </div>
  )
}

export default ArticleList
