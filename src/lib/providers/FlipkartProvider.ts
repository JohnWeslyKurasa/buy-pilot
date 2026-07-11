import puppeteer from "puppeteer";
import { BaseProvider, ProviderResponse, Product } from "../types";

export class FlipkartProvider implements BaseProvider {
  name = "Flipkart";

  async search(query: string, sharedBrowser?: any): Promise<ProviderResponse> {
    let browser = sharedBrowser;
    let localBrowser = false;
    try {
      if (!browser) {
        browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"] });
        localBrowser = true;
      }
      const page = await browser.newPage();
      
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
        else req.continue();
      });

      await page.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      
      const products = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('div[data-id]')).slice(0, 15);
        return items.map(el => {
          const imgEl = el.querySelector('img');
          const linkEl = el.querySelector('a');
          const textMatches = el.innerText.split('\\n').map(t => t.trim()).filter(t => t.length > 0);
          const priceMatches = el.innerText.match(/₹([0-9,]+)/g);
          
          return {
            title: textMatches.length > 1 ? textMatches[1] : textMatches[0],
            priceStr: priceMatches && priceMatches.length > 0 ? priceMatches[0] : null,
            origPriceStr: priceMatches && priceMatches.length > 1 ? priceMatches[1] : null,
            image: imgEl ? imgEl.getAttribute('src') : null,
            link: linkEl ? linkEl.getAttribute('href') : null,
            rating: el.innerText.match(/(\\d\\.\\d)\\s*★/) ? el.innerText.match(/(\\d\\.\\d)\\s*★/)[1] : null
          };
        });
      });

      const parsedProducts: Product[] = [];
      products.forEach((item: any) => {
        if (item.title && item.priceStr && item.image && item.link) {
          const rawPrice = item.priceStr.replace(/,/g, '');
          const priceMatch = rawPrice.match(/(\d+)/);
          const price = priceMatch ? parseInt(priceMatch[0], 10) : 0;
          
          const rawOrigPrice = item.origPriceStr ? item.origPriceStr.replace(/,/g, '') : '';
          const origMatch = rawOrigPrice.match(/(\d+)/);
          const originalPrice = origMatch ? parseInt(origMatch[0], 10) : undefined;
          
          parsedProducts.push({
            id: `flp-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title,
            brand: item.title.split(" ")[0],
            price,
            originalPrice,
            discount: originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined,
            image: item.image,
            rating: item.rating || undefined,
            marketplace: "Flipkart",
            productUrl: `https://www.flipkart.com${item.link}`,
            availability: true,
          });
        }
      });

      return { products: parsedProducts };
    } catch (error: any) {
      console.error("FlipkartProvider Error:", error.message);
      return { products: [], error: error.message };
    } finally {
      if (localBrowser && browser) await browser.close();
    }
  }
}
