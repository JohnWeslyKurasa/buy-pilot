const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrape(query) {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true, 
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox", 
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled"
      ] 
    });
    const page = await browser.newPage();
    const url = `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`;
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.item')).slice(0, 15);
      return items.map(el => {
        const title = el.querySelector('.nameCls')?.textContent || '';
        const brand = el.querySelector('.brand')?.textContent || '';
        const priceText = el.querySelector('.price')?.textContent || '';
        const origPriceText = el.querySelector('.orginal-price')?.textContent || '';
        const discountText = el.querySelector('.discount')?.textContent || '';
        let img = el.querySelector('img')?.src || '';
        if (!img) {
             const fallback = el.querySelector('img');
             if (fallback) img = fallback.getAttribute('src') || fallback.getAttribute('data-src') || '';
        }
        const link = el.querySelector('a')?.href || '';
        
        let price = 0;
        if (priceText) price = parseInt(priceText.replace(/[^0-9]/g, ''));
        
        let originalPrice;
        if (origPriceText) originalPrice = parseInt(origPriceText.replace(/[^0-9]/g, ''));
        
        let discount;
        if (discountText) discount = parseInt(discountText.replace(/[^0-9]/g, ''));
        else if (originalPrice && price && originalPrice > price) discount = Math.round(((originalPrice - price) / originalPrice) * 100);

        return {
          title: title ? `${brand} ${title}`.trim() : '',
          brand,
          price,
          originalPrice,
          discount,
          image: img,
          productUrl: link ? link : ''
        };
      }).filter(p => p.title && p.price > 0 && p.image);
    });
    
    console.log(JSON.stringify(products));
  } catch (e) {
    console.error(e.message);
    console.log(JSON.stringify([]));
  } finally {
    if (browser) await browser.close();
  }
}

const query = process.argv[2];
if (query) scrape(query);
else console.log("[]");
