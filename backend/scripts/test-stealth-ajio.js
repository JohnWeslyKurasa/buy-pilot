const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testAjio() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"] });
    const page = await browser.newPage();
    
    await page.goto('https://www.ajio.com/search/?text=shoes', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const html = await page.content();
    if (html.includes('Access Denied') || html.includes('403 Forbidden') || html.includes('Just a moment...')) {
        console.log('Ajio blocks Stealth Puppeteer.');
    } else {
        console.log('Ajio ALLOWS Stealth Puppeteer! Length:', html.length);
        const products = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.item')).slice(0,2);
            return items.map(el => ({
                title: el.querySelector('.nameCls')?.textContent || '',
                price: el.querySelector('.price')?.textContent || '',
                img: el.querySelector('img')?.src || ''
            }));
        });
        console.log('Products found:', products);
    }
  } catch(e) {
    console.log('Error:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}
testAjio();
