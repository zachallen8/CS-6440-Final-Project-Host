import React from 'react'
import PropTypes from 'prop-types'
import '../css/Home.css'

function ReadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s8-4 8-10-4-6-8-6-8 2-8 6 8 10 8 10z" stroke="#0b66ff" strokeWidth="1.2" fill="rgba(11,102,255,0.06)" />
      <circle cx="12" cy="10" r="2" fill="#0b66ff" />
    </svg>
  )
}

function ArticleCard({ article }) {
  const { title, summary, image, url } = article
  // getting first sentence for article preview
  const firstSentence = (() => {
    if (!summary) return ''
    const text = summary.trim().replace(/\s+/g, ' ')
    const match = text.match(/([\s\S]*?[\.\!\?])(\s|$)/)
    if (match && match[1]) {
      const s = match[1].trim()
      return s === text ? s : `${s}…`
    }
    return text.length > 120 ? `${text.slice(0, 120).trim()}…` : text
  })()

  return (
    <article className="article-card" role="listitem">
      <img src={image?.startsWith('/') ? `${import.meta.env.BASE_URL}${image.slice(1)}` : image} alt={title} className="article-image" loading="lazy" />

      <div className="article-body">
        <h3>{title}</h3>
        <p>{firstSentence}</p>

        <a
          href={url}
          className="article-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open "${title}" in a new tab`}
        >
          <span className="read-more-text">Read more...</span>
        </a>
      </div>
    </article>
  )
}

ArticleCard.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    summary: PropTypes.string,
    image: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
}

export default React.memo(ArticleCard)
