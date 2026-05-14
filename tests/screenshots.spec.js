import { test } from '@playwright/test';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = resolve(__dirname, '..', 'static');

const SCREENSHOT_RESULTS = resolve(STATIC_DIR, 'screenshot-app.png');

test('screenshot: app', async ({ page }) => {
	await page.setViewportSize({ width: 920, height: 600 });
	await page.goto('http://localhost:5173/');
	await page.waitForSelector('.run-btn');
	await page.waitForTimeout(500);
	await page.click('button.run-btn');
	await page.waitForSelector('.group-table', { timeout: 120000 });
	await page.waitForTimeout(500);
	await page.click('button.preview-btn');
	await page.waitForTimeout(500);
	await page.screenshot({ path: SCREENSHOT_RESULTS, fullPage: true });
});
