import { defineConfig } from 'orval';

export default defineConfig({
	server: {
		input: './public/openapi.json',
		output: {
			target: './src/api/generated/server.client.ts',
			client: 'fetch',
			baseUrl: '',
			override: {
				mutator: {
					path: './src/utils/helpers/fetch-client.ts',
					name: 'fetchClient'
				}
			}
		}
	}
});
