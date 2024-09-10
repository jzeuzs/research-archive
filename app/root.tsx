import { Links, Meta, Outlet, Scripts, ScrollRestoration, Link, useNavigation, useFetchers } from '@remix-run/react';
import { useMemo, useEffect } from 'react';
import type { LinksFunction } from '@remix-run/node';
import { SiFacebook } from '@icons-pack/react-simple-icons';
import { Mail } from 'lucide-react';
import NProgress from 'nprogress';
import nprogressStyles from 'nprogress/nprogress.css?url';
import tailwind from './tailwind.css?url';

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: tailwind },
	{ rel: 'stylesheet', href: nprogressStyles }
];

export function Layout({ children }: { children: React.ReactNode }) {
	const navigation = useNavigation();
	const fetchers = useFetchers();
	const state = useMemo<'idle' | 'loading'>(() => {
		const states = [navigation.state, ...fetchers.map(({ state }) => state)];

		if (states.every((state) => state === 'idle')) return 'idle';
		return 'loading';
	}, [navigation.state, fetchers]);

	useEffect(() => {
		NProgress.configure({ showSpinner: false });
	}, []);

	useEffect(() => {
		if (state === 'loading') NProgress.start();
		if (state === 'idle') NProgress.done();
	}, [state]);

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<div className="min-h-screen flex flex-col bg-white">
					<header className="bg-black text-white font-inter">
						<div className="container mx-auto md:px-6 px-4 py-4 flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<img src="/logo.png" alt="MSU-GSC Logo" className="h-12 w-12" />
								<div>
									<h1 className="text-xl font-bold">Mindanao State University-General Santos City</h1>
									<p className="text-base">Senior High School</p>
								</div>
							</div>

							<nav>
								<ul className="flex space-x-6">
									<li>
										<Link
											to="https://www.facebook.com/MSUGENSANSHS"
											className="p-2 rounded-full transition-colors"
											target="_blank"
											aria-label="Facebook"
											rel="noreferrer"
										>
											<SiFacebook className="h-6 w-6" />
										</Link>
									</li>
									<li>
										<Link to="mailto:shs@msugensan.edu.ph" className="p-2 rounded-full transition-colors" aria-label="Email">
											<Mail className="h-6 w-6" />
										</Link>
									</li>
								</ul>
							</nav>
						</div>
					</header>

					<main className="container mx-auto p-4 max-w-4xl">{children}</main>
				</div>

				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
