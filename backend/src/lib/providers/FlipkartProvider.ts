// @ts-nocheck
import puppeteer from "puppeteer";
import { BaseProvider, ProviderResponse, Product } from "../types";
import { fetchYahooProducts } from "../yahooHelper";

export class FlipkartProvider implements BaseProvider {
  name = "Flipkart";

  async search(query: string, sharedBrowser?: any): Promise<ProviderResponse> {
    let browser = sharedBrowser;
    let localBrowser = false;
    try {
      if (!browser) {
        browser = await puppeteer.launch({ 
          headless: true, 
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
          args: [
            "--no-sandbox", 
            "--disable-setuid-sandbox", 
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-blink-features=AutomationControlled",
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          ] 
        });
        localBrowser = true;
      }
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
        else req.continue();
      });

      await page.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 12000 });
      
      const products = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('div[data-id]')).slice(0, 15);
        return items.map(el => {
          const titleEl = el.querySelector('a.wjcEIp') || el.querySelector('.wry7YF') || el.querySelector('._396cs4');
          let title = titleEl ? titleEl.getAttribute('title') || titleEl.textContent?.trim() : null;
          if (!title) {
            const h = el.querySelector('a');
            if (h) title = h.textContent?.trim();
          }
          
          const priceEl = el.querySelector('._30jeq3') || el.querySelector('.Nx9n7C');
          const origPriceEl = el.querySelector('._3I9aeS') || el.querySelector('.y30uqb');
          const imgEl = el.querySelector('img._396cs4') || el.querySelector('img._2r_T1I') || el.querySelector('img');
          const linkEl = el.querySelector('a._2rp35Z') || el.querySelector('a._1fQZEK') || el.querySelector('a');
          const ratingEl = el.querySelector('._3LWZlK') || el.querySelector('.XQDZHH');
          
          return {
            title,
            priceStr: priceEl ? priceEl.textContent : null,
            origPriceStr: origPriceEl ? origPriceEl.textContent : null,
            image: imgEl ? imgEl.getAttribute('src') : null,
            link: linkEl ? linkEl.getAttribute('href') : null,
            rating: ratingEl ? ratingEl.textContent?.trim() : null,
          };
        });
      });

      const parsedProducts: Product[] = [];
      products.forEach((item: any) => {
        if (item.title && item.priceStr && item.image) {
          const price = parseInt(item.priceStr.replace(/[^0-9]/g, ""), 10);
          const originalPrice = item.origPriceStr ? parseInt(item.origPriceStr.replace(/[^0-9]/g, ""), 10) : undefined;
          
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
            productUrl: item.link?.startsWith("http") ? item.link : `https://www.flipkart.com${item.link}`,
            availability: true,
          });
        }
      });

      if (localBrowser && browser) await browser.close();
      
      if (parsedProducts.length > 0) {
        return { products: parsedProducts };
      }
      throw new Error("No products parsed via Puppeteer");

    } catch (error: any) {
      console.warn("Flipkart Puppeteer failed, falling back to Yahoo Search:", error.message);
      if (localBrowser && browser) {
        try { await browser.close(); } catch(e) {}
      }
      const fallbackProducts = await fetchYahooProducts("flipkart.com", "Flipkart", query);
      return { products: fallbackProducts };
    }
  }
}
