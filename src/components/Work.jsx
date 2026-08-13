import React, { memo } from 'react';
// some icons unnecessary, fix later
import {
	Briefcase,
	Cpu,
	FlaskConical,
	FileText,
	ArrowUpRight,
	Code,
	Activity,
	Vote,
	Bot,
	Box,
	ChartColumn,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { createLucideIcon } from 'lucide-react';

export const Integral = createLucideIcon('Integral', [
	[
		'path',
		{
			d: 'M14 2c-2 0-3 1-3 3v14c0 2-1 3-3 3',
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
		},
	],
]);

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.15 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: 'easeOut' },
	},
};

const TechTag = memo(({ tag }) => (
	<span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
		{tag}
	</span>
));
TechTag.displayName = 'TechTag';

const WorkCard = memo(({ job }) => {
	const { title, date, summary, icon } = job;

	return (
		<motion.div
			variants={itemVariants}
			className="bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow p-6 mb-6"
		>
			<div className="flex items-start gap-6">
				<div className="w-16 h-16 shrink-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shadow rounded-xl p-1 overflow-hidden text-neutral-700 dark:text-neutral-200">
					{icon}
				</div>

				<div className="flex flex-col text-left gap-1 flex-1">
					<h3 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h3>

					{date && <p className="text-sm font-medium text-primary">{date}</p>}

					<div className="text-sm text-muted-foreground mb-3 leading-relaxed">{summary}</div>
				</div>
			</div>
		</motion.div>
	);
});
WorkCard.displayName = 'WorkCard';

const WORK_EXPERIENCE = [
	{
		title: 'Elections BC - Election Officer',
		date: 'Oct 2024',
		icon: <Vote className="w-8 h-8" />,
		summary: 'Carried out voter registration and ballot processing.',
	},
	{
		title: 'Robotiqa Technologies - Data Intern',
		date: 'Summer 2024',
		icon: <Briefcase className="w-8 h-8" />,
		summary: 'Tested and validated automation software; logged defects & reproduced edge cases.',
	},
];

const WorkComponent = memo(function Projects() {
	return (
		<div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 mt-2">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="flex flex-col items-center w-full"
			>
				<motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-12">
					<h1 className="text-4xl sm:text-5xl font-bold text-center mb-4 flex items-center gap-4 text-foreground">
						<Briefcase className="w-8 h-8 sm:w-11 sm:h-11 text-primary drop-shadow-sm" />
						Work
					</h1>
				</motion.div>

				<motion.div variants={itemVariants} className="flex flex-col items-center text-center w-full max-w-3xl">
					<div className="flex items-center gap-2 mb-6 self-start">
						<Briefcase className="w-6 h-6 text-primary" />
						<h2 className="text-2xl font-bold text-foreground">Work Experience</h2>
					</div>
					<div className="w-full flex flex-col gap-2">
						{WORK_EXPERIENCE.map((job, i) => (
							<WorkCard key={i} job={job} />
						))}
					</div>
				</motion.div>

				<motion.div variants={itemVariants} className="mt-12 mb-8">
					<motion.a
						href="/assets/ruel-sinha-resume-2026.pdf"
						target="_blank"
						rel="noopener noreferrer"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-8 py-3 bg-white text-black! rounded-full hover:bg-gray-200 transition-colors font-bold text-base shadow-lg cursor-pointer border border-neutral-200"
						style={{ backgroundColor: 'white', color: 'black' }}
					>
						<FileText className="w-5 h-5 shrink-0" />
						View Resume
						<ArrowUpRight className="w-5 h-5 shrink-0" />
					</motion.a>
				</motion.div>
			</motion.div>
		</div>
	);
});

export default WorkComponent;
