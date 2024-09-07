import type { ArchiveType } from './sheets';

export default function formatType(type: ArchiveType) {
	switch (type) {
		case 'pr1':
			return 'Practical Research 1 (Qualitative)';

		case 'pr2':
			return 'Practical Research 2 (Quantitative)';

		case 'capstone':
			return 'Capstone Project (STEM)';

		case 'respro':
			return 'Research Project (ABM, HUMSS)';
	}
}
