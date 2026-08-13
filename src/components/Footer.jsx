import { Github, Linkedin, Mail, Phone, FileText, ArrowUpRight } from 'lucide-react';
import { memo } from 'react';

const socialLinks = [
	{
		icon: Mail,
		title: 'Email',
		label: 'ruel.sinha.can@gmail.com',
		isStatic: true,
		href: 'mailto:ruel.sinha.can@gmail.com'
	},
	{
		icon: Phone,
		title: 'Phone',
		label: '+1 (236) 512-****',
		isStatic: true,
		href: "tel:+12365125602"
	},
];

const Footer = memo(() => {
	return (
		<footer className="w-full bg-muted/30 border-t border-border pt-8 pb-10 mt-32">
			<div className="max-w-5xl mx-auto px-4 sm:px-8 flex flex-col items-center text-center gap-5">
				<div className="text-sm text-muted-foreground">© 2026 Ruel Sinha. All rights reserved.</div>
				<div className="flex justify-center gap-6">
					{socialLinks.map(({ href, title, icon: Icon, label, isStatic }) =>
						isStatic ? (
							<div key={title} className="flex items-center text-muted-foreground">
								<Icon className="w-5 h-5 sm:w-6 sm:h-6" />
								<span className="ml-2 hidden sm:inline">{label}</span>
							</div>
						) : (
							<a
								key={title}
								href={href}
								title={title}
								aria-label={title}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
							>
								<Icon className="w-5 h-5 sm:w-6 sm:h-6" />
								<span className="ml-2 hidden sm:inline">{label}</span>
							</a>
						),
					)}
					<a
						href="/assets/ruel-sinha-resume-2026.pdf"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
					>
						<FileText className="w-5 h-5 sm:w-6 sm:h-6" />
						<span className="ml-2 hidden sm:inline">Resume</span>
					</a>
					{/* <a
						href="https://www.linkedin.com/in/ruel-sinha-21534a331"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
						title="LinkedIn"
						aria-label="LinkedIn"
					>
						<Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
						<span className="ml-2 hidden sm:inline">LinkedIn</span>
					</a> */}
				</div>
			</div>
		</footer>
	);
});

Footer.displayName = 'Footer';

export default Footer;
