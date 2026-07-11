const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  await page.goto('https://www.myntra.com/running-shoes', { waitUntil: 'domcontentloaded', timeout: 15000 });
  
  const html = await page.content();
  console.log("HTML length:", html.length);
  
  const products = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('li.product-base')).slice(0, 5);
    return items.map(el => {
      const imgEl = el.querySelector('img');
      const linkEl = el.querySelector('a');
      return {
        text: el.innerText,
        image: imgEl ? imgEl.getAttribute('src') : null,
        link: linkEl ? linkEl.getAttribute('href') : null
      };
    });
  });
  console.log(JSON.stringify(products, null, 2));

  await browser.close();
}
run().catch(console.error);
