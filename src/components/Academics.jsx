import React, { useMemo, memo } from 'react';
import { GraduationCap, NotebookPen } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Animation Variants (The "Staggered Entrance" Pattern) ---
// This container will orchestrate the animation for the whole page
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Time delay between each child animating in
    },
  },
};

// This variant will be used by each item in the container
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// --- Child Component (No changes needed) ---
const AchievementCard = memo(({ achievement }) => {
  const { logo, alt, title, link, institute, year, scoreLabel, score, height = 9 } = achievement;

  const style = { height: `${height}rem` };

  return (
    // This card is now an item in the list's stagger animation
    <motion.div
      variants={itemVariants}
      className="bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow p-6 flex items-center gap-6 mb-14"
      style={style}
    >
      <div className="w-16 h-16 flex-shrink-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shadow rounded-xl p-1 overflow-hidden">
        <img
          src={logo}
          alt={alt}
          className="w-full h-full object-contain rounded-lg"
          loading="lazy"
          decoding="async"
          width={64}
          height={64}
          style={{ aspectRatio: '1/1' }}
        />
      </div>
      <div className="flex flex-col text-left gap-1">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground">{institute}</h3>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline hover:text-foreground dark:hover:text-primary-foreground/70 font-medium transition-colors duration-200"
        >
          {title}
        </a>
        <div className="text-sm text-muted-foreground mt-2 space-y-1">
          <p>
            <span className="font-medium text-foreground/80">Year:</span> {year}
          </p>
          <p>
            <span className="font-medium text-foreground/80">{scoreLabel}:</span> {score}
          </p>
        </div>
      </div>
    </motion.div>
  );
});
AchievementCard.displayName = 'AchievementCard';

const ACADEMICS_DATA = [
  {
    logo: '',
    alt: '',
    title: '',
    link: '',
    institute: '',
    year: '',
    scoreLabel: '',
    score: '',
  },
];

const EDUCATION_DATA = {
  logo: '/assets/VanTech.jpg',
  alt: 'VanTech Logo',
  title: 'Vancouver Technical Secondary School, Canada',
  link: 'https://www.vsb.bc.ca/vancouver-technical',
  institute: 'SUMMIT Mini School accelerated program',
  year: 'Sept 2021 – June 2026',
  scoreLabel: 'Current STEM Academic Average',
  score: '100%',
  // scoreLabel: 'Full Academic Average',        need a new variable, like "scoreLabel2"
  // score: '99.7%',
  height: 10.5,
};

// --- Main Academics Component ---
const AcademicsComponent = memo(function Academics() {
  const achievementCards = useMemo(
    () =>
      ACADEMICS_DATA.map((achievement, index) => (
        <AchievementCard key={`${achievement.title}-${index}`} achievement={achievement} />
      )),
    []
  );

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 mt-2">
      {/* 1. This is the SINGLE animation container for the whole page. */}
      {/* It uses `animate`, not `whileInView`, for guaranteed execution. */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center w-full"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 flex items-center gap-4 text-foreground">
            <GraduationCap className="w-8 h-8 sm:w-11 sm:h-11 text-primary drop-shadow-sm" />
            Education
          </h1>
        </motion.div>

        <motion.div variants={containerVariants} className="w-full max-w-3xl flex flex-col gap-8">
          <AchievementCard achievement={EDUCATION_DATA} />
        </motion.div>

        {/* achievments: */}

        <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 flex items-center gap-4 text-foreground">
            <NotebookPen className="w-6 h-6 sm:w-9 sm:h-9 text-primary drop-shadow-sm" />
            Achievements
          </h1>
        </motion.div>

        <motion.div variants={containerVariants} className="w-full max-w-2xl flex flex-col gap-8">
          {achievementCards}
        </motion.div>
      </motion.div>
    </div>
  );
});

AcademicsComponent.displayName = 'Academics';

export default AcademicsComponent;
