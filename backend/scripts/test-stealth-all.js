const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testAll() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"] });
    
    // Croma
    const p1 = await browser.newPage();
    await p1.goto('https://www.croma.com/searchB?q=iphone', { waitUntil: 'domcontentloaded' });
    const croma = await p1.evaluate(() => document.body.innerHTML.substring(0, 1500));
    console.log('Croma HTML snippet:', croma.length > 0 ? "Loaded" : "Failed");
    
    // Nykaa
    const p2 = await browser.newPage();
    await p2.goto('https://www.nykaa.com/search/result/?q=lipstick', { waitUntil: 'domcontentloaded' });
    const nykaa = await p2.evaluate(() => {
       const items = document.querySelectorAll('a');
       return Array.from(items).filter(a => a.href.includes('/p/')).length;
    });
    console.log('Nykaa product links found:', nykaa);
    
    // Reliance
    const p3 = await browser.newPage();
    await p3.goto('https://www.reliancedigital.in/search?q=iphone', { waitUntil: 'domcontentloaded' });
    const reliance = await p3.evaluate(() => document.querySelectorAll('.sp').length || document.querySelectorAll('li.grid').length);
    console.log('Reliance products found:', reliance);
    
  } catch(e) {
    console.log('Error:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}
testAll();
