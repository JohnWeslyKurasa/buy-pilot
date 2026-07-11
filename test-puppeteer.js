const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  console.log("Navigating to Amazon...");
  await page.goto('https://www.amazon.in/s?k=running+shoes', { waitUntil: 'domcontentloaded', timeout: 15000 });
  
  const html = await page.content();
  console.log("HTML length:", html.length);
  
  const products = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]'));
    return items.length;
  });
  console.log("Amazon Items found:", products);

  console.log("Navigating to Flipkart...");
  await page.goto('https://www.flipkart.com/search?q=running+shoes', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const fItems = await page.evaluate(() => {
    return document.querySelectorAll('div[data-id]').length;
  });
  console.log("Flipkart Items found:", fItems);

  await browser.close();
}
run().catch(console.error);
