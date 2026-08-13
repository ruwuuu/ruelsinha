import React, { useState, useEffect, useCallback, memo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

import About from './components/About';
import Skills from './components/Skills';
import Academics from './components/Academics';
import Projects from './components/Projects';
import Work from './components/Work';
import Contact from './components/Contact';
import Music from './components/Music';
import Leadership from './components/Leadership';
export const StaticBackground = memo(({ theme }) => {
  const lightStyles = {
    backgroundColor: 'hsl(210, 40%, 98%)', // A very light, clean, off-white
    backgroundImage: `
      /* radial gradients */
      radial-gradient(ellipse at 10% 10%, hsla(160, 100%, 94%, 0.5), transparent),
      radial-gradient(ellipse at 90% 90%, hsla(200, 100%, 94%, 0.5), transparent),
      /* grid pattern */
      linear-gradient(hsl(210, 40%, 96%) 1.5px, transparent 1.5px),
      linear-gradient(to right, hsl(210, 40%, 96%) 1.5px, hsl(210, 40%, 98%) 1.5px)
    `,
    backgroundSize: '40px 40px',
  };

  const darkStyles = {
    backgroundColor: 'hsl(222, 47%, 11%)',
    backgroundImage: `
      /* radial gradients */
      radial-gradient(ellipse at 10% 10%, hsla(210, 96%, 11%, 8), transparent),
      radial-gradient(ellipse at 90% 90%, hsla(210, 96%, 11%, 8), transparent),
      radial-gradient(ellipse at 10% 90%, hsla(270, 90%, 15%, 5), transparent),
      radial-gradient(ellipse at 90% 10%, hsla(270, 90%, 15%, 5), transparent),
      /* grid pattern */
      linear-gradient(hsla(120, 47%, 15%, 1) 2px, transparent 2px),
      linear-gradient(to right, hsla(120, 47%, 15%, 1) 2px, hsl(222, 47%, 11%) 2px)
    `,
    backgroundSize: '45px 45px',
  };

  const styles = theme === 'light' ? lightStyles : darkStyles;

  return <div className="fixed inset-0 -z-50 pointer-events-none transition-colors duration-500" style={styles} />;
});
StaticBackground.displayName = 'StaticBackground';

const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { type: 'tween', ease: 'anticipate', duration: 0.5 };

const AnimatedRoutes = memo(() => {
  const location = useLocation();
  const routesConfig = [
    { path: '/', Component: About },
    { path: '/about', Component: About },
    { path: '/academics', Component: Academics },
    { path: '/music', Component: Music },
    { path: '/leadership', Component: Leadership },
    { path: '/skills', Component: Skills },
    { path: '/projects', Component: Projects },
    { path: '/work', Component: Work },
    { path: '/contact', Component: Contact }
  ];

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routesConfig.map(({ path, Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <Component />
              </motion.div>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
});
AnimatedRoutes.displayName = 'AnimatedRoutes';

function App() {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [sideNavOpen, setSideNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout theme={theme} toggleTheme={toggleTheme} sideNavOpen={sideNavOpen} setSideNavOpen={setSideNavOpen}>
        <AnimatedRoutes />
      </Layout>

    </Router>
  );
}

export default App;
