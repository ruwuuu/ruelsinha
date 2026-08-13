import React, { useState, memo } from 'react';
import { Music2, X, ChevronLeft, ChevronRight, ExternalLink, ArrowUpRight } from 'lucide-react';
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

const MusicSection = memo(({ title, instruments, items, certificates, onCertClick }) => (
	<motion.div
		variants={itemVariants}
		className="rounded-2xl bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 shadow p-6"
	>
		<div className="flex w-full">
			<h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
			<div className="items-center gap-1.5 px-3 py-1 font-bold tracking-wide mb-3 text-sm text-amber-900 dark:text-amber-200 ml-auto">
				<span className="inline-flex bg-amber-50 dark:bg-amber-900/20 border border-amber-400 rounded-full px-2 py-0.5 m-1">
					Piano
				</span>
				<span className="inline-flex bg-amber-50 dark:bg-amber-900/20 border border-amber-400 rounded-full px-2 py-0.5 m-1">
					Trombone
				</span>
				<span className="inline-flex bg-amber-50 dark:bg-amber-900/20 border border-amber-400 rounded-full px-2 py-0.5 m-1">
					Viola
				</span>
			</div>
		</div>
		
		<ul className="list-disc pl-5 space-y-2 text-muted-foreground">
			{items.map((item, i) => {
				const itemText = typeof item === 'string' ? item : item.text;
				const itemLinks = typeof item === 'object' ? item.links : null;
				const colonIndex = itemText.indexOf(':');

				if (itemLinks) {
					return (
						<li key={i}>
							<div className="flex items-start gap-2">
								<span className="flex-1">
									<strong>{itemText.substring(0, colonIndex)}</strong>
									{itemText.substring(colonIndex)}
								</span>
								<span className="flex gap-2 shrink-0"></span>
							</div>
						</li>
					);
				}

				if (colonIndex > 0) {
					return (
						<li key={i}>
							<strong>{itemText.substring(0, colonIndex)}</strong>
							{itemText.substring(colonIndex)}
						</li>
					);
				}
				return <li key={i}>{itemText}</li>;
			})}
		</ul>
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
						>
							{cert.label}
							<ArrowUpRight className="w-4 h-4 shrink-0" />
						</motion.button>
					))}
				</div>
			</div>
		)}
	</motion.div>
));
MusicSection.displayName = 'MusicSection';

const VideoCard = memo(({ videoId, title }) => (
	<div className="rounded-xl bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 shadow overflow-hidden">
		<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
			<iframe
				className="absolute top-0 left-0 w-full h-full"
				src={`https://www.youtube.com/embed/${videoId}`}
				title={title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			/>
		</div>
	</div>
));
VideoCard.displayName = 'VideoCard';

const VideoSection = memo(({ instrument, videos }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [[page, direction], setPage] = useState([0, 0]);
	const [isDragging, setIsDragging] = useState(false);
	const videosPerPage = 4;
	const totalPages = Math.ceil(videos.length / videosPerPage);
	const showCarousel = videos.length > 4;

	const paginate = (newDirection) => {
		const newIndex = currentIndex + newDirection;
		if (newIndex >= 0 && newIndex < totalPages) {
			setCurrentIndex(newIndex);
			setPage([newIndex, newDirection]);
		}
	};

	const nextSlide = () => paginate(1);
	const prevSlide = () => paginate(-1);

	const currentVideos = videos.slice(
		currentIndex * videosPerPage,
		Math.min((currentIndex + 1) * videosPerPage, videos.length),
	);

	if (!showCarousel) {
		return (
			<motion.div variants={itemVariants} className="w-full">
				<h3 className="text-2xl font-semibold text-foreground mb-4">{instrument}</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{videos.map((video) => (
						<div
							key={video.id}
							className="rounded-xl bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 shadow overflow-hidden"
						>
							<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
								<iframe
									className="absolute top-0 left-0 w-full h-full"
									src={`https://www.youtube.com/embed/${video.id}`}
									title={video.title}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
								/>
							</div>
						</div>
					))}
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div variants={itemVariants} className="w-full">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-2xl font-semibold text-foreground">{instrument}</h3>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						{currentIndex + 1} / {totalPages}
					</span>
					<button
						onClick={prevSlide}
						disabled={currentIndex === 0}
						className="p-2 rounded-full bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						aria-label="Previous videos"
					>
						<ChevronLeft className="w-5 h-5" />
					</button>
					<button
						onClick={nextSlide}
						disabled={currentIndex === totalPages - 1}
						className="p-2 rounded-full bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						aria-label="Next videos"
					>
						<ChevronRight className="w-5 h-5" />
					</button>
				</div>
			</div>
			<div className="relative overflow-hidden" style={{ touchAction: 'pan-y' }}>
				<AnimatePresence initial={false} custom={direction}>
					<motion.div
						key={currentIndex}
						custom={direction}
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						dragElastic={0.2}
						onDragStart={() => setIsDragging(true)}
						onDragEnd={(e, { offset, velocity }) => {
							setIsDragging(false);
							const swipe = Math.abs(offset.x) * velocity.x;
							if (swipe < -500 || offset.x < -100) {
								paginate(1);
							} else if (swipe > 500 || offset.x > 100) {
								paginate(-1);
							}
						}}
						initial={{ x: direction > 0 ? 1000 : -1000, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: direction < 0 ? 1000 : -1000, opacity: 0 }}
						transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
						className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
					>
						{isDragging && <div className="absolute inset-0 z-10" />}
						{currentVideos.map((video) => (
							<VideoCard key={video.id} videoId={video.id} title={video.title} />
						))}
					</motion.div>
				</AnimatePresence>
			</div>
		</motion.div>
	);
});
VideoSection.displayName = 'VideoSection';

const VIDEO_DATA = [
	{
		instrument: 'Viola',
		videos: [
			{ id: 'VfyGz8qMKKY', title: 'Strings Performance' },
			{ id: 'DgQMnKGY11k', title: 'Strings Performance' },
			{ id: 'MTGSLDGjelo', title: 'Strings Performance' },
			{ id: 'UnKShjLkYxM', title: 'Strings Performance' },
			{ id: 'RAwwGKC_rm4', title: 'Strings Performance' },
			{ id: 'assBEaWDncw', title: 'Strings Performance' },
			{ id: 'Fm9XCTGxAus', title: 'Strings Performance' },
			{ id: 'W3q31xQzz0o', title: 'Strings Performance' },
			{ id: 'Kicxaie9gHs', title: 'Strings Performance' },
		],
	},
	{
		instrument: 'Trombone',
		videos: [
			{ id: 'paTO-4uLxbg', title: 'Trombone Performance' },
			{ id: '300-PbgokkU', title: 'Trombone Performance' },
			{ id: 'VM7pkzw86xs', title: 'Trombone Performance' },
			{ id: '2bGKn0zpKF0', title: 'Trombone Performance' },
			{ id: 'viKnyasxeD8', title: 'Trombone Performance' },
			{ id: 'fxdqxb5m5SA', title: 'Trombone Performance' },
		],
	},
	{
		instrument: 'Piano',
		videos: [
			{ id: 'NOfVVBp2a0I', title: 'Piano Performance' },
			{ id: 'YwpU26PrDLc', title: 'Piano Performance' },
		],
	},
];

const MUSIC_DATA = {
	title: 'Musical Achievements',
	items: [
		'School Jazz Band - Principal Trombonist: Help junior students develop musical technique and theory',
		"School Orchestra: 'Outstanding Achievement' award",
		{
			text: "Royal Conservatory of Music: Pursuing Piano Level 6",
			links: [
				{ url: 'https://www.instagram.com/p/DP-PE8egcTV/?igsh=ajFvYnYzdHY3aG5t', label: 'Instagram' },
				{ url: 'https://www.facebook.com/share/p/1YhbritXBP/', label: 'Facebook' },
			],
		},
		'District Honour Band (2023, 2024)',
		'BC Provincial Honour Orchestra (2024, 2025)',
	],
};

const CERTIFICATES_BOX1 = [
	{ src: '/assets/certs/Music/piano-level-4.jpg', label: 'Piano Level 4' },
	{ src: '/assets/certs/Music/String-2025.jpg', label: 'Senior Strings' },
	{ src: '/assets/certs/Music/band-section-leader-2023.jpg', label: 'Band Section Leader' },
];

const MusicComponent = memo(function Music() {
	const [selectedCert, setSelectedCert] = useState(null);

	return (
		<div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="flex flex-col items-center w-full"
			>
				<motion.div variants={itemVariants} className="flex flex-col items-center text-center">
					<h1 className="text-4xl sm:text-5xl font-bold text-center mb-4 flex items-center gap-4 text-foreground">
						<Music2 className="w-8 h-8 sm:w-11 sm:h-11 text-primary drop-shadow-sm" />
						Music Experience & Achievements
					</h1>
					<a
						href="http://www.vtmusic.ca"
						target="_blank"
						rel="noopener noreferrer"
						className="text-lg text-primary hover:underline mb-10"
					>
						www.vtmusic.ca
					</a>
				</motion.div>

				<div className="w-full max-w-3xl flex flex-col gap-6 mb-12">
					<MusicSection
						key={MUSIC_DATA.title}
						title={MUSIC_DATA.title}
						items={MUSIC_DATA.items}
						certificates={CERTIFICATES_BOX1}
						onCertClick={setSelectedCert}
					/>
				</div>

				<motion.div variants={itemVariants} className="w-full max-w-3xl my-12">
					<div className="h-px bg-white/30 dark:bg-white/20"></div>
				</motion.div>

				<motion.div
					variants={itemVariants}
					className="flex flex-col items-center text-center mb-8"
					id="performance-videos"
				>
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground">Performance Videos</h2>
				</motion.div>

				<div className="w-full max-w-5xl flex flex-col gap-8">
					{VIDEO_DATA.map((section, index) => (
						<React.Fragment key={section.instrument}>
							<VideoSection instrument={section.instrument} videos={section.videos} />
							{index < VIDEO_DATA.length - 1 && (
								<motion.div variants={itemVariants} className="w-full">
									<div className="h-px bg-white/30 dark:bg-white/20"></div>
								</motion.div>
							)}
						</React.Fragment>
					))}
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
							<img
								src={selectedCert}
								alt="Certificate"
								className="w-full h-auto"
								style={
									selectedCert.includes('junior-string-2023.jpg')
										? { transform: 'rotate(-90deg)' }
										: {}
								}
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
});

MusicComponent.displayName = 'Music';

export default MusicComponent;
