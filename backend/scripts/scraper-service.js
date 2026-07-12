const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());

let browser;

app.post('/ajio', async (req, res) => {
  const { query } = req.body;
  try {
    if (!browser) {
      browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"] });
    }
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
        const img = el.querySelector('img')?.src || '';
        const link = el.querySelector('a')?.href || '';
        return { title: title ? `${brand} ${title}`.trim() : '', brand, priceText, origPriceText, discountText, image: img, productUrl: link };
      });
    });
    
    await page.close();
    res.json({ products });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(4000, () => console.log('Scraper service running on port 4000'));
