import { test, expect } from '@playwright/test';
import LZString from 'lz-string';

/** @param {{ setupCode: string; testCases: { id: string; name: string; code: string; }[]; iterations: number[]; minTime: number; parallel?: boolean; }} opts @returns {string} */
function buildHash({ setupCode, testCases, iterations, minTime, parallel }) {
	const data = {
		s: setupCode,
		t: testCases.map((/** @type {{ id: string; name: string; code: string; }} */ tc) => ({ i: tc.id, n: tc.name, c: tc.code })),
		n: iterations,
		m: minTime,
		p: (parallel ?? false) ? 1 : 0
	};
	return LZString.compressToEncodedURIComponent(JSON.stringify(data));
}

/** @param {Parameters<typeof buildHash>[0]} opts @returns {string} */
function buildURL(opts) {
	return `http://localhost:5173/#${buildHash(opts)}`;
}

const DELAY_SETUP = `return {
  delay: (ms) => { const s = Date.now(); while (Date.now() - s < ms) {} }
};`;

const ARRAY_SETUP = `return {
  itemList: Array.from({ length: $N }, (_, i) => i)
};`;

test('warmup + minTime timing accuracy', async ({ page }) => {
	const url = buildURL({
		setupCode: DELAY_SETUP,
		testCases: [
			{ id: 'tc1', name: '10ms delay', code: 'delay(10);' }
		],
		iterations: [100],
		minTime: 500
	});

	await page.goto(url);
	await page.waitForSelector('button.run-btn');
	await page.waitForTimeout(500);

	const start = Date.now();
	await page.click('button.run-btn');
	await page.waitForSelector('.group-table', { timeout: 60000 });
	const elapsed = Date.now() - start;

	expect(elapsed).toBeGreaterThanOrEqual(800);
	expect(elapsed).toBeLessThanOrEqual(3000);

	const opsText = await page.locator('.ops').first().textContent();
	const ops = parseFloat(String(opsText).replace(/[KM]/g, ''));
	expect(ops).toBeGreaterThan(0);
});

test('multiple iteration sizes produce separate result groups', async ({ page }) => {
	const url = buildURL({
		setupCode: ARRAY_SETUP,
		testCases: [
			{ id: 'tc1', name: 'for loop', code: 'for (let i = 0; i < itemList.length; i++) {}' },
			{ id: 'tc2', name: 'forEach', code: 'itemList.forEach(x => x);' }
		],
		iterations: [10, 100, 500],
		minTime: 500
	});

	await page.goto(url);
	await page.waitForSelector('button.run-btn');
	await page.waitForTimeout(500);

	await page.click('button.run-btn');
	await page.waitForSelector('.group-table', { timeout: 120000 });

	const groups = page.locator('.group');
	await expect(groups).toHaveCount(3);

	const headers = page.locator('.group-header');
	await expect(headers.nth(0)).toContainText('10');
	await expect(headers.nth(1)).toContainText('100');
	await expect(headers.nth(2)).toContainText('500');

	for (let i = 0; i < 3; i++) {
		const rows = groups.nth(i).locator('.ops');
		await expect(rows).toHaveCount(2);
		for (const row of await rows.all()) {
			const text = await row.textContent();
			expect(text).toBeTruthy();
		}
	}
});

test('ops/sec decreases with larger iteration sizes', async ({ page }) => {
	const url = buildURL({
		setupCode: ARRAY_SETUP,
		testCases: [
			{ id: 'tc1', name: 'for loop', code: 'for (let i = 0; i < itemList.length; i++) {}' }
		],
		iterations: [100, 2000],
		minTime: 500
	});

	await page.goto(url);
	await page.waitForSelector('button.run-btn');
	await page.waitForTimeout(500);

	await page.click('button.run-btn');
	await page.waitForSelector('.group-table', { timeout: 120000 });

	const opsElements = page.locator('.ops');
	const opsValues = [];
	for (const el of await opsElements.all()) {
		const text = String(await el.textContent());
		let val = parseFloat(text);
		if (text.includes('K')) val *= 1000;
		if (text.includes('M')) val *= 1000000;
		opsValues.push(val);
	}

	expect(opsValues[0]).toBeGreaterThan(opsValues[1]);
});

test('setup error shows error message', async ({ page }) => {
	const url = buildURL({
		setupCode: 'throw new Error("bad setup");',
		testCases: [
			{ id: 'tc1', name: 'test', code: '1+1;' }
		],
		iterations: [10],
		minTime: 500
	});

	await page.goto(url);
	await page.waitForSelector('button.run-btn');
	await page.waitForTimeout(500);

	await page.click('button.run-btn');
	await expect(page.locator('.error')).toBeVisible({ timeout: 30000 });
	await expect(page.locator('.error')).toContainText('Setup error');
});

test('runtime error in test case shows error message', async ({ page }) => {
	const url = buildURL({
		setupCode: ARRAY_SETUP,
		testCases: [
			{ id: 'tc1', name: 'crash', code: 'nonexistentFunction();' }
		],
		iterations: [10],
		minTime: 500
	});

	await page.goto(url);
	await page.waitForSelector('button.run-btn');
	await page.waitForTimeout(500);

	await page.click('button.run-btn');
	await expect(page.locator('.error')).toBeVisible({ timeout: 30000 });
	await expect(page.locator('.error')).toContainText('Runtime error');
});

test('parallel toggle enables parallel mode and completes benchmark', async ({ page }) => {
	const url = buildURL({
		setupCode: ARRAY_SETUP,
		testCases: [
			{ id: 'tc1', name: 'for loop', code: 'for (let i = 0; i < itemList.length; i++) {}' },
			{ id: 'tc2', name: 'forEach', code: 'itemList.forEach(x => x);' }
		],
		iterations: [10, 100],
		minTime: 500
	});

	await page.goto(url);
	await page.waitForSelector('button.run-btn');
	await page.waitForTimeout(500);

	const toggle = page.locator('.mode-btn');
	await toggle.click();
	await expect(toggle).toHaveClass(/active/);

	const start = Date.now();
	await page.click('button.run-btn');
	await page.waitForSelector('.group-table', { timeout: 120000 });
	const elapsed = Date.now() - start;

	expect(elapsed).toBeGreaterThanOrEqual(500);

	const groups = page.locator('.group');
	await expect(groups).toHaveCount(2);

	for (let i = 0; i < 2; i++) {
		const rows = groups.nth(i).locator('.ops');
		await expect(rows).toHaveCount(2);
		for (const row of await rows.all()) {
			const text = await row.textContent();
			expect(text).toBeTruthy();
		}
	}
});
