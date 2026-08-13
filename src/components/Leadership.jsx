import React, { useState, memo } from 'react';
import { Users, Heart, GraduationCap, Crown, Swords, ArrowUpRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GrowthTimeline from './GrowthTimeline';

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
		},
	},
};

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

const LEADERSHIP_DATA = [
	{
		title: 'Volunteer Patient',
		organization: 'Vancouver General Hospital @ UBC Faculty of Medicine',
		hours: '365+ Total Hours',
		period: '2021 - Present',
		highlights: [
			'Was the subject of clinical skills training scenarios for UBC medical students.',
			'Healthcare System Impact: Contributed to the training of future doctors in my community.',
			'Personal Impact: Having learned about medical systems and software at VGH, I develped a greater interest in Software Engineering.',
		],
		buttonLabel: 'View Reccomendation Letter',
		image: '/assets/reco/vgh-reco.jpg',
		icon: <Heart className="w-6 h-6 text-primary" />,
	},
	{
		title: 'Math Tutor',
		organization: 'Vancouver Technical Secondary School',
		period: '2024 - 2026',
		highlights: ['Appointed by my school to tutor junior students in Math & Physics.'],
		icon: <GraduationCap className="w-6 h-6 text-primary" />,
	},
	{
		title: 'Chess Club President',
		organization: 'Vancouver Technical Secondary School',
		period: '2024 - Present',
		highlights: ['Current president; I supervise the space, and I manage tournaments & puzzles.'],
		icon: <Crown className="w-6 h-6 text-primary" />,
	},
];

const LeadershipComponent = memo(function Leadership() {
	const [selectedImage, setSelectedImage] = useState(null);

	return (
		<div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="flex flex-col items-center w-full max-w-7xl"
			>
				<motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-12">
					<h1 className="text-4xl sm:text-5xl font-bold text-center mb-4 flex items-center gap-4 text-foreground">
						<Users className="w-8 h-8 sm:w-11 sm:h-11 text-primary drop-shadow-sm" />
						Leadership & Volunteering
					</h1>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
					{LEADERSHIP_DATA.map((role, index) => (
						<motion.div
							key={index}
							variants={itemVariants}
							className={`bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow p-6 flex flex-col ${
								index === 0 ? 'lg:row-span-2' : ''
							}`}
						>
							<div className="flex items-center gap-4 mb-4">
								<div className="p-3 bg-primary/10 rounded-xl shrink-0">{role.icon}</div>
								<div>
									<h2 className="text-xl font-bold text-foreground leading-tight">{role.title}</h2>
									<p className="text-sm font-medium text-primary mt-1">{role.organization}</p>
								</div>
							</div>

							<div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
								<span className="bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
									{role.period}
								</span>
								{role.hours ? (
									<span className="bg-primary/5 text-primary px-2.5 py-1 rounded-full font-medium">
										{role.hours}
									</span>
								) : null}
							</div>

							<div className="flex-1">
								<ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mb-6">
									{role.highlights.map((item, i) => {
										const colonIndex = item.indexOf(':');
										if (colonIndex > 0) {
											return (
												<li key={i}>
													<strong className="text-foreground/90">
														{item.substring(0, colonIndex + 1)}
													</strong>
													{item.substring(colonIndex + 1)}
												</li>
											);
										}
										return <li key={i}>{item}</li>;
									})}
								</ul>
							</div>

							{role.buttonLabel ? (
								<div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
									<motion.button
										onClick={() => role.image && setSelectedImage(role.image)}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className={`w-fit inline-flex items-center justify-center whitespace-nowrap gap-2 px-4 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-bold shadow-sm text-sm border border-neutral-200 ${!role.image ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
										style={{ backgroundColor: 'white', color: 'black' }}
									>
										{role.buttonLabel}
										<ArrowUpRight className="w-4 h-4 shrink-0" />
									</motion.button>
								</div>
							) : null}
						</motion.div>
					))}
				</div>

				{/* <div className="w-full mt-16">
            		<GrowthTimeline />
        			</div> */}
			</motion.div>

			<AnimatePresence>
				{selectedImage && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setSelectedImage(null)}
						className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
					>
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.8, opacity: 0 }}
							transition={{ type: 'spring', damping: 25 }}
							onClick={(e) => e.stopPropagation()}
							className="relative max-w-4xl max-h-[90vh] w-full bg-white dark:bg-neutral-900 rounded-lg overflow-auto shadow-2xl"
						>
							<button
								onClick={() => setSelectedImage(null)}
								className="sticky top-4 right-4 float-right z-10 p-2 bg-white/90 dark:bg-neutral-800/90 rounded-full hover:bg-white dark:hover:bg-neutral-800 transition-colors cursor-pointer"
							>
								<X className="w-6 h-6" />
							</button>
							<img src={selectedImage} alt="Detail View" className="w-full h-auto" />
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
});

LeadershipComponent.displayName = 'Leadership';

export default LeadershipComponent;
