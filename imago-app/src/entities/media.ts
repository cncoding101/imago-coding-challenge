import { MediaItem } from '@/schemas/media';

/** Raw media item as it comes from the JSON dataset */
export interface RawMediaItem {
	suchtext: string;
	bildnummer: string;
	fotografen: string;
	datum: string; // DD.MM.YYYY
	hoehe: string;
	breite: string;
}

// Matches for publications in and not in regions
const RESTRICTION_PATTERN =
	/PUBLICATIONxNOTxINx([A-Z]{2,}(?:x[A-Z]{2,})*)|PUBLICATIONxINx([A-Z]{2,}(?:x[A-Z]{2,})*)xONLY/g;

/** Matches archive/agency reference IDs embedded in suchtext (e.g. UnitedArchives00421716). */
const ARCHIVE_ID_PATTERN = /\b[A-Za-z]+\d{5,}\b/g;

/** Parse German date DD.MM.YYYY to ISO YYYY-MM-DD. */
export const parseDate = (datum: string): string => {
	const [day, month, year] = datum.split('.');
	return `${year}-${month}-${day}`;
};

/** Extract restriction country codes from suchtext. */
export const extractRestrictions = (suchtext: string): string[] => {
	const countries: string[] = [];
	let match: RegExpExecArray | null;

	RESTRICTION_PATTERN.lastIndex = 0;
	while ((match = RESTRICTION_PATTERN.exec(suchtext)) !== null) {
		const codes = match[1] || match[2];
		if (codes) countries.push(...codes.split('x'));
	}

	return countries;
};

/** Strip restriction tokens and archive IDs, lowercase, collapse whitespace. */
export const normalizeText = (suchtext: string): string => {
	RESTRICTION_PATTERN.lastIndex = 0;
	ARCHIVE_ID_PATTERN.lastIndex = 0;
	return suchtext
		.replace(RESTRICTION_PATTERN, '')
		.replace(ARCHIVE_ID_PATTERN, '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
};

/** Strip "IMAGO / " prefix from fotografen. */
export const extractCredit = (fotografen: string): string => {
	return fotografen.replace(/^IMAGO\s*\/\s*/, '').trim();
};

/** Transform a RawMediaItem into a processed MediaItem. */
export const toMediaItem = (raw: RawMediaItem): MediaItem => ({
	id: raw.bildnummer,
	imageNumber: raw.bildnummer,
	description: normalizeText(raw.suchtext),
	rawDescription: raw.suchtext,
	credit: extractCredit(raw.fotografen),
	date: parseDate(raw.datum),
	rawDate: raw.datum,
	restrictions: extractRestrictions(raw.suchtext),
	width: parseInt(raw.breite, 10),
	height: parseInt(raw.hoehe, 10)
});
