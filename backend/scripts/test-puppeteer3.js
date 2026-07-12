const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  await page.goto('https://www.flipkart.com/search?q=running+shoes', { waitUntil: 'domcontentloaded', timeout: 15000 });
  
  const products = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[data-id]')).slice(0, 5);
    return items.map(el => {
      const titleEl = el.querySelector('a.wjcEIp, a.CGtC98, div.KzDlHZ, a[title]');
      const priceEl = el.querySelector('div.Nx9bqj');
      const imgEl = el.querySelector('img');
      const linkEl = el.querySelector('a');
      
      return {
        title: titleEl ? (titleEl.getAttribute('title') || titleEl.textContent) : null,
        price: priceEl ? priceEl.textContent : null,
        image: imgEl ? imgEl.getAttribute('src') : null,
        link: linkEl ? linkEl.getAttribute('href') : null
      };
    });
  });
  console.log("Flipkart mapped products:", products);

  await browser.close();
}
run().catch(console.error);
