import { Github, Mail, FileText, GraduationCap, Phone, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, memo } from 'react';

// useless rn
const SocialLink = memo(({ href, icon, title, label, className }) => (
	<a
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		className={className}
		title={title}
	>
		{icon}
		{label ? <span className="hidden sm:inline">{label}</span> : null}
	</a>
));
SocialLink.displayName = 'SocialLink';

// useless rn
const Tag = memo(({ tag }) => (
	<span className="rounded-full border border-neutral-300 bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
		{tag}
	</span>
));
Tag.displayName = 'Tag';

const SOCIAL_LINKS = [];
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
					className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-600 transition duration-150 hover:scale-[1.05] hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
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
			className="w-full flex flex-col items-start justify-start"
		>
			<div className="mx-auto w-full max-w-280 gap-8 px-4 pb-4 pt-8 md:grid md:grid-cols-2 md:items-start">
				<div className="flex flex-col items-center md:justify-start md:self-start">
					<img
						src="/assets/ruel-sinha-resume-2026.jpg"
						alt="Ruel Sinha"
						className="w-full rounded-xl object-cover shadow-sm"
					/>
				</div>

				<div className="ml-2 flex flex-col gap-8">
					<motion.div
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						className="flex flex-1 flex-col items-center md:items-start"
					>
						<div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-200/50 px-4 py-2 select-none dark:border-neutral-700 dark:bg-neutral-900/80">
							<div className="h-2 w-2 animate-pulse rounded-full bg-neutral-900 dark:bg-neutral-100" />
							<span className="text-base font-semibold uppercase tracking-[0.05em] text-neutral-900 dark:text-neutral-100">
								About Me
							</span>
						</div>

						<h1 className="mb-3 text-center text-2xl font-bold leading-tight text-neutral-900 md:text-left md:text-[1.75rem] dark:text-neutral-50">
							Hi, I'm <span className="bg-linear-to-r from-neutral-900 via-neutral-700 to-neutral-500 bg-clip-text text-transparent dark:from-white dark:via-[#dacec4] dark:to-[#bdaea2]">Ruel Sinha</span>
						</h1>

						<div className="mb-2 flex items-center justify-center gap-2 text-[0.9rem] leading-5 text-neutral-500 md:justify-start">
							<GraduationCap className="h-4 w-4" />
							<a href="https://uwaterloo.ca/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 dark:hover:text-neutral-200">
								University of Waterloo
							</a>
						</div>

						<p className="mb-2 max-w-184 text-center text-base leading-7 text-neutral-500 md:text-left md:text-lg dark:text-neutral-400">
							I’m an incoming student at the University of Waterloo for
							<span className="font-medium text-neutral-900 dark:text-neutral-50"> Honours Software Engineering, Co-op</span>.
						</p>

						<div className="mt-2 flex flex-wrap justify-center gap-4 md:justify-start">{socialLinksElements}</div>
						<div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">{tagElements}</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						className="flex flex-1 flex-col items-center md:items-start"
					>
						<div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-200/50 px-4 py-2 select-none dark:border-neutral-700 dark:bg-neutral-900/80">
							<div className="h-2 w-2 animate-pulse rounded-full bg-neutral-900 dark:bg-neutral-100" />
							<span className="text-base font-semibold uppercase tracking-[0.05em] text-neutral-900 dark:text-neutral-100">
								Career Vision
							</span>
						</div>

						<p className="max-w-184 text-center text-base leading-7 text-neutral-500 md:text-left md:text-lg dark:text-neutral-400">
							I want to combine foundations in Programming, Mathematics, and Engineering to innovate software and devices that progress the world around us.
						</p>
						<div className="mt-4">
							<a
								href="/assets/ruel-sinha-resume-2026.pdf"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-base font-bold text-black shadow-sm transition hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
							>
								<FileText className="h-5 w-5 shrink-0" />
								<span>Resume</span>
								<ArrowUpRight className="h-5 w-5 shrink-0" />
							</a>
						</div>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
});
