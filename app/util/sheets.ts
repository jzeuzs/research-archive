import { google } from 'googleapis';
import csvtojson from 'csvtojson';
import slugify from '@sindresorhus/slugify';

export type ArchiveType = 'pr1' | 'pr2' | 'capstone' | 'respro';

export interface Archive {
	slug: string;
	title: string;
	year: string;
	abstract: string;
	authors: string[];
	keywords: string[];
	type: ArchiveType;
}

export default async function getArchives() {
	const auth = await google.auth.getClient({
		projectId: process.env.PROJECT_ID,
		credentials: {
			type: 'service_account',
			project_id: process.env.PROJECT_ID,
			private_key_id: process.env.PRIVATE_KEY_ID,
			private_key: process.env.PRIVATE_KEY,
			client_email: process.env.CLIENT_EMAIL,
			universe_domain: 'googleapis.com'
		},
		scopes: ['https://www.googleapis.com/auth/spreadsheets']
	});

	const sheets = google.sheets({ auth, version: 'v4' });
	const rawArchives = await sheets.spreadsheets.values.get({
		spreadsheetId: process.env.SHEET_ID,
		range: 'Archive!A:F'
	});

	const formatted = rawArchives.data.values!.map((row) => row.map((cell) => `"${cell}"`).join(','));
	const converted = await csvtojson().fromString(formatted.join('\n'));
	const archives = converted.map((archive) => ({
		...archive,
		slug: slugify(archive.title),
		keywords: archive.keywords.split(',').map((keyword: string) => keyword.trim()),
		authors: archive.authors.split(',').map((author: string) => author.trim())
	})) as Archive[];

	return archives;
}
