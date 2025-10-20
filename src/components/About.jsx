import { Github, Linkedin, Mail, FileText, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, memo } from 'react';
import './About.css';

// Memoized social link component
const SocialLink = memo(({ href, icon, title, className }) => (
	<a href={href} target="_blank" rel="noopener noreferrer" className={className} title={title}>
		{icon}
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
		href: 'https://www.linkedin.com/in/ruel-sinha-21534a331/',
		icon: <Linkedin className="w-5 h-5" />,
		title: 'LinkedIn',
	},
	{
		// href: '',
		icon: <Mail className="w-5 h-5" />,
		title: 'Email',
	},
];

const TAGS = [];

const RESUME_URL = 'https://drive.google.com/file/d/19dJEXSdV6Hl-SLv21ZaYD5H97sucgUZp/view?usp=sharing';

export default memo(function About() {
	const socialLinksElements = useMemo(
		() =>
			SOCIAL_LINKS.map(({ href, icon, title }) => (
				<SocialLink key={title} href={href} icon={icon} title={title} className="about-social-link" />
			)),
		[]
	);

	const tagElements = useMemo(() => TAGS.map((tag) => <Tag key={tag} tag={tag} />), []);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}
			className="about-container"
		>
			<div className="about-content-wrapper">
				<motion.div
					initial={{ opacity: 0, x: -40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className="about-profile-image"
					tabIndex={0}
					aria-label="Profile photo of Ruel Sinha"
				>
					<img
						src="public\assets\Ruel-1-min.jpg"
						alt="Ruel Sinha"
						loading="lazy"
						decoding="async"
						className="object-cover w-full h-full"
						style={{ aspectRatio: '1/1' }}
					/>
				</motion.div>

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

					<h1 className="about-title">
						Hi, I'm <span className="about-title-gradient">Ruel Sinha</span>
					</h1>

					<div className="about-subtitle">
						<GraduationCap className="w-4 h-4" />
						<span>Vancouver Technical</span>
					</div>

					<p className="about-description">
						I'm a student with a strong passion in{' '}
						<span className="about-description-highlight">Software Engineering </span>
						and
						<span className="about-description-highlight"> Electrical Engineering</span> 
						. 
					</p>
					<p className="about-description">
						I want to use engineering to make an impact on the world and community around me
					</p>

					<div className="about-tags-container">{tagElements}</div>

					<div className="about-links-container">
						{socialLinksElements}
						<a /* href={RESUME_URL} */ target="_blank" rel="noopener noreferrer" className="about-resume-link">
							<FileText className="w-4 h-4" />
							Resume
						</a>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
});
