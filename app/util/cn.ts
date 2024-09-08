import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function fn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
