import { Github, Linkedin, Mail, FileText, GraduationCap, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import React, { useMemo, memo } from 'react';
import './Volunteering.css';

// Memoized social link component
const SocialLink = memo(({ href, icon, title, label, className }) => (
	<a href={href} target="_blank" rel="noopener noreferrer" className={className} title={title}>
		{icon}
		{label ? <span className="hidden sm:inline">{label}</span> : null}
	</a>
));
SocialLink.displayName = 'SocialLink';

const SOCIAL_LINKS = [
	{
		// href: 'mailto:---',
		icon: <Mail className="w-5 h-5" />,
		title: 'Email',
		label: '',
	},
	{
		//href: 'tel:---',
		icon: <Phone className="w-5 h-5" />,
		title: 'Phone',
		label: '',
	},
];

// child component
const HighlightItem = React.memo(({ item }) => (
	<motion.li>
		<a className="text-primary hover:underline dark:hover:text-primary-foreground/70 font-medium transition">
			{item.text}
		</a>
		{item.rest}
	</motion.li>
));
HighlightItem.displayName = 'HighlightItem';

export default memo(function volunteering() {
	const socialLinksElements = useMemo(
		() =>
			SOCIAL_LINKS.map(({ href, icon, title, label }) => (
				<SocialLink
					key={title}
					href={href}
					icon={icon}
					title={title}
					label={label}
					className="volunteer-social-link"
				/>
			)),
		[]
	);

	const highlights = useMemo(
		() => [
			{
				text: 'Medical Education Partnership:',
				rest: ' Served as simulated patient for UBC medical students in clinical skills training scenarios',
			},
			{
				text: 'Healthcare System Impact:',
				rest: ' Contributed to training future doctors who will serve thousands of patients throughout their careers',
			},
			{
				text: 'Clinical Exposure:',
				rest: ' Gained understanding of medical workflows, diagnostic procedures, and opportunities for improved technology integration',
			},
		],
		[]
	);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}
			className="volunteer-container"
		>
			<div className="volunteer-content-wrapper">
				<motion.div
					initial={{ opacity: 0, x: -40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className="volunteer-profile-image"
					tabIndex={0}
				>
					<img
						src=""
						alt=""
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
					className="volunteer-content"
				>
					<div className="volunteer-badge">
						<div className="volunteer-badge-dot" />
						<span className="volunteer-badge-text">My experience</span>
					</div>

					<h1 className="volunteer-title">
						<span className="volunteer-title-gradient">Volunteer Patient</span>
					</h1>

					<div className="volunteer-subtitle">
						<GraduationCap className="w-4 h-4" />
						<span
						// href=""
						>
							VGH with Faculty of Medicine at UBC
						</span>
					</div>

					<p className="volunteer-description"> This experience strengthened my interest in Software/Electrical Engineering </p>

					<div className="bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow p-7 mb-7 mt-6">
						<h3 className="text-xl font-semibold text-foreground mb-4">Highlights</h3>
						<p className="text-base text-muted-foreground mb-4">
							<a
								href=""
								className="text-primary hover:underline dark:hover:text-primary-foreground/70 transition font-medium"
								target="_blank"
								rel="noopener noreferrer"
							>
								Volunteer Simulation Patient | 2021 - Present | 350+ Hours
							</a>
						</p>
						<motion.ul className="list-disc ml-5 space-y-2 text-base text-muted-foreground">
							{highlights.map((item, index) => (
								<HighlightItem key={index} item={item} />
							))}
						</motion.ul>
					</div>

					<div className="volunteer-links-container">
						{socialLinksElements}
						<a
							// href=""
							target="_blank"
							rel="noopener noreferrer"
							className="volunteer-resume-link"
						>
							<FileText className="w-5 h-5" />
							Reference Letter
						</a>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
});
