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
    .sort((a, b) => {
      const nameA = a.split('/').pop();
      const nameB = b.split('/').pop();
      return nameA.localeCompare(nameB, undefined, { numeric: true });
    })
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
      const cleanName = nameOnly.replace(/^\d+[-_]/, '');
      const title = cleanName.replace(/[-_]/g, ' ');
      const slug = cleanName.replace(/[-_]/g, '-').toLowerCase();

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
  const [path, setPath] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      window.history.replaceState(null, '', redirect + window.location.hash);
      return redirect;
    }
    return window.location.pathname;
  });

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');

    const onPopState = () => {
      setPath(window.location.pathname);
    };

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigate = (newPath) => {
    if (newPath !== window.location.pathname) {
      window.history.pushState(null, '', newPath);
      setPath(newPath);
      window.scrollTo(0, 0);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let page = 'portfolio';
  if (path.startsWith('/stories')) {
    page = 'stories';
  } else if (path.startsWith('/about')) {
    page = 'about';
  } else if (path.startsWith('/clients')) {
    page = 'clients';
  }

  return (
    <div className="app-container">
      <div className="noise-overlay" />
      
      {/* Navigation */}
      <nav>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          TIM HOWARD <span style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>// PHOTOGRAPHER</span>
        </div>
        <div className="links">
          <span 
            className={`nav-link ${page === 'portfolio' ? 'active' : ''}`} 
            onClick={() => navigate('/images')}
          >
            Images
          </span>
          <span 
            className={`nav-link ${page === 'stories' ? 'active' : ''}`} 
            onClick={() => navigate('/stories')}
          >
            Stories
          </span>
          <span 
            className={`nav-link ${page === 'about' ? 'active' : ''}`} 
            onClick={() => navigate('/about')}
          >
            About
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ paddingBottom: '4rem', minHeight: '100vh' }}>
        <AnimatePresence mode="wait">
          {page === 'portfolio' ? (
            <Gallery 
              key="portfolio" 
              items={PORTFOLIO_ITEMS} 
              galleryId="portfolio" 
              basePath="/images"
              currentPath={path}
              onNavigate={navigate}
            />
          ) : page === 'stories' ? (
            <Gallery 
              key="stories" 
              items={STORIES_ITEMS} 
              allLabel="All Stories" 
              galleryId="stories" 
              basePath="/stories"
              currentPath={path}
              onNavigate={navigate}
            />
          ) : page === 'clients' ? (
            <Clients key="clients" />
          ) : (
            <About key="about" />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 99,
              padding: '0.8rem',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              width: '45px',
              height: '45px'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <footer>
        <p className="footer-text">&copy; {new Date().getFullYear()} Tim Howard. All rights reserved.</p>
      </footer>
    </div>
  );
};

const Gallery = ({ items, allLabel = 'All', galleryId, basePath, currentPath, onNavigate, showAll = true }) => {
  const uniqueCategories = useMemo(() => [...new Set(items.map(item => item.category))].sort(), [items]);
  const categories = showAll ? [allLabel, ...uniqueCategories] : uniqueCategories;

  const [localFilter, setLocalFilter] = useState(() => {
    if (showAll) return allLabel;
    return uniqueCategories.length > 0 ? uniqueCategories[0] : allLabel;
  });

  const filter = useMemo(() => {
    if (!basePath) return localFilter;
    if (currentPath === '/' && basePath === '/images') return allLabel;
    if (currentPath === basePath || currentPath === basePath + '/') return allLabel;
    
    if (currentPath && currentPath.startsWith(basePath + '/')) {
      const slug = currentPath.substring(basePath.length + 1);
      const category = uniqueCategories.find(c => c.toLowerCase() === slug.toLowerCase());
      return category || allLabel;
    }
    return allLabel;
  }, [currentPath, basePath, allLabel, uniqueCategories, localFilter]);

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
            onClick={() => {
              if (basePath && onNavigate) {
                onNavigate(cat === allLabel ? basePath : `${basePath}/${cat.toLowerCase()}`);
              } else {
                setLocalFilter(cat);
                window.scrollTo(0, 0);
              }
            }}
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
    const hash = "480b5712d70eb03511f232e524d49afc01b978d784fe34fd80e5bb663fa47cf2";
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
      <Gallery items={CLIENT_ITEMS} galleryId="clients" showAll={false} />
    </motion.div>
  );
};

export default App;