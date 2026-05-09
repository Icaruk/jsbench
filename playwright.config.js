import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	timeout: 120000,
	retries: 1,
	use: {
		baseURL: 'http://localhost:5173',
		locale: 'en-US'
	},
	webServer: {
		command: 'pnpm dev',
		port: 5173,
		reuseExistingServer: true
	},
	projects: [
		{
			name: 'chromium',
			use: { browserName: 'chromium' }
		}
	]
});
