import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('screenshots');
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // 1. Homepage with enhanced discovery, affordability bar, and badges
  await page.screenshot({ path: path.join(outDir, 'after_1_homepage_enhanced.png'), fullPage: false });
  console.log('Saved after_1_homepage_enhanced.png');

  // Scroll discovery section into view
  await page.evaluate(() => {
    document.getElementById('discover')?.scrollIntoView({ behavior: 'instant' });
  });
  await delay(400);

  // 2. Select 2 items for comparison (Calculus II textbook and Student desk lamp)
  const compareBtns = await page.$$('.card-compare-btn');
  if (compareBtns.length >= 2) {
    await compareBtns[0].click();
    await delay(200);
    await compareBtns[1].click();
    await delay(400);
  }

  // Click Compare Side-by-Side button in the docked bar
  const launchBtn = await page.$('.compare-launch-btn');
  if (launchBtn) {
    await launchBtn.click();
    await page.waitForSelector('.compare-modal', { timeout: 5000 });
    await delay(500);
    await page.screenshot({ path: path.join(outDir, 'after_2_compare_matrix.png'), fullPage: false });
    console.log('Saved after_2_compare_matrix.png');

    // Close comparison modal
    await page.click('.compare-modal .close');
    await delay(400);
  }

  // 3. Demonstrate unsuccessful action: submit empty sell form to show inline field errors
  const sellBtn = await page.$('header .sell-cta');
  await sellBtn.click();
  await page.waitForSelector('.sell-modal', { timeout: 5000 });

  // Attempt submit empty form
  const submitBtn = await page.$('.modal-foot button[type="submit"]');
  await submitBtn.click();
  await page.waitForSelector('.alert-summary', { timeout: 5000 });
  await delay(500);
  await page.screenshot({ path: path.join(outDir, 'after_3_unsuccessful_action_inline_errors.png'), fullPage: false });
  console.log('Saved after_3_unsuccessful_action_inline_errors.png');

  // 4. Fill form with unsaved changes and attempt to close to demonstrate dirty form protection
  const titleInput = await page.$('.field-grid input');
  if (titleInput) {
    await titleInput.type('Organic Chemistry Lab Manual 4th Ed');
  }
  await delay(300);

  // Click close button on dirty modal
  const closeBtn = await page.$('.sell-modal .close');
  await closeBtn.click();
  await page.waitForSelector('.confirm-modal', { timeout: 5000 });
  await delay(400);
  await page.screenshot({ path: path.join(outDir, 'after_4_discard_protection_dialog.png'), fullPage: false });
  console.log('Saved after_4_discard_protection_dialog.png');

  // Choose "Keep editing"
  const keepBtn = await page.$('.confirm-keep-btn');
  await keepBtn.click();
  await delay(300);

  // 5. Complete form to demonstrate main action: successful publication
  const priceInput = await page.$('.field-grid input[type="number"]');
  if (priceInput) {
    await priceInput.type('175');
  }

  const selects = await page.$$('.field-grid select');
  if (selects.length >= 2) {
    await selects[0].select('textbooks');
    await selects[1].select('like-new');
  }

  const descTextarea = await page.$('.field-grid textarea');
  if (descTextarea) {
    await descTextarea.type('Official lab manual with duplicate report sheets. Clean, spiral-bound, no missing pages.');
  }

  const inputs = await page.$$('.field-grid input');
  if (inputs.length >= 3) {
    await inputs[2].type('GUC Chemistry Building C4, mornings');
  }
  await delay(300);

  // Click Publish
  const finalSubmitBtn = await page.$('.modal-foot button[type="submit"]');
  await finalSubmitBtn.click();
  await page.waitForSelector('.notice', { timeout: 5000 });
  await delay(500);

  // Scroll to discovery to show the newly added listing
  await page.evaluate(() => {
    document.getElementById('discover')?.scrollIntoView({ behavior: 'instant' });
  });
  await delay(400);

  await page.screenshot({ path: path.join(outDir, 'after_5_main_action_success.png'), fullPage: false });
  console.log('Saved after_5_main_action_success.png');

  await browser.close();
}

run().catch((err) => {
  console.error('Error capturing after screenshots:', err);
  process.exit(1);
});

