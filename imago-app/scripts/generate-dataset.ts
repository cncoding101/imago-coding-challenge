/**
 * Generate 10k+ synthetic media items for performance testing.
 * Run with: bun run scripts/generate-dataset.ts
 */
import { writeFileSync } from 'fs';
import { join } from 'path';

const ITEM_COUNT = 10_000;

const keywords = [
	'Fußball',
	'Tennis',
	'Politik',
	'Berlin',
	'München',
	'Hamburg',
	'Köln',
	'Dresden',
	'Bundestag',
	'Bundesliga',
	'Champions League',
	'Olympia',
	'Konzert',
	'Festival',
	'Demonstration',
	'Protest',
	'Architektur',
	'Landschaft',
	'Natur',
	'Strand',
	'Schnee',
	'Winter',
	'Sommer',
	'Frühling',
	'Herbst',
	'Musik',
	'Rock',
	'Pop',
	'Klassik',
	'Oper',
	'Theater',
	'Film',
	'Kino',
	'Mode',
	'Kunst',
	'Museum',
	'Sport',
	'Leichtathletik',
	'Schwimmen',
	'Radfahren',
	'Motorsport',
	'Formel 1',
	'Wirtschaft',
	'Industrie',
	'Automobil',
	'Technik',
	'Wissenschaft',
	'Forschung',
	'Umwelt',
	'Klimaschutz',
	'Energie',
	'Verkehr',
	'Reise',
	'Tourismus',
	'Kultur',
	'Tradition',
	'Geschichte',
	'Denkmal',
	'UNESCO',
	'Welterbe',
	'Kirche',
	'Dom',
	'Schloss',
	'Burg',
	'Rathaus',
	'Brücke',
	'Fluss',
	'See',
	'Meer',
	'Alpen',
	'Wald',
	'Berg',
	'Tal',
	'Küste',
	'Insel',
	'Hafen',
	'Flughafen',
	'Bahnhof'
];

const people = [
	'Angela Merkel',
	'Helmut Kohl',
	'Boris Becker',
	'Steffi Graf',
	'Michael Schumacher',
	'Sebastian Vettel',
	'Jürgen Klopp',
	'Thomas Müller',
	'Manuel Neuer',
	'Bastian Schweinsteiger',
	'Claudia Schiffer',
	'Heidi Klum',
	'Till Lindemann',
	'Herbert Grönemeyer',
	'Udo Lindenberg',
	'Günter Grass',
	'Albert Einstein',
	'Ludwig van Beethoven',
	'Johann Wolfgang von Goethe'
];

const agencies = [
	'IMAGO / Sven Simon',
	'IMAGO / Pressefoto Baumann',
	'IMAGO / imagebroker',
	'IMAGO / Team 2',
	'IMAGO / Beautiful Sports',
	'IMAGO / photothek',
	'IMAGO / epd',
	'IMAGO / Future Image',
	'IMAGO / teutopress',
	'IMAGO / Ralph Peters',
	'IMAGO / Rolf Zöllner',
	'IMAGO / snapshot',
	'IMAGO / Arnulf Hettrich',
	'IMAGO / Jochen Tack',
	'IMAGO / blickwinkel',
	'IMAGO / Schöning',
	'IMAGO / United Archives International',
	'IMAGO / Aviation-Stock',
	'IMAGO / Motorsport Images',
	'IMAGO / Joko'
];

const restrictionPatterns = [
	'',
	'',
	'',
	'', // 40% no restrictions
	'PUBLICATIONxINxGERxSUIxAUTxONLY',
	'PUBLICATIONxINxGERxONLY',
	'PUBLICATIONxNOTxINxUSA',
	'PUBLICATIONxNOTxINxFRA',
	'PUBLICATIONxINxGERxSUIxAUTxHUNxONLY',
	'PUBLICATIONxNOTxINxUSAxGBR'
];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (): string => {
	const year = 1950 + Math.floor(Math.random() * 75); // 1950–2024
	const month = 1 + Math.floor(Math.random() * 12);
	const day = 1 + Math.floor(Math.random() * 28);
	return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
};

const randomSuchtext = (): string => {
	const numKeywords = 4 + Math.floor(Math.random() * 8);
	const selectedKeywords: string[] = [];
	for (let i = 0; i < numKeywords; i++) {
		selectedKeywords.push(pick(keywords));
	}
	if (Math.random() > 0.7) {
		selectedKeywords.unshift(pick(people));
	}
	const restriction = pick(restrictionPatterns);
	const parts = [...selectedKeywords];
	if (restriction) parts.push(restriction);
	return parts.join(' ');
};

const items = Array.from({ length: ITEM_COUNT }, (_, i) => {
	const bildnummer = String(1000000000 + i).slice(0, 10);
	const width = 1200 + Math.floor(Math.random() * 4000);
	const height = 800 + Math.floor(Math.random() * 3000);

	return {
		suchtext: randomSuchtext(),
		bildnummer,
		fotografen: pick(agencies),
		datum: randomDate(),
		hoehe: String(height),
		breite: String(width)
	};
});

const outPath = join(import.meta.dir, '..', 'data', 'dataset-10k.json');
writeFileSync(outPath, JSON.stringify(items, null, 2));
console.log(`Generated ${ITEM_COUNT} items → ${outPath}`);
