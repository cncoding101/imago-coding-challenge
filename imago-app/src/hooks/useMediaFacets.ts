import { useQuery } from '@tanstack/react-query';
import { getMediaFacets } from '@/api/generated/server.client';

export const useMediaFacets = () => {
	return useQuery({
		queryKey: ['mediaFacets'],
		queryFn: () => getMediaFacets(),
		select: (res) => res.data
	});
};
