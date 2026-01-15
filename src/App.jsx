import React, { useState, useEffect, useRef } from 'react';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import images from src/assets/images
const imageModules = import.meta.glob('./assets/images/**/*.{jpg,jpeg,png,webp,svg}', { eager: true });

const PORTFOLIO_ITEMS = Object.keys(imageModules).map((path, index) => {
  // path example: "./assets/images/Category/ImageName.jpg"
  const parts = path.split('/');
  // Use the subfolder name as the category
  const category = parts[parts.length - 2];
  const filename = parts[parts.length - 1];
  // Format title from filename
  const title = filename.split('.')[0].replace(/[-_]/g, ' ');

  return {
    id: index + 1,
    src: imageModules[path].default,
    category: category,
    title: title.charAt(0).toUpperCase() + title.slice(1)
  };
});

const uniqueCategories = [...new Set(PORTFOLIO_ITEMS.map(item => item.category))];
const CATEGORIES = ['All', ...uniqueCategories.sort()];

const App = () => {
  const [page, setPage] = useState('portfolio'); // 'portfolio' or 'about'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <div className="app-container">
      <div className="noise-overlay" />
      
      {/* Navigation */}
      <nav>
        <div className="logo">
          TIM HOWARD <span style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>// PHOTOGRAPHER</span>
        </div>
        <div className="links">
          <span 
            className={`nav-link ${page === 'portfolio' ? 'active' : ''}`} 
            onClick={() => setPage('portfolio')}
          >
            Stories
          </span>
          <span 
            className={`nav-link ${page === 'about' ? 'active' : ''}`} 
            onClick={() => setPage('about')}
          >
            About
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ paddingTop: '140px', paddingBottom: '4rem', minHeight: '100vh' }}>
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '0 4rem' }}
    >
      {/* Filter Controls */}
      <div className="filter-container">
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
        {filteredItems.map((item, index) => (
          <a
            key={item.id}
            href={item.src}
            className="masonry-item"
            data-sub-html={`<h4>${item.title}</h4><p>${item.category}</p>`}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <div className="image-wrapper">
                <img
                  src={item.src}
                  alt={item.title}
                  className="masonry-image"
                />
              </div>
              <div className="item-overlay">
                <p>{item.category}</p>
              </div>
            </motion.div>
          </a>
        ))}
      </LightGallery>
    </motion.div>
  );
};

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.6 }}
      style={{ padding: '0 4rem' }}
      className="about-grid"
    >
      <div className="about-text">
        <motion.h1 
          className="display-text"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          HIGH <br />
          LIGHT
        </motion.h1>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ maxWidth: '500px', lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--text-secondary)' }}
        >
          <p style={{ marginBottom: '2rem' }}>
            Photography is a way of feeling, of touching, of loving. What you have caught on 
            film is captured forever... It remembers little things, long after you have 
            forgotten everything.
          </p>
          <p>
            Documenting the silence of the peaks and the stories written in the snow.
            Based in the Rockies, exploring the world one ascent at a time.
          </p>
          
          <div style={{ display: 'flex', gap: '3rem', marginTop: '2rem' }}>
            <div className="stat-item">
              <span className="stat-number">18</span>
              <span className="stat-label">Years</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">34</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">35mm</span>
              <span className="stat-label">Film</span>
            </div>
          </div>

          <div style={{ marginTop: '3rem' }}>
             <a href="mailto:tim@timhoward.pro" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
               GET IN TOUCH &rarr;
             </a>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="about-image"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 1 }}
        style={{ height: '70vh', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      >
        <img 
          src="https://images.unsplash.com/photo-1554048612-387768052bf7?q=80&w=1000&auto=format&fit=crop" 
          alt="Photographer in the wild" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </motion.div>
    </motion.div>
  );
};

export default App;