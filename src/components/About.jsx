import { Github, Mail, FileText, GraduationCap, Phone, Music2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, memo } from 'react';
import './About.css';

// Memoized social link component
const SocialLink = memo(({ href, icon, title, label, className }) => (
	<a href={href} target="_blank" rel="noopener noreferrer" className={className} title={title}>
		{icon}
		{label ? <span className="hidden sm:inline">{label}</span> : null}
	</a>
));
SocialLink.displayName = 'SocialLink';

// Memoized tag component
const Tag = memo(({ tag }) => <span className="about-tag">{tag}</span>);
Tag.displayName = 'Tag';

const SOCIAL_LINKS = [
	{
		href: 'https://github.com/ruwuuu',
		icon: <Github className="w-5 h-5" />,
		title: 'GitHub',
	},
	{
		icon: <Mail className="w-5 h-5" />,
		title: 'Email',
		label: 'ruel.sinha.can@gmail.com',
	},
	{
		icon: <Phone className="w-5 h-5" />,
		title: 'Phone',
		label: '+1 (236) 512-****',
	},
];

const TAGS = [];

export default memo(function About() {
	const socialLinksElements = useMemo(
		() =>
			SOCIAL_LINKS.map(({ href, icon, title, label }) => (
				<SocialLink
					key={title}
					href={href}
					icon={icon}
					title={title}
					label={label}
					className="about-social-link"
				/>
			)),
		[],
	);

	const tagElements = useMemo(() => TAGS.map((tag) => <Tag key={tag} tag={tag} />), []);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}
			className="about-container"
		>
			<div className="about-content-wrapper grid gap-1 md:gap-2 md:grid-cols-2 items-start">
				<div className="about-left flex flex-col items-center md:justify-start md:self-start">
					<img
						src="/assets/ruel-sinha-resume-2026.jpg"
					/>

					{/*		IMAGE
					<motion.div
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="about-profile-image w-56 h-56 md:w-64 md:h-64 mx-auto"
						tabIndex={0}
						aria-label="Profile photo of Ruel Sinha"
					>
						<img
							src="/assets/Ruel-1-min.jpg"
							alt="Ruel Sinha"
							loading="lazy"
							decoding="async"
							className="object-cover w-full h-full rounded-lg"
							style={{ aspectRatio: '1/1' }}
						/>
					</motion.div> */}

					{/*		RESUME BUTTON (replaced with pdf viewer)
					<div className="mt-4">
						<a
							href="/assets/ruel-sinha-resume-2026.pdf"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center whitespace-nowrap gap-2 px-6 py-3 bg-white text-black! rounded-lg hover:bg-gray-200 transition-colors font-bold shadow-sm text-sm border border-neutral-200 cursor-pointer"
							style={{ backgroundColor: 'white', color: 'black' }}
						>
							<FileText className="w-4 h-4 shrink-0" />
							<span>Resume</span>
							<ArrowUpRight className="w-4 h-4 shrink-0" />
						</a>
					</div> */}
				</div>

				<div className="flex flex-col gap-8 ml-2">
					<motion.div
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						className="about-content"
					>
						<div className="about-badge">
							<div className="about-badge-dot" />
							<span className="about-badge-text">About Me</span>
						</div>

						<h1 className="about-title text-2xl md:text-xl">
							Hi, I'm <span className="about-title-gradient">Ruel Sinha</span>
						</h1>

						<div className="about-subtitle">
							<GraduationCap className="w-4 h-4" />
							<a href="https://uwaterloo.ca/" target="_blank" rel="noopener noreferrer">
								University of Waterloo
							</a>
						</div>

						<p className="about-description">
							I’m an incoming student at the University of Waterloo for
							<span className="about-description-highlight"> Honours Software Engineering, Co-op</span>.
						</p>

						<div className="about-tags-container">{tagElements}</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						className="about-content"
					>
						<div className="about-badge">
							<div className="about-badge-dot" />
							<span className="about-badge-text">CAREER VISION &amp; GOALS</span>
						</div>

						<p className="about-description">
							<span className="about-description-highlight">Tech Innovation:</span> I want to combine
							foundations in Programming, Mathematics, and Engineering to innovate software and devices
							that progress the world around us.
						</p>
						<div className="about-tags-container">{tagElements}</div>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
});
