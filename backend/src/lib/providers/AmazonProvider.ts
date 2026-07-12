// @ts-nocheck
import puppeteer from "puppeteer";
import { BaseProvider, ProviderResponse, Product } from "../types";

export class AmazonProvider implements BaseProvider {
  name = "Amazon";

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

      await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      
      const products = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]')).slice(0, 15);
        return items.map(el => {
          const titleEl = el.querySelector('h2');
          const priceEl = el.querySelector('.a-price-whole');
          const origPriceEl = el.querySelector('.a-text-price .a-offscreen');
          const imgEl = el.querySelector('img.s-image');
          const linkEl = el.querySelector('a.a-link-normal.s-no-outline') || el.querySelector('h2 a');
          const ratingEl = el.querySelector('.a-icon-alt');
          
          return {
            title: titleEl ? titleEl.textContent?.trim() : null,
            priceStr: priceEl ? priceEl.textContent : null,
            origPriceStr: origPriceEl ? origPriceEl.textContent : null,
            image: imgEl ? imgEl.getAttribute('src') : null,
            link: linkEl ? linkEl.getAttribute('href') : null,
            rating: ratingEl ? ratingEl.textContent?.split(" ")[0] : null,
          };
        });
      });

      const parsedProducts: Product[] = [];
      products.forEach((item: any) => {
        if (item.title && item.priceStr && item.image) {
          const price = parseInt(item.priceStr.replace(/[^0-9]/g, ""), 10);
          const originalPrice = item.origPriceStr ? parseInt(item.origPriceStr.replace(/[^0-9]/g, ""), 10) : undefined;
          
          parsedProducts.push({
            id: `amz-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title,
            brand: item.title.split(" ")[0],
            price,
            originalPrice,
            discount: originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined,
            image: item.image,
            rating: item.rating || undefined,
            marketplace: "Amazon",
            productUrl: item.link?.startsWith("http") ? item.link : `https://www.amazon.in${item.link}`,
            availability: true,
          });
        }
      });

      return { products: parsedProducts };
    } catch (error: any) {
      console.error("AmazonProvider Error:", error.message);
      return { products: [], error: error.message };
    } finally {
      if (localBrowser && browser) await browser.close();
    }
  }
}
