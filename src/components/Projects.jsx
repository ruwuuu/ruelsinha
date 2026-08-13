import React, { memo } from 'react';
// some icons unnecessary, fix later
import {
	Brain,
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

const ProjectCard = memo(({ project }) => {
	const { title, date, summary, link, icon, file } = project;

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

					{link && (
						<div className="mt-2 text-left">
							<motion.a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-6 py-3 bg-white text-black! rounded-lg hover:bg-gray-200 transition-colors font-bold shadow-sm text-sm border border-neutral-200"
								style={{ backgroundColor: 'white', color: 'black' }}
							>
								{link.label || 'View Project'}
								<ArrowUpRight className="w-4 h-4 shrink-0" />
							</motion.a>
						</div>
					)}

					{file && (
						<div className="mt-2 text-left">
							<motion.a
								href={file}
								download
								target="_blank"
								rel="noopener noreferrer"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-6 py-3 bg-white text-black! rounded-lg hover:bg-gray-200 transition-colors font-bold shadow-sm text-sm border border-neutral-200"
								style={{ backgroundColor: 'white', color: 'black' }}
							>
								{'Download File'}
								<ArrowUpRight className="w-4 h-4 shrink-0" />
							</motion.a>
						</div>
					)}

				</div>
			</div>
		</motion.div>
	);
});
ProjectCard.displayName = 'ProjectCard';

const ACADEMIC_PROJECTS = [
	{
		title: 'Ball Trajectory Analysis (partner project)',
		date: 'Jan 2026',
		icon: <Integral className="w-8 h-8" />,
		summary:
			'Modeled the trajectory of a ball, with air resistance and spin, a parametric function of time & checked with gathered data.',
		link: {
			label: 'View Paper',
			url: '/assets/projects/table-tennis-trajectory.pdf',
		},
	},
	{
		title: 'Statistics Project (partner project)',
		date: 'Jan 2026',
		icon: <ChartColumn className="w-8 h-8" />,
		summary: 'Statistical inference on reaction times',
		link: {
			label: 'View Poster',
			url: '/assets/projects/ruel-stats-project.pdf',
		},
	},
];

const SOFTWARE_ENGINEERING = [
	{
		title: 'Multiplayer Snake Game',
		date: '2023',
		icon: <Box className="w-8 h-8" />,
		summary: 'Basic app coded in python',
		file: '/assets/projects/multisnake.py',
	},
	{
		title: 'Thumbnet (partner project)',
		date: 'WIP',
		icon: <Code className="w-8 h-8" />,
		summary: 'Full-stack commercial website being developed using React.',
	},
	{
		title: 'LED Cube',
		date: '2024',
		icon: <Box className="w-8 h-8" />,
		summary: "3D Cube with LED's flashing; pattern programmed with Arduino IDE",
	},
	{
		title: 'Remote Controlled Sumo Robot',
		date: '2024',
		icon: <Bot className="w-8 h-8" />,
		summary: 'Built robot with uniquely engineered functions.',
	},
];

const ProjectsComponent = memo(function Projects() {
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
						<Brain className="w-8 h-8 sm:w-11 sm:h-11 text-primary drop-shadow-sm" />
						Projects
					</h1>
				</motion.div>

				<motion.div variants={itemVariants} className="flex flex-col items-center text-center w-full max-w-3xl">
					<div className="flex items-center gap-2 mb-3 self-start">
						<Cpu className="w-6 h-6 text-primary" />
						<h2 className="text-2xl font-bold text-foreground">Software & Engineering</h2>
					</div>
					<div className="w-full flex flex-col gap-2">
						{SOFTWARE_ENGINEERING.map((proj, i) => (
							<ProjectCard key={i} project={proj} />
						))}
					</div>
					<div className="flex items-center mb-6 self-start">	
						<motion.a
							href="https://drive.google.com/drive/folders/1XbML3RBa6BdaWXGFaCqieOFf1JNRcihN?usp=sharing"
							target="_blank"
							rel="noopener noreferrer"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-4 py-1 bg-white text-black! rounded-full hover:bg-gray-200 transition-colors font-semibold shadow-lg cursor-pointer border border-neutral-200"
							style={{ backgroundColor: 'white', color: 'black' }}
						>
							See images & videos
						</motion.a>
					</div>
					<div className="w-full my-8 h-px bg-white/30 dark:bg-white/20"></div>
				</motion.div>

				<motion.div variants={itemVariants} className="flex flex-col items-center text-center w-full max-w-3xl">
					<div className="flex items-center gap-2 mb-6 self-start">
						<FlaskConical className="w-6 h-6 text-primary" />
						<h2 className="text-2xl font-bold text-foreground">Applied Academics</h2>
					</div>
					<div className="w-full flex flex-col gap-2">
						{ACADEMIC_PROJECTS.map((proj, i) => (
							<ProjectCard key={i} project={proj} />
						))}
					</div>
					<div className="w-full my-8 h-px bg-white/30 dark:bg-white/20"></div>
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

export default ProjectsComponent;
