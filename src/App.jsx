import React, { useState, useEffect, useRef, useMemo } from 'react';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgHash from 'lightgallery/plugins/hash';
import { motion, AnimatePresence } from 'framer-motion';
import timPhoto from './assets/tim-howard-photo.jpg';

// Dynamically import images from src/assets/images
const imageModules = import.meta.glob('./assets/images/**/*.{jpg,jpeg,png,webp,svg}', { eager: true });

const getItems = (modules, filterFn = () => true) => {
  return Object.keys(modules)
    .filter((path) => !path.includes('_thumb.') && !path.includes('/Thumbs/'))
    .filter(filterFn)
    .map((path, index) => {
      // path example: "./assets/images/Category/ImageName.jpg"
      const parts = path.split('/');
      // Use the subfolder name as the category
      const category = parts[parts.length - 2];
      const filename = parts[parts.length - 1];

      // Find thumbnail if it exists
      const dotIndex = filename.lastIndexOf('.');
      const nameWithoutExt = filename.substring(0, dotIndex);
      const ext = filename.substring(dotIndex);
      const thumbFilename = `${nameWithoutExt}_thumb${ext}`;
      const thumbPath = `./assets/images/Thumbs/${thumbFilename}`;
      const thumbSrc = modules[thumbPath] ? modules[thumbPath].default : modules[path].default;

      // Format title from filename
      const nameOnly = filename.split('.')[0];
      const title = nameOnly.replace(/[-_]/g, ' ');
      const slug = nameOnly.replace(/[-_]/g, '-').toLowerCase();

      return {
        id: index + 1,
        src: modules[path].default,
        thumb: thumbSrc,
        category: category,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        slug: slug
      };
    });
};

const PORTFOLIO_ITEMS = getItems(imageModules, (path) => !path.includes('/stories/') && !path.includes('/clients/'));
const STORIES_ITEMS = getItems(imageModules, (path) => path.includes('/stories/'));
const CLIENT_ITEMS = getItems(imageModules, (path) => path.includes('/clients/'));

const App = () => {
  const [page, setPage] = useState('portfolio'); // 'portfolio' or 'about'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');

    // Handle deep linking
    const hash = window.location.hash;
    if (hash.includes('lg=stories')) {
      setPage('stories');
    } else if (hash.includes('lg=portfolio')) {
      setPage('portfolio');
    }
    if (window.location.pathname === '/clients') {
      setPage('clients');
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="app-container">
      <div className="noise-overlay" />
      
      {/* Navigation */}
      <nav>
        <div className="logo" onClick={() => setPage('portfolio')} style={{ cursor: 'pointer' }}>
          TIM HOWARD <span style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>// PHOTOGRAPHER</span>
        </div>
        <div className="links">
          <span 
            className={`nav-link ${page === 'portfolio' ? 'active' : ''}`} 
            onClick={() => setPage('portfolio')}
          >
            Images
          </span>
          <span 
            className={`nav-link ${page === 'stories' ? 'active' : ''}`} 
            onClick={() => setPage('stories')}
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
      <main style={{ paddingBottom: '4rem', minHeight: '100vh' }}>
        <AnimatePresence mode="wait">
          {page === 'portfolio' ? (
            <Gallery key="portfolio" items={PORTFOLIO_ITEMS} galleryId="portfolio" />
          ) : page === 'stories' ? (
            <Gallery key="stories" items={STORIES_ITEMS} allLabel="All Stories" galleryId="stories" />
          ) : page === 'clients' ? (
            <Clients key="clients" />
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

const Gallery = ({ items, allLabel = 'All', galleryId }) => {
  const [filter, setFilter] = useState(allLabel);
  const [galleryItems, setGalleryItems] = useState(items);
  const [visibleCount, setVisibleCount] = useState(() => {
    const hash = window.location.hash;
    if (galleryId && hash.includes(`lg=${galleryId}`) && hash.includes('&slide=')) {
      const params = new URLSearchParams(hash.substring(1));
      const slide = params.get('slide');
      if (slide) {
        const index = items.findIndex(item => item.slug === slide);
        if (index !== -1) {
          return Math.max(12, index + 5);
        }
      }
    }
    return 12;
  });
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

  const uniqueCategories = useMemo(() => [...new Set(items.map(item => item.category))], [items]);
  const categories = [allLabel, ...uniqueCategories.sort()];

  const filteredItems = useMemo(() => {
    return filter === allLabel 
      ? galleryItems 
      : galleryItems.filter(item => item.category === filter);
  }, [filter, galleryItems, allLabel]);

  const displayedItems = filteredItems.slice(0, visibleCount);

  // Refresh LightGallery when items change
  useEffect(() => {
    if (lightGalleryRef.current) {
      lightGalleryRef.current.refresh();
    }
  }, [filter, galleryItems, visibleCount]);

  useEffect(() => {
    setVisibleCount(12);
  }, [filter]);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, filteredItems.length));
  };

  const handleImageLoad = async (e, itemId) => {
    const img = e.target;
    try {
      const { default: exifr } = await import('exifr');
      const output = await exifr.parse(img, { iptc: true });
      
      if (!output) return;
      
      let title = output.Caption || output['Caption-Abstract'] || output.ImageDescription;
      if (Array.isArray(title)) title = title[0];
      
      if (title) {
        setGalleryItems(prev => {
          const currentItem = prev.find(item => item.id === itemId);
          if (currentItem && currentItem.title === title) return prev;
          return prev.map(item => 
            item.id === itemId ? { ...item, title } : item
          );
        });
      }
    } catch (error) {
      console.debug("EXIF parsing failed", error);
    }
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
        plugins={[lgThumbnail, lgZoom, lgHash]}
        elementClassNames="masonry-grid"
        galleryId={galleryId}
        customSlideName={true}
        download={false}
      >
        {displayedItems.map((item, index) => (
          <a
            key={item.id}
            href={item.src}
            className="masonry-item"
            data-sub-html={`<h4>${item.title}</h4><p>${item.category}</p>`}
            data-slide-name={item.slug}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (index % 10) * 0.05 }}
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

      {visibleCount < filteredItems.length && (
        <motion.div
          onViewportEnter={loadMore}
          style={{ width: '100%', height: 50 }}
        />
      )}
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

const Clients = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // SHA-256 hash for "1234"
    const hash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    if (hashHex === hash) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '2rem'
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>Client Access</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            style={{
              padding: '0.8rem',
              fontSize: '1rem',
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            className="filter-btn"
            style={{
              border: '1px solid var(--accent)',
              padding: '0.5rem 2rem',
              color: 'var(--accent)',
              marginTop: '1rem'
            }}
          >
            ENTER
          </button>
          {error && <p style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>{error}</p>}
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="gallery-container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1 className="display-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Private Gallery</h1>
      </div>
      <Gallery items={CLIENT_ITEMS} galleryId="clients" />
    </motion.div>
  );
};

export default App;