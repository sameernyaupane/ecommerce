import { Link } from "@remix-run/react";

const Footer = () => {
	return (
		<footer className="w-full mt-12 border-t bg-background dark:bg-muted/5 text-card-foreground">
			<div className="border-b border-muted/50 dark:border-muted/10">
				<div className="container max-w-7xl">
					<div className="flex flex-col mx-auto md:items-start lg:items-start md:flex-row py-16">
						<div className="flex-shrink-0 w-64 mx-auto text-center md:mx-0 md:text-left">
							<Link to="/" className="flex items-center justify-center font-medium title-font md:justify-start">
								INDIBE
							</Link>
							<p className="mt-2 text-sm text-muted-foreground">
								Empowering Indie Beauty Creators
							</p>
							<div className="mt-4">
								<span className="inline-flex justify-center mt-2 sm:ml-auto sm:mt-0 sm:justify-start gap-3">
									<a className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">
										<svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
											className="w-5 h-5" viewBox="0 0 24 24">
											<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
										</svg>
									</a>
									<a className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">
										<svg fill="currentColor" stroke="currentColor" strokeLinecap="round"
											strokeLinejoin="round" strokeWidth="0" className="w-5 h-5" viewBox="0 0 24 24">
											<path stroke="none"
												d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z">
											</path>
											<circle cx="4" cy="4" r="2" stroke="none"></circle>
										</svg>
									</a>
								</span>
							</div>
						</div>

						<div className="flex flex-col flex-grow mt-10 -mb-10 text-center md:pl-8 md:mt-0 md:text-left md:ml-auto lg:flex-row lg:justify-end">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[120px_200px_200px_120px] gap-10">
								<div className="w-[200px] mx-auto lg:w-[120px]">
									<h2 className="mb-3 text-sm font-medium tracking-widest text-foreground uppercase title-font">About</h2>
									<nav className="mb-10 list-none">
										<li className="mt-3">
											<Link to="/about-us" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">About Us</Link>
										</li>
										<li className="mt-3">
											<Link to="/sell-with-us" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Sell With Us</Link>
										</li>
										<li className="mt-3">
											<Link to="/stores" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Stores</Link>
										</li>
									</nav>
								</div>

								<div className="w-[200px] mx-auto lg:w-[200px]">
									<h2 className="mb-3 text-sm font-medium tracking-widest text-foreground uppercase title-font">Information</h2>
									<nav className="mb-10 list-none">
										<li className="mt-3">
											<Link to="/general-guidance" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">General Guidance</Link>
										</li>
										<li className="mt-3">
											<Link to="/help-centre" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Help Centre</Link>
										</li>
										<li className="mt-3">
											<Link to="/blog" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Blog</Link>
										</li>
										<li className="mt-3">
											<Link to="/faqs" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">F.A.Qs</Link>
										</li>
										<li className="mt-3">
											<Link to="/shipping" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Shipping</Link>
										</li>
										<li className="mt-3">
											<Link to="/returns" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Returns</Link>
										</li>
										<li className="mt-3">
											<Link to="/secure-payment" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Secure Payment</Link>
										</li>
									</nav>
								</div>

								<div className="w-[200px] mx-auto lg:w-[200px]">
									<h2 className="mb-3 text-sm font-medium tracking-widest text-foreground uppercase title-font">Policies</h2>
									<nav className="mb-10 list-none">
										<li className="mt-3">
											<Link to="/website-terms-conditions" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Website Terms & Conditions</Link>
										</li>
										<li className="mt-3">
											<Link to="/seller-terms-conditions" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Seller Terms & Conditions</Link>
										</li>
										<li className="mt-3">
											<Link to="/fees-policy" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Fees Policy</Link>
										</li>
										<li className="mt-3">
											<Link to="/cookies-policy" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Cookies Policy</Link>
										</li>
										<li className="mt-3">
											<Link to="/privacy-policy" className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">Privacy Policy</Link>
										</li>
									</nav>
								</div>

								<div className="w-[200px] mx-auto lg:w-[120px]">
									<h2 className="mb-3 text-sm font-medium tracking-widest text-foreground uppercase title-font">Contact</h2>
									<nav className="mb-10 list-none">
										<li className="mt-3">
											<span className="text-muted-foreground">124 City Road</span>
										</li>
										<li className="mt-3">
											<span className="text-muted-foreground">London</span>
										</li>
										<li className="mt-3">
											<span className="text-muted-foreground">EC1V 2NX</span>
										</li>
										<li className="mt-3">
											<span className="text-muted-foreground">United Kingdom</span>
										</li>
									</nav>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-muted/10 dark:bg-muted/10">
				<div className="container max-w-7xl mx-auto px-4 lg:px-8 py-4">
					<p className="text-sm text-muted-foreground text-center">
						© 2024 All rights reserved
					</p>
				</div>
			</div>
		</footer>
	)
}

export default Footer

