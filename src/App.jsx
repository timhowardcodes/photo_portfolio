import React, { useState, useEffect, useRef } from 'react';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { motion, AnimatePresence } from 'framer-motion';
import exifr from 'exifr';
import timPhoto from './assets/tim-howard-photo.jpg';

// Dynamically import images from src/assets/images
const imageModules = import.meta.glob('./assets/images/**/*.{jpg,jpeg,png,webp,svg}', { eager: true });

const getItems = (modules, filterFn = () => true) => {
  return Object.keys(modules)
    .filter((path) => !path.includes('_thumb.'))
    .filter(filterFn)
    .map((path, index) => {
      // path example: "./assets/images/Category/ImageName.jpg"
      const parts = path.split('/');
      // Use the subfolder name as the category
      const category = parts[parts.length - 2];
      const filename = parts[parts.length - 1];

      // Find thumbnail if it exists
      const dotIndex = path.lastIndexOf('.');
      const thumbPath = path.substring(0, dotIndex) + '_thumb' + path.substring(dotIndex);
      const thumbSrc = modules[thumbPath] ? modules[thumbPath].default : modules[path].default;

      // Format title from filename
      const title = filename.split('.')[0].replace(/[-_]/g, ' ');

      return {
        id: index + 1,
        src: modules[path].default,
        thumb: thumbSrc,
        category: category,
        title: title.charAt(0).toUpperCase() + title.slice(1)
      };
    });
};

const PORTFOLIO_ITEMS = getItems(imageModules, (path) => !path.includes('/trips/'));
const TRIPS_ITEMS = getItems(imageModules, (path) => path.includes('/trips/'));

const App = () => {
  const [page, setPage] = useState('portfolio'); // 'portfolio' or 'about'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

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
            className={`nav-link ${page === 'trips' ? 'active' : ''}`} 
            onClick={() => setPage('trips')}
          >
            Trips
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
      <main style={{ paddingBottom: '4rem', minHeight: '100vh' }}>
        <AnimatePresence mode="wait">
          {page === 'portfolio' ? (
            <Gallery key="portfolio" items={PORTFOLIO_ITEMS} />
          ) : page === 'trips' ? (
            <Gallery key="trips" items={TRIPS_ITEMS} allLabel="All Trips" />
          ) : (
            <About key="about" />
          )}
        </AnimatePresence>
      </main>

      <footer>
        <p className="footer-text">&copy; {new Date().getFullYear()} Tim Howard. All rights reserved.</p>
      </footer>
    </div>
  );
};

const Gallery = ({ items, allLabel = 'All' }) => {
  const [filter, setFilter] = useState(allLabel);
  const [galleryItems, setGalleryItems] = useState(items);
  const lightGalleryRef = useRef(null);
  const filterContainerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDown.current = true;
    filterContainerRef.current.classList.add('active');
    startX.current = e.pageX - filterContainerRef.current.offsetLeft;
    scrollLeft.current = filterContainerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    filterContainerRef.current?.classList.remove('active');
  };

  const handleMouseUp = () => {
    isDown.current = false;
    filterContainerRef.current?.classList.remove('active');
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - filterContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll-fast
    filterContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const uniqueCategories = [...new Set(items.map(item => item.category))];
  const categories = [allLabel, ...uniqueCategories.sort()];

  const filteredItems = filter === allLabel 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter);

  // Refresh LightGallery when items change
  useEffect(() => {
    if (lightGalleryRef.current) {
      lightGalleryRef.current.refresh();
    }
  }, [filter, galleryItems]);

  const handleImageLoad = (e, itemId) => {
    const img = e.target;
    exifr.parse(img, { iptc: true }).then(output => {
      if (!output) return;
      
      let title = output.Caption || output['Caption-Abstract'] || output.ImageDescription;
      if (Array.isArray(title)) title = title[0];
      
      if (title) {
        setGalleryItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, title } : item
        ));
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="gallery-container"
    >
      {/* Filter Controls */}
      <div 
        className="filter-container"
        ref={filterContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {categories.map(cat => (
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
              style={{ position: 'relative' }}
            >
              <div className="image-wrapper">
                <img
                  src={item.thumb}
                  alt={item.title}
                  className="masonry-image"
                  loading="lazy"
                  decoding="async"
                  onLoad={(e) => handleImageLoad(e, item.id)}
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
      className="about-grid"
    >
      <div className="about-text">
        <motion.h1 
          className="display-text"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          INSPIRED BY <br />
          ALPINE LIGHT
        </motion.h1>
        
        <motion.div
          className="about-description"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <p>
           Photographing in some of the world's most extreme environments, Tim's extensive experience as a mountaineer and backcountry skier provide him 
           with a window into a world that most will never see. From these unique positions he captures the drama and 
           dynamism of nature at its best and worst.
          </p>
          <p>
          Tim's award-winning images have been featured in publications including National Geographic and Rock & Ice Magazine.
          </p>
          
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">18</span>
              <span className="stat-label">Years</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">34</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24mm</span>
              <span className="stat-label">Favourite lens</span>
            </div>
          </div>

          <div className="contact-link-wrapper">
             <a href="mailto:tim@timhoward.pro" className="contact-link">
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
      >
        <img 
          src={timPhoto}
          alt="Photographer in the wild" 
          decoding="async"
        />
      </motion.div>
    </motion.div>
  );
};

export default App;