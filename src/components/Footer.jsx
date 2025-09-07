import { Github, Linkedin, Mail } from 'lucide-react';
import { memo } from 'react';

// Social links data outside the component for efficiency
const socialLinks = [
	{
		href: 'https://github.com/ruwuuu',
		icon: Github,
		title: 'GitHub',
	},
	{
		href: 'https://www.linkedin.com/in/ruel-sinha-21534a331/',
		icon: Linkedin,
		title: 'LinkedIn',
	},
	{
		// href: '',
		icon: Mail,
		title: 'Email',
	},
];

const Footer = memo(() => {
	return (
		<footer className="w-full bg-muted/30 border-t border-border pt-8 pb-10 mt-32">
			<div className="max-w-5xl mx-auto px-4 sm:px-8 flex flex-col items-center text-center gap-5">
				<div className="text-sm text-muted-foreground">© 2025 Ruel Sinha. All rights reserved.</div>
				<div className="flex justify-center gap-6">
					{socialLinks.map(({ href, title, icon: Icon }) => (
						<a
							key={title}
							href={href}
							title={title}
							aria-label={title}
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
						>
							<Icon className="w-5 h-5 sm:w-6 sm:h-6" />
						</a>
					))}
				</div>
			</div>
		</footer>
	);
});

Footer.displayName = 'Footer';

export default Footer;
