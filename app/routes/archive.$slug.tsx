import { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, Copy } from 'lucide-react';
import { Badge, Card } from 'flowbite-react';
import { Link, useLoaderData } from '@remix-run/react';
import getArchives, { type Archive } from '~/util/sheets';
import cache from '~/util/cache';
import formatType from '~/util/formatType';
import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { useCopyToClipboard } from 'usehooks-ts';

const authorsRegex = /^([\w.]+\s[\w\s]*\b[\w]\.?)\s([\w\s-]+)$/;
const archiveToBib = (archive: Archive, href: string) => {
	const authors = archive.authors.flatMap((author) => {
		const matched = author.match(authorsRegex);

		if (!matched) return [];

		const firstname = matched[1];
		const lastname = matched[2];

		return `${lastname}, ${firstname}`;
	});

	return `@misc{research,
		author = {${authors.join(' and ')}},
		title = {${archive.title}},
		year = {${archive.year}},
		url = {${href}},
		publisher = {MSU-GSC SHS Research Archive},
	}`;
};

export async function loader({ params }: LoaderFunctionArgs) {
	let archives = await cache.getItem<Archive[]>('archives');
	if (!archives) archives = await getArchives();

	const archive = archives.find(({ slug }) => slug === params.slug);
	if (!archive) throw new Response(null, { status: 404, statusText: 'Not found' });

	return json(archive);
}

export default function Archive() {
	const archive = useLoaderData<typeof loader>();
	const [, copy] = useCopyToClipboard();
	const [biblio, setBiblio] = useState({} as { text: string; html: string });
	const [href, setHref] = useState('');
	const bib = archiveToBib(archive, href);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setHref(window.location.href);
		}
	}, []);

	useEffect(() => {
		const generateReference = async () => {
			// @ts-expect-error no types
			const { Cite } = await import('@citation-js/core');

			// @ts-expect-error no types
			await import('@citation-js/plugin-bibtex');

			// @ts-expect-error no types
			await import('@citation-js/plugin-csl');

			const data = await Cite.async(bib);
			const biblio = data.format('bibliography', {
				format: 'html',
				template: 'apa',
				lang: 'en-US'
			});

			const biblioText = data.format('bibliography', {
				format: 'text',
				template: 'apa',
				lang: 'en-US'
			});

			setBiblio({ html: biblio, text: biblioText });
		};

		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		generateReference();
	}, [bib]);

	return (
		<div className="container mx-auto p-4 max-w-4xl">
			<Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6 font-inter">
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to Search
			</Link>

			<Card className="overflow-hidden">
				<div className="p-6">
					<h2 className="text-2xl font-bold mb-4 font-inter">{archive.title}</h2>
					<div className="space-y-4">
						<div className="flex justify-between text-sm text-gray-500 font-inter">
							<span className="mr-1">{archive.authors.join(', ')}</span>
							<span className="flex items-center ml-1">
								<Calendar className="h-4 w-4 mr-1" />
								{archive.year}
							</span>
						</div>

						<div className="text-sm text-gray-500 font-inter">{formatType(archive.type)}</div>

						<div className="flex flex-wrap gap-2">
							{archive.keywords.map((keyword, i) => (
								<Badge key={i} className="bg-black text-white font-inter">
									{keyword}
								</Badge>
							))}
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-2 font-inter">Abstract</h3>
							<p className="text-black font-inter">{archive.abstract}</p>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-2 font-inter">Recommended Citation</h3>
							<div className="bg-gray-100 p-4 rounded-md">
								<div className="flex items-start justify-between">
									{/* eslint-disable-next-line react/no-danger */}
									<p
										className="text-black text-sm font-inter flex-grow pr-4 break-words"
										dangerouslySetInnerHTML={{ __html: biblio.html }}
									></p>

									<button
										onClick={() => copy(biblio.text)}
										className="text-blue-500 hover:text-blue-600 focus:outline-none flex-shrink-0 ml-2"
										aria-label="Copy citation"
									>
										<Copy className="h-5 w-5" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
