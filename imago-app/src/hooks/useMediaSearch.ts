import { useQuery } from '@tanstack/react-query';
import { getMediaSearch, type GetMediaSearchParams } from '@/api/generated/server.client';

export const useMediaSearch = (params: GetMediaSearchParams) => {
	return useQuery({
		queryKey: ['mediaSearch', params],
		queryFn: () => getMediaSearch(params),
		select: (res) => res.data
	});
};
