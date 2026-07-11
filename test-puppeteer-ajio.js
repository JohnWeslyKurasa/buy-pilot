const puppeteer = require('puppeteer');

async function testAjio() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"] });
    const page = await browser.newPage();
    
    await page.goto('https://www.ajio.com/search/?text=shoes', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const html = await page.content();
    if (html.includes('Access Denied') || html.includes('403 Forbidden') || html.includes('Just a moment...')) {
        console.log('Ajio blocks Puppeteer.');
    } else {
        console.log('Ajio ALLOWS Puppeteer! Length:', html.length);
        const images = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('ajio'));
        });
        console.log('Images found:', images.length);
    }
  } catch(e) {
    console.log('Error:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}
testAjio();
