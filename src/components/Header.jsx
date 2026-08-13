import React, { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Menu, Home, GraduationCap, Music2, Heart, Briefcase, Sparkles, Mail, Users } from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';

const headerVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
};

const navLinks = [
  { to: '/about', label: 'About' },
  { to: '/academics', label: 'Academics' },
  // { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/work', label: 'Work' },
  // { to: '/leadership', label: 'Leadership' },
  { to: '/music', label: 'Music' },
];

const Header = memo(({ toggleTheme, currentTheme, onHamburgerClick }) => {
  const location = useLocation();

  const handleThemeToggle = useCallback(
    (e) => {
      toggleTheme();
      e.currentTarget.blur();
    },
    [toggleTheme]
  );

  const ThemeIcon = useMemo(() => (currentTheme === 'light' ? Moon : Sun), [currentTheme]);
  const themeAriaLabel = useMemo(() => `Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`, [currentTheme]);

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-8 py-4 bg-muted/70 dark:bg-muted/50 backdrop-blur-md shadow-md border-b border-border/40"
      style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
    >
      <Link
        to="/"
        className="text-2xl sm:text-3xl font-extrabold text-primary tracking-wide select-none hover:opacity-80 transition"
      >
        Ruel Sinha
      </Link>

      <nav className="hidden min-[935px]:flex gap-2 sm:gap-4 md:gap-6 items-center">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to || (link.to === '/about' && location.pathname === '/');
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors duration-150
                ${
                  isActive
                    ? 'text-primary bg-primary/10 dark:bg-primary/20'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
            >
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={handleThemeToggle}
          type="button"
          className="ml-0 p-2 rounded-full text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 will-change-transform cursor-pointer"
          aria-label={themeAriaLabel}
        >
          <ThemeIcon className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={onHamburgerClick}
          aria-label="Open menu"
          className="ml-1 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 will-change-transform cursor-pointer"
        >
          <Menu className="w-6 h-6 text-primary" />
        </button>
      </nav>

      <div className="max-[934px]:flex hidden items-center gap-1 overflow-x-auto no-scrollbar mask-gradient pr-2">
        {[
          { to: '/about', Icon: Home, label: 'Home' },
          { to: '/academics', Icon: GraduationCap, label: 'Academics' },
          { to: '/skills', Icon: Briefcase, label: 'Skills' },
          { to: '/projects', Icon: Sparkles, label: 'Projects' },
          { to: '/work', Icon: Sparkles, label: 'Work' },
          { to: '/leadership', Icon: Users, label: 'Leadership' },
          { to: '/music', Icon: Music2, label: 'Music' }
        ].map(({ to, Icon, label }) => {
           const isActive = location.pathname === to || (to === '/about' && location.pathname === '/');
           return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={`p-2 rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex-shrink-0 ${
                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
        <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />
        <button
          onClick={handleThemeToggle}
          type="button"
          className="p-2 rounded-full text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 will-change-transform cursor-pointer flex-shrink-0"
          aria-label={themeAriaLabel}
        >
          <ThemeIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onHamburgerClick}
          aria-label="Open menu"
          className="ml-0 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 will-change-transform cursor-pointer flex-shrink-0"
        >
          <Menu className="w-6 h-6 text-primary" />
        </button>
      </div>
    </motion.header>
  );
});

Header.displayName = 'Header';

export default Header;
