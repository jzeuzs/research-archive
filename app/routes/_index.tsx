import { json, type MetaFunction } from '@remix-run/node';
import { type FormEvent, useState } from 'react';
import getArchives, { type Archive } from '~/util/sheets';
import { Button, Checkbox, Label, TextInput, Card, Badge } from 'flowbite-react';
import { Filter, Calendar, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link, useLoaderData } from '@remix-run/react';
import fuzzysort from 'fuzzysort';
import cache from '~/util/cache';
import formatType from '~/util/formatType';

export const meta: MetaFunction = () => {
	return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export async function loader() {
	const cachedArchives = await cache.getItem('archives');
	if (cachedArchives) return json(cachedArchives);

	const archives = await getArchives();
	await cache.setItem('archives', archives);
	return json(archives);
}

export default function Index() {
	const archives = useLoaderData<typeof loader>();

	const [query, setQuery] = useState('');
	const [filters, setFilters] = useState({
		pr1: true, // Practical Research 1 (Qualitative)
		pr2: true, // Practical Research 2 (Quantitative)
		capstone: true, // Capstone Project (STEM)
		respro: true // Research Project (ABM & HUMSS)
	});

	const [results, setResults] = useState([] as unknown as ReturnType<typeof fuzzysort.go<Archive>>);
	const [currentPage, setCurrentPage] = useState(1);

	const handleFilterChange = (type: 'pr1' | 'pr2' | 'capstone' | 'respro') =>
		setFilters((prev) => ({
			...prev,
			[type]: !prev[type]
		}));

	const handleSearch = (e?: FormEvent) => {
		e?.preventDefault();

		const filteredArchives = archives.filter(({ type }) => {
			return (
				(filters.pr1 && type === 'pr1') ||
				(filters.pr2 && type === 'pr2') ||
				(filters.capstone && type === 'capstone') ||
				(filters.respro && type === 'respro')
			);
		});

		const results = fuzzysort.go(query, filteredArchives, {
			keys: ['title', 'abstract', (archive) => archive.authors.join(','), (archive) => archive.keywords.join(',')],
			threshold: 0.5,
			all: true
		});

		setResults(results);
		setCurrentPage(1);
	};

	const pageCount = Math.ceil(results.length / 5);
	const paginatedResults = results.slice((currentPage - 1) * 5, currentPage * 5);

	return (
		<>
			<h2 className="text-2xl font-bold mb-6 font-inter">Research Archive Search</h2>

			<form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
				<div className="flex-grow font-inter">
					<TextInput type="text" placeholder="Enter your search query" value={query} onChange={(e) => setQuery(e.target.value)} />
				</div>

				<Button type="submit" className="bg-black font-inter">
					Search
				</Button>
			</form>

			<div className="flex flex-col md:flex-row gap-8 mb-8">
				<div className="w-full md:w-1/3">
					<h3 className="text-lg font-semibold mb-4 flex items-center font-inter">
						<Filter className="mr-2 h-5 w-5" />
						Filters
					</h3>

					<div className="space-y-4">
						<div>
							<h4 className="font-medium mb-2 font-inter">Research Type</h4>
							<div className="space-y-2">
								<div className="flex items-center">
									<Checkbox
										className="bg-black text-black"
										id="pr1"
										checked={filters.pr1}
										onChange={() => handleFilterChange('pr1')}
									/>
									<Label htmlFor="pr1" className="ml-2 font-inter">
										Practical Research 1 (Qualitative)
									</Label>
								</div>

								<div className="flex items-center">
									<Checkbox
										className="bg-black text-black"
										id="pr2"
										checked={filters.pr2}
										onChange={() => handleFilterChange('pr2')}
									/>
									<Label htmlFor="pr2" className="ml-2 font-inter">
										Practical Research 2 (Quantitative)
									</Label>
								</div>

								<div className="flex items-center">
									<Checkbox
										className="bg-black text-black"
										id="capstone"
										checked={filters.capstone}
										onChange={() => handleFilterChange('capstone')}
									/>
									<Label htmlFor="capstone" className="ml-2 font-inter">
										Capstone Project (STEM)
									</Label>
								</div>

								<div className="flex items-center">
									<Checkbox
										className="bg-black text-black"
										id="respro"
										checked={filters.respro}
										onChange={() => handleFilterChange('respro')}
									/>
									<Label htmlFor="respro" className="ml-2 font-inter">
										Research Project (ABM, HUMSS)
									</Label>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full md:w-2/3">
					<div className="space-y-4">
						{paginatedResults.map(({ obj }) => (
							<Card key={obj.slug} className="overflow-hidden">
								<div className="p-4">
									<div className="flex flex-col gap-2">
										<h3 className="text-xl font-semibold font-inter">{obj.title}</h3>
										<div className="flex justify-between text-sm text-gray-500 font-inter">
											<span className="mr-1">{obj.authors.join(', ')}</span>
											<span className="flex items-center ml-1">
												<Calendar className="mr-1 h-4 w-4" />
												{obj.year}
											</span>
										</div>

										<div className="text-sm text-gray-500 font-inter">{formatType(obj.type)}</div>

										<div className="flex flex-wrap gap-2 mt-2">
											{obj.keywords.map((keyword, i) => (
												<Badge key={i} className="bg-black text-white font-inter">
													{keyword}
												</Badge>
											))}
										</div>

										<Link to={`archive/${obj.slug}`} className="flex items-center text-blue-500 hover:underline mt-2 font-inter">
											View Details
											<ArrowRight className="h-4 w-4 ml-1" />
										</Link>
									</div>
								</div>
							</Card>
						))}
					</div>

					{results.length > 0 && (
						<div className="flex justify-between items-center mt-6">
							<Button
								className="bg-white flex items-center font-inter"
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								outline
							>
								<ChevronLeft className="h-5 w-5" />
								Previous
							</Button>

							<span className="font-inter">
								Page {currentPage} of {pageCount}
							</span>

							<Button
								className="bg-white flex items-center font-inter"
								onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
								disabled={currentPage === pageCount}
								outline
							>
								Next
								<ChevronRight className="h-5 w-5" />
							</Button>
						</div>
					)}

					{results.length === 0 && (
						<p className="text-center text-gray-500 mt-8 font-inter">
							No results found. Try another search query or adjust your filters.
						</p>
					)}
				</div>
			</div>
		</>
	);
}
