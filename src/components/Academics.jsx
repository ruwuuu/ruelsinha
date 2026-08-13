import React, { useState, memo } from 'react';
import { GraduationCap, NotebookPen, Award, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const AchievementCard = memo(({ achievement, onButtonClick, buttonLabel, certificates, onCertClick }) => {
	const {
		logo,
		alt,
		title,
		link,
		program,
		year,
		scorelabel0,
		score0,
		scorelabel1,
		score1,
		height = 10,
	} = achievement;

	const hasBottomContent = certificates && certificates.length > 0;

	return (
		<motion.div
			variants={itemVariants}
			className="bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow p-6 mb-6"
		>
			<div className="flex items-start gap-6">
				<div className="w-16 h-16 shrink-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shadow rounded-xl p-1 overflow-hidden">
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

				<div className="flex flex-col text-left gap-1 flex-1">
					<h3 className="text-lg sm:text-xl font-semibold text-foreground">{program}</h3>
					{title ? (
						<a
							href={link}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-primary hover:underline hover:text-foreground dark:hover:text-primary-foreground/70 font-medium transition-colors duration-200"
						>
							{title}
						</a>
					) : null}

					<div className="text-sm text-muted-foreground space-y-1">
						{year ? (
							<p>{year}</p>
						) : null}

						{score0 && Array.isArray(score0) ? (
							<div>
								{scorelabel0 ? (
									<div className="font-medium text-foreground/80 mb-1">{scorelabel0}:</div>
								) : null}
								<ul className="list-disc pl-5 space-y-1">
									{score0.map((item, i) => {
										const colonIndex = item.indexOf(':');
										if (colonIndex > 0) {
											return (
												<li key={i}>
													<strong>{item.substring(0, colonIndex)}</strong>
													{item.substring(colonIndex)}
												</li>
											);
										}
										return <li key={i}>{item}</li>;
									})}
								</ul>
							</div>
						) : scorelabel0 ? (
							<p>
								<span className="font-medium text-foreground/80">{scorelabel0}:</span> {score0}
							</p>
						) : null}

						{score1 && scorelabel1 ? (
							<p>
								<span className="font-medium text-foreground/80">{scorelabel1}:</span> {score1}
							</p>
						) : null}
					</div>
				</div>

				{onButtonClick && buttonLabel && (
					<div className="flex items-center">
						<motion.button
							onClick={onButtonClick}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-bold text-sm cursor-pointer border border-neutral-200 shadow-sm"
							style={{ backgroundColor: 'white', color: 'black' }}
						>
							{buttonLabel}
							<ArrowUpRight className="w-4 h-4 shrink-0" />
						</motion.button>
					</div>
				)}
			</div>

			{certificates && certificates.length > 0 && (
				<div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
					<div className="flex flex-wrap justify-center gap-3">
						{certificates.map((cert, i) => (
							<motion.button
								key={i}
								onClick={() => onCertClick(cert.src)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-bold text-sm cursor-pointer border border-neutral-200 shadow-sm"
								style={{ backgroundColor: 'white', color: 'black' }}
							>
								{cert.label}
								<ArrowUpRight className="w-4 h-4 shrink-0" />
							</motion.button>
						))}
					</div>
				</div>
			)}
		</motion.div>
	);
});
AchievementCard.displayName = 'AchievementCard';

const UW_DATA = {
	logo: '/assets/logos/University_of_Waterloo_Seal.jpg',
	alt: 'University of Waterloo Seal',
	title: 'University of Waterloo',
	link: 'https://uwaterloo.ca/',
	program: 'Honours Software Engineering, Co-op',
	year: 'September 2026 (incoming) – onwards',
	scorelabel0: 'Admission Average',
	score0: '99.67%',
};

const VANTECH_DATA = {
	logo: '/assets/logos/VanTech.jpg',
	alt: 'VanTech Logo',
	title: 'Vancouver Technical Secondary School',
	link: 'https://www.vsb.bc.ca/vancouver-technical',
	program: 'Summit Mini School Accelerated Program',
	year: 'Sept 2021 – June 2026',
	scorelabel0: '100% in all of',
	score0: 'AP Calculus, AP Statistics, Pre-Calculus 12, Chemistry 12, Physics 12',
};

const SAT_DATA = {
	logo: '/assets/logos/college_board.png',
	alt: 'College Board Logo',
	title: 'College Board',
	program: 'SAT',
	year: 'August 2025',
	scorelabel0: 'Total Score',
	score0: '1570',
	scorelabel1: 'Section Scores',
	score1: 'Math: 790; Reading & Writing: 780',
};

const AP_DATA = {
	logo: '/assets/logos/college_board.png',
	alt: 'College Board Logo',
	title: 'College Board',
	program: 'AP Exams',
	year: '2025 - 2026',
	scorelabel0: '5/5 in',
	score0: 'AP Physics C: Mechanics, AP Physics C: Electricity & Magnetism',
	scorelabel1: 'Scores pending',
	score1: 'AP Calculus BC, AP Statistics, AP Literature & Composition, AP Computer Science A',
};

const MATH_DATA = {
	logo: '/assets/logos/math.png',
	alt: 'Math Icon',
	title: 'CEMC, University of Waterloo',
	program: 'Mathematics Competitions',
	score0: [
		'Fryer Contest 2023: 2nd Place',
		'Cayley Contest 2024: Top 150',
		'Fermat Contest 2025: Top 300',
		'Euclid, Hypatia, Pascal, Galois contests: 1st in School & consistent top percentile performance.',
	],
};

const MATH_CERTIFICATES = [
	{ src: '/assets/certs/Math/Fryer 2023.jpg', label: 'Fryer (2023)' },
	{ src: '/assets/certs/Math/Pascal 2023.jpg', label: 'Pascal (2023)' },
	{ src: '/assets/certs/Math/Cayley - 2024.jpg', label: 'Cayley (2024)' },
	{ src: '/assets/certs/Math/Fermat - 2025.jpg', label: 'Fermat (2025)' },
	{ src: '/assets/certs/Math/Hypatia - 2025.jpg', label: 'Hypatia (2025)' },
	{ src: '/assets/certs/Math/Euclid - 2025.jpg', label: 'Euclid (2025)' },
];

const AcademicsComponent = memo(function Academics() {
	const [selectedCert, setSelectedCert] = useState(null);

	return (
		<div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 mt-2">
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

				<div className="w-full max-w-3xl flex flex-col gap-4 mb-12">
					<AchievementCard achievement={UW_DATA} />
					<AchievementCard achievement={VANTECH_DATA} />

					<motion.div variants={itemVariants} className="w-full my-12">
						<div className="h-px bg-white/30 dark:bg-white/20"></div>
					</motion.div>
				</div>

				<motion.div variants={itemVariants} className="flex flex-col items-center text-center">
					<h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 flex items-center gap-4 text-foreground">
						<Award className="w-6 h-6 sm:w-9 sm:h-9 text-primary drop-shadow-sm" />
						Exams & Contests
					</h1>
				</motion.div>

				<div className="w-full max-w-3xl flex flex-col gap-4">
					<AchievementCard achievement={SAT_DATA} />
					<AchievementCard achievement={AP_DATA} />
					<AchievementCard achievement={MATH_DATA} onCertClick={setSelectedCert} />
				</div>
			</motion.div>

			<AnimatePresence>
				{selectedCert && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setSelectedCert(null)}
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
								onClick={() => setSelectedCert(null)}
								className="sticky top-4 right-4 float-right z-10 p-2 bg-white/90 dark:bg-neutral-800/90 rounded-full hover:bg-white dark:hover:bg-neutral-800 transition-colors cursor-pointer"
							>
								<X className="w-6 h-6" />
							</button>
							<img src={selectedCert} alt="Certificate" className="w-full h-auto" />
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
});

AcademicsComponent.displayName = 'Academics';

export default AcademicsComponent;
