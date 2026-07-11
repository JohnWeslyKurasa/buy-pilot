const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  await page.goto('https://www.amazon.in/s?k=running+shoes', { waitUntil: 'domcontentloaded', timeout: 15000 });
  
  const products = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]')).slice(0, 5);
    return items.map(el => {
      const titleEl = el.querySelector('h2 a span');
      const priceEl = el.querySelector('.a-price .a-offscreen');
      const imgEl = el.querySelector('img.s-image');
      
      return {
        title: titleEl ? titleEl.textContent : null,
        price: priceEl ? priceEl.textContent : null,
        image: imgEl ? imgEl.getAttribute('src') : null,
      };
    });
  });
  console.log("Amazon mapped products:", products);

  await browser.close();
}
run().catch(console.error);
