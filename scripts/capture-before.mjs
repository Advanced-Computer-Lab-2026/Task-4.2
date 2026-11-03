import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('screenshots');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // 1. Before Homepage
  await page.screenshot({ path: path.join(outDir, 'before_1_homepage.png'), fullPage: false });
  console.log('Saved before_1_homepage.png');

  // 2. Open Sell Modal and trigger empty validation error
  await page.click('button.sell-cta');
  await page.waitForSelector('.sell-modal');
  // Click publish to trigger error
  await page.click('.modal-foot button[type="submit"]');
  await page.waitForSelector('.alert');
  await page.screenshot({ path: path.join(outDir, 'before_2_vague_error.png'), fullPage: false });
  console.log('Saved before_2_vague_error.png');

  // Close modal
  await page.click('.modal-head .close');

  // 3. Open an item detail
  await page.waitForSelector('.details-button');
  const detailsButtons = await page.$$('.details-button');
  if (detailsButtons.length > 0) {
    await detailsButtons[0].click();
    await page.waitForSelector('.detail-panel');
    await page.screenshot({ path: path.join(outDir, 'before_3_item_detail.png'), fullPage: false });
    console.log('Saved before_3_item_detail.png');
  }

  await browser.close();
}

run().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});

