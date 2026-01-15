import React, { useState, useEffect, useRef } from 'react';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data for Portfolio
const PORTFOLIO_ITEMS = [
  { id: 1, src: 'https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?q=80&w=1000&auto=format&fit=crop', category: 'Portrait', title: 'Elena in Shadow' },
  { id: 2, src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop', category: 'Nature', title: 'Misty Peaks' },
  { id: 3, src: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1000&auto=format&fit=crop', category: 'Fashion', title: 'Vogue Editorial' },
  { id: 4, src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', category: 'Portrait', title: 'Raw Emotion' },
  { id: 5, src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop', category: 'Fashion', title: 'Urban Decay' },
  { id: 6, src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop', category: 'Nature', title: 'Silent Valley' },
  { id: 7, src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop', category: 'Portrait', title: 'Neon Nights' },
  { id: 8, src: 'https://images.unsplash.com/photo-1502989642968-94fbdc9eace4?q=80&w=1000&auto=format&fit=crop', category: 'Fashion', title: 'Studio 54' },
  { id: 9, src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=1000&auto=format&fit=crop', category: 'Nature', title: 'Deep Waters' },
];

const CATEGORIES = ['All', 'Portrait', 'Fashion', 'Nature'];

const App = () => {
  const [page, setPage] = useState('portfolio'); // 'portfolio' or 'about'

  return (
    <div className="app-container">
      <div className="noise-overlay" />
      
      {/* Navigation */}
      <nav>
        <div className="logo" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
          TIM HOWARD
        </div>
        <div className="links">
          <span 
            className={`nav-link ${page === 'portfolio' ? 'active' : ''}`} 
            onClick={() => setPage('portfolio')}
          >
            Work
          </span>
          <span 
            className={`nav-link ${page === 'about' ? 'active' : ''}`} 
            onClick={() => setPage('about')}
          >
            Profile
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ paddingTop: '120px', paddingBottom: '4rem', minHeight: '100vh' }}>
        <AnimatePresence mode="wait">
          {page === 'portfolio' ? (
            <Portfolio key="portfolio" />
          ) : (
            <About key="about" />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const Portfolio = () => {
  const [filter, setFilter] = useState('All');
  const lightGalleryRef = useRef(null);

  const filteredItems = filter === 'All' 
    ? PORTFOLIO_ITEMS 
    : PORTFOLIO_ITEMS.filter(item => item.category === filter);

  // Refresh LightGallery when items change
  useEffect(() => {
    if (lightGalleryRef.current) {
      lightGalleryRef.current.refresh();
    }
  }, [filter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ padding: '0 4rem' }}
    >
      {/* Filter Controls */}
      <div style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery */}
      <LightGallery
        onInit={(detail) => {
          lightGalleryRef.current = detail.instance;
        }}
        speed={500}
        plugins={[lgThumbnail, lgZoom]}
        elementClassNames="masonry-grid"
      >
        {filteredItems.map((item) => (
          <a
            key={item.id}
            href={item.src}
            className="masonry-item"
            data-sub-html={`<h4>${item.title}</h4><p>${item.category}</p>`}
          >
            <motion.img
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              src={item.src}
              alt={item.title}
              className="masonry-image"
            />
          </a>
        ))}
      </LightGallery>
    </motion.div>
  );
};

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{ 
        padding: '0 4rem', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '4rem',
        alignItems: 'center'
      }}
    >
      <div className="about-text">
        <motion.h1 
          className="display-text"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Venture <br />
          <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Into The Wild</span>
        </motion.h1>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ maxWidth: '500px', lineHeight: '1.8', fontSize: '1.1rem', color: '#aaa' }}
        >
          <p style={{ marginBottom: '2rem' }}>
            I am a visual artist obsessed with the spaces between moments. 
            My work explores the raw, unfiltered connection between subject and environment.
          </p>
          <p>
            Based in Tokyo, available worldwide. Specializing in high-contrast portraiture 
            and atmospheric landscapes.
          </p>
          
          <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#666' }}>Contact</span>
              <span>tim@timhoward.pro</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#666' }}>Social</span>
              <span>@timhowardphoto</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="about-image"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 1 }}
        style={{ height: '70vh', overflow: 'hidden', position: 'relative' }}
      >
        <img 
          src="https://images.unsplash.com/photo-1554048612-387768052bf7?q=80&w=1000&auto=format&fit=crop" 
          alt="Photographer" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }}
        />
      </motion.div>
    </motion.div>
  );
};

export default App;