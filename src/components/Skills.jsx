import React, { useMemo, memo } from 'react';
import { Handshake, Code, Languages, ArrowUpRight, Settings2, Box, Crown, Eye, Hand, Piano } from 'lucide-react';
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
		transition: { staggerChildren: 0.1 },
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

const MasteryBadge = memo(({ text, side }) => (
	<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 font-bold tracking-wide border border-amber-400 rounded-full mb-2 text-xs">
		{ text == "100%" ? <Crown className="w-3 h-3 text-amber-500"/> : null }
		<div className="text-amber-900 dark:text-amber-200">{text}</div>
		<div className="text-neutral-700 dark:text-neutral-300">{side}</div>
	</span>
));
MasteryBadge.displayName = 'MasteryBadge';

const TechnicalHighlight = memo(({ children }) => (
	<div className="my-3 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700">
		<div className="flex justify-start opacity-80 scale-90 origin-left">{children}</div>
	</div>
));
TechnicalHighlight.displayName = 'TechnicalHighlight';

const SkillTag = memo(({ tag }) => (
	<span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
		{tag}
	</span>
));
SkillTag.displayName = 'SkillTag';

const SkillCard = memo(({ section }) => {
	const { icon, title, tags, description, link, mastery, masteryside, highlight } = section;

	return (
		<motion.div
			variants={itemVariants}
			className="group relative flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6"
		>
			<div className="flex items-start gap-5 mb-4">
				<div className="w-14 h-14 shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white shadow-sm">
					{React.cloneElement(icon, { className: 'w-7 h-7' })}
				</div>

				<div className="flex flex-col items-start pt-1">
					<h3 className="text-lg font-bold text-neutral-900 dark:text-white list-none leading-tight">
						{title}
					</h3>
					{mastery && (
						<div className="mt-2">
							<MasteryBadge text={mastery} side={masteryside} />
						</div>
					)}
				</div>
			</div>

			<div className="grow flex flex-col">
				{highlight && <TechnicalHighlight>{highlight}</TechnicalHighlight>}

				{description && (
					<p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">{description}</p>
				)}

				<div className="flex flex-wrap gap-2 content-start justify-start mb-2 grow">
					{tags && tags.map((tag, idx) => <SkillTag key={idx} tag={tag} />)}
				</div>

				{link && (
					<div className="mt-auto pt-2 flex justify-start w-full">
						<motion.a
							href={link.url}
							target={link.external ? '_blank' : null}
							rel={link.external ? 'noopener noreferrer' : null}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-4 py-2 bg-white text-black! rounded-lg hover:bg-gray-200 transition-colors font-bold shadow-sm text-sm w-fit border border-neutral-200"
							style={{ backgroundColor: 'white', color: 'black' }}
						>
							{link.label}
							<ArrowUpRight className="w-4 h-4 shrink-0" />
						</motion.a>
					</div>
				)}
			</div>
		</motion.div>
	);
});
SkillCard.displayName = 'SkillCard';

const SKILLS_DATA = [
	{
		title: 'Applied Mathematics',
		icon: <Integral />,
		highlight: (
			<InlineMath math="m \frac{d^2x}{{dt}^2} \mathbf{i} + m \frac{d^2y}{{dt}^2} \mathbf{j} = \left( -k_D \frac{dx}{dt} + k_L \frac{dy}{dt} \right) \mathbf{i} - \left( k_L \frac{dx}{dt} + k_D \frac{dy}{dt} + mg \right) \mathbf{j}" />
		),
		tags: ['Calculus', 'Computer Science', 'Differential Equations'],
		mastery: '100%',
		masteryside: '- AP Calculus @ school',
		link: {
			label: 'See Calculus Project',
			url: '/assets/projects/table-tennis-trajectory.pdf',
			external: true,
		},
	},
	{
		title: 'Leadership & Teamwork',
		icon: <Handshake />,
		description: (
			<>
				• Vancouver General Hospital - Volunteer Patient Program<br />
				• Various Leadership Positions at school<br />
				• Multicultural background + can collaborate with anyone
			</>
		),
		tags: ['Volunteer Patient', 'Math Tutor', 'Section Leader'],
		mastery: '365+ Hours',
		masteryside: '- Volunteer Patient @ VGH',
		link: {
			label: 'See Leadership',
			url: '/#/leadership',
			external: false,
		},
	},
	{
		title: 'Languages',
		icon: <Languages />,
		description: (
			<div className="flex flex-col gap-4 w-full text-left">
				<div className="flex flex-col gap-4 mt-1">
					<div className="flex flex-col gap-2 items-start">
						<span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
							Native / Fluent
						</span>
						<div className="flex flex-wrap gap-2 justify-start">
							{['English', 'Hindi', 'French'].map((lang) => (
								<span
									key={lang}
									className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 shadow-sm"
								>
									{lang}
								</span>
							))}
						</div>
					</div>

					<div className="flex flex-col gap-2 items-start">
						<span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
							Basic / Still Learning
						</span>
						<div className="flex flex-wrap gap-2 justify-start">
							{['Japanese', 'Mandarin'].map((lang) => (
								<span
									key={lang}
									className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 text-xs font-semibold border border-amber-200 dark:border-amber-800 shadow-sm"
								>
									{lang}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
		),
	},
	{
		title: 'Programming',
		icon: <Code />,
		description: 'Can develop basic applications & full-stack websites',
		tags: ['Java', 'Python', 'JavaScript', 'React JSX', 'AWS S3', 'Github'],
		mastery: '100%',
		masteryside: '- Computer Science @ school',
		link: {
			label: 'See Projects',
			url: '/#/projects',
			external: false,
		},
	},
	{
		title: 'Engineering & Problem-Solving',
		icon: <Box />,
		description: 'Engineer devices with novel and creative functionality',
		tags: ['Electrical Design', 'Arduino (C++)', 'Mechanical Design'],
		mastery: '98%',
		masteryside: '- Engineering (Robotics) @ school',
		link: {
			label: 'See Projects',
			url: '/#/projects',
			external: false,
		},
	},
	{
		title: 'Music',
		icon: <Piano />,
		description: "Play multiple instruments at a high level in various ensembles.",
		tags: ['Piano', 'Trombone', 'Viola'],
		link: {
			label: 'See Music Experience',
			url: '/#/music',
			external: false,
		},
	},
	{
		title: 'Athleticsm & Etiquette',
		icon: <Hand />,
		description: "Karate values politeness & respect foremost, then technique.",
		tags: ['Karate - Brown Belt', 'JKA-Vancouver']
	},
	{
		title: 'Presentation',
		icon: <Eye />,
		description: 'Can visualize and present complex ideas.',
		tags: ['Statistics Project', 'Visualization'],
		link: {
			label: 'See Example',
			url: '/assets/projects/ruel-stats-project.pdf',
			external: true,
		},
	}
];

export default memo(function Skills() {
	return (
		<section className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16 md:py-24">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="w-full max-w-7xl mx-auto"
			>
				<motion.div variants={itemVariants} className="text-center mb-16">
					<h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-4 text-neutral-900 dark:text-white">
						<Settings2 className="w-10 h-10 md:w-12 md:h-12 text-neutral-900 dark:text-white" />
						Skills & Interests
					</h1>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6">
					{SKILLS_DATA.map((section, idx) => (
						<div
							key={section.title}
							className={`h-full ${idx < 2 ? 'lg:col-span-4' : idx === 2 ? 'lg:col-span-2' : idx < 7 ? 'lg:col-span-3' : 'lg:col-span-2'}`}
						>
							<SkillCard section={section} />
						</div>
					))}
				</div>
			</motion.div>
		</section>
	);
});
