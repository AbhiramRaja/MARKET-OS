import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ initial='', placeholder = 'Search products, brands, categories...', onOpenVisual }){
  const [q, setQ] = React.useState(initial);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <form onSubmit={submit} className="search-form">
      <div className="search-input-wrap">
        <input 
          value={q} 
          onChange={e=>setQ(e.target.value)} 
          placeholder={placeholder}
          className="search-input"
          aria-label="Search products"
        />

        <button
          type="button"
          className="search-camera-btn"
          onClick={(e) => { e.preventDefault(); onOpenVisual && onOpenVisual(); }}
          aria-label="Search by camera"
          title="Search by image"
        >
          {/* camera icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 7h-3.2l-1.6-2H7.8L6.2 7H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </button>
      </div>

      <button type="submit" className="search-button" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </form>
  )
}
