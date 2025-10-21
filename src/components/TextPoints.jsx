import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// --- Animation Variants (The "Staggered Entrance" Pattern) ---
// Master container for the entire section
const sectionContainerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.15 },
	},
};

// Nested container for lists/grids inside the section
const listContainerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.1 },
	},
};

// Single variant for all items that animate in
const itemVariants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: 'easeOut' },
	},
};

// --- Child Components (Unchanged) ---
const HighlightItem = React.memo(({ item }) => (
	<motion.li variants={itemVariants}>
		{item.text}
		<a
			href={item.href}
			target="_blank"
			rel="noopener noreferrer"
			className="text-primary hover:underline dark:hover:text-primary-foreground/70 font-medium transition"
		>
			{item.linkText}
		</a>
		{item.rest}
	</motion.li>
));
HighlightItem.displayName = 'HighlightItem';

// --- Main Component ---
function TextPoints() {
	const highlights = useMemo(() => [{ text: 'text; ', linkText: 'linktext;', href: '', rest: ' rest' }], []);

	return (
		<div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
			<motion.div
				variants={sectionContainerVariants}
				initial="hidden"
				animate="visible"
				className="flex flex-col items-center w-full space-y-16"
			>
				<motion.div variants={itemVariants} className="w-full max-w-3xl">
					<div className="bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow p-6">
						<h3 className="text-xl font-semibold text-foreground mb-4">Key Highlights</h3>
						<p className="text-base text-muted-foreground mb-4">
							<a
								href=""
								className="text-primary hover:underline dark:hover:text-primary-foreground/70 transition font-medium"
								target="_blank"
								rel="noopener noreferrer"
							>
								text
							</a>
						</p>
						<motion.ul
							variants={listContainerVariants}
							className="list-disc ml-5 space-y-2 text-base text-muted-foreground"
						>
							{highlights.map((item, index) => (
								<HighlightItem key={index} item={item} />
							))}
						</motion.ul>
					</div>
				</motion.div>
			</motion.div>
		</div>
	);
}

export default React.memo(TextPoints);
