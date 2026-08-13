import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowUpRight } from 'lucide-react';

const TIMELINE_DATA = [
  {
    year: '2020',
    title: 'Started Medical Volunteering',
    description: 'Began journey at Vancouver General Hospital @ UBC Faculty of Medicine as a volunteer patient.'
  },
  {
    year: '2024',
    title: 'Robotiqa Tech Internship',
    description: 'QA Testing and Data Analysis intern, optimizing automation workflows.'
  },
  {
    year: '2024',
    title: 'Chess Club Presidency',
    description: 'Re-founded Chess Club after previous president graduated. Set up new points system.'
  },
  {
    year: '2024',
    title: 'Started Tutoring',
    description: 'Selected by school to tutor students in Math & Physics'
  },
  {
    year: '2024',
    title: 'Elections BC Officer',
    description: 'Served as an Elections Officer, managing voter registration.'
  },
  {
    year: '2026',
    title: 'Future Vision',
    description: 'Pursuing excellence in Engineering and Healthcare Technology innovation.'
  },
];

const TimelineItem = memo(({ item, index }) => {
  const isLeft = (Math.floor(index / 2) != (index/2))

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`flex items-center justify-between w-full mb-8 ${isLeft ? 'flex-row-reverse' : ''}`}
    >
      {/* Content Side */}
      <div className="w-5/12">
        <div className={`p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative ${isLeft ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'justify-end' : 'justify-start'}`}>
            <span className="text-primary font-bold text-lg">{item.year}</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
          
          {/* Connector Dot */}
          <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white dark:border-neutral-950 shadow-sm z-10 
            ${isLeft ? '-left-[calc(8.333%+1rem)]' : '-right-[calc(8.333%+1rem)]'}
            md:hidden
          `} />
        </div>
      </div>

      {/* Center Line visual spacer (Desktop) */}
      <div className="w-2/12 flex justify-center relative">
        <div className="w-4 h-4 bg-primary rounded-full border-4 border-white dark:border-neutral-950 shadow-sm z-10 relative" />
      </div>

      {/* Empty Side */}
      <div className="w-5/12" />
    </motion.div>
  );
});
TimelineItem.displayName = 'TimelineItem';

const GrowthTimeline = memo(() => {
  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-4 relative">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 rounded-full" />
      
      <div className="relative z-10">
        <div className="text-center mb-12 bg-background/80 backdrop-blur-sm py-4 sticky top-0 z-20">
          <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Growth & Impact Timeline
          </h2>
        </div>

        <div className="flex flex-col">
            {TIMELINE_DATA.map((item, index) => (
                <TimelineItem key={index} item={item} index={index} />
            ))}
        </div>
        
        <div className="flex justify-center mt-12">
             <motion.a
                href="/academics"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white !text-black px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 whitespace-nowrap border border-neutral-200 shadow-lg"
                style={{ backgroundColor: 'white', color: 'black' }}
             >
                View Academic Journey
                <ArrowUpRight className="w-5 h-5" />
             </motion.a>
        </div>
      </div>
    </div>
  );
});

GrowthTimeline.displayName = 'GrowthTimeline';

export default GrowthTimeline;
