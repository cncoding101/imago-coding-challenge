import { getFacets as getRepoFacets } from '@/repositories/media';
import type { MediaFacets } from '@/repositories/media';

/** Get filter facets for the UI. */
export const getFacets = (): MediaFacets => {
	return getRepoFacets();
};
