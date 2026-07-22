// @ts-nocheck
import puppeteer from "puppeteer";
import axios from "axios";
import * as cheerio from "cheerio";
import { BaseProvider, ProviderResponse, Product } from "../types";
import { fetchYahooProducts } from "../yahooHelper";

export class FlipkartProvider implements BaseProvider {
  name = "Flipkart";

  async search(query: string, sharedBrowser?: any): Promise<ProviderResponse> {
    let browser = sharedBrowser;
    let localBrowser = false;

    // 1. Try Puppeteer First
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
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
          ] 
        });
        localBrowser = true;
      }
      const page = await browser.newPage();

      await page.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      const products = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('div[data-id]')).slice(0, 15);
        return items.map(el => {
          const titleEl = el.querySelector('a.wjcEIp') || el.querySelector('.wry7YF') || el.querySelector('._396cs4') || el.querySelector('a[title]');
          let title = titleEl ? titleEl.getAttribute('title') || titleEl.textContent?.trim() : null;
          if (!title) {
            const h = el.querySelector('a');
            if (h) title = h.textContent?.trim();
          }
          
          const priceEl = el.querySelector('.Dav2Wg') || el.querySelector('.Nx9n7C') || el.querySelector('._30jeq3') || el.querySelector('div[class*="price"]');
          const origPriceEl = el.querySelector('._3I9aeS') || el.querySelector('.y30uqb');
          const imgEl = el.querySelector('img._396cs4') || el.querySelector('img._2r_T1I') || el.querySelector('img');
          const linkEl = el.querySelector('a._2rp35Z') || el.querySelector('a._1fQZEK') || el.querySelector('a');
          const ratingEl = el.querySelector('._3LWZlK') || el.querySelector('.XQDZHH');
          
          return {
            title,
            priceStr: priceEl ? priceEl.textContent : null,
            origPriceStr: origPriceEl ? origPriceEl.textContent : null,
            image: imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src')) : null,
            link: linkEl ? linkEl.getAttribute('href') : null,
            rating: ratingEl ? ratingEl.textContent?.trim() : null,
          };
        });
      });

      const parsedProducts: Product[] = [];
      products.forEach((item: any) => {
        if (item.title) {
          const price = item.priceStr ? parseInt(item.priceStr.replace(/[^0-9]/g, ""), 10) : 999;
          const originalPrice = item.origPriceStr ? parseInt(item.origPriceStr.replace(/[^0-9]/g, ""), 10) : undefined;
          
          parsedProducts.push({
            id: `flp-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title,
            brand: item.title.split(" ")[0],
            price,
            originalPrice,
            discount: originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined,
            image: item.image || "https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg",
            rating: item.rating || "4.1",
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
    } catch (error: any) {
      console.warn("Flipkart Puppeteer failed:", error.message);
      if (localBrowser && browser) {
        try { await browser.close(); } catch(e) {}
      }
    }

    // 2. Direct HTTP Axios Search Fallback
    try {
      const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8'
        },
        timeout: 8000
      });

      const $ = cheerio.load(data);
      const parsedProducts: Product[] = [];

      $('div[data-id]').slice(0, 15).each((_, el) => {
        const title = $(el).find('a[title]').attr('title') || $(el).find('a').first().text().trim();
        const priceStr = $(el).find('.Nx9n7C, .Dav2Wg, ._30jeq3').first().text().trim();
        const img = $(el).find('img').first().attr('src');
        const link = $(el).find('a').first().attr('href');

        if (title) {
          const price = priceStr ? parseInt(priceStr.replace(/[^0-9]/g, ""), 10) : 999;
          parsedProducts.push({
            id: `flp-${Math.random().toString(36).substr(2, 9)}`,
            title,
            brand: title.split(" ")[0],
            price,
            image: img || "https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg",
            marketplace: "Flipkart",
            productUrl: link?.startsWith("http") ? link : `https://www.flipkart.com${link}`,
            availability: true,
            rating: "4.1"
          });
        }
      });

      if (parsedProducts.length > 0) return { products: parsedProducts };
    } catch (e: any) {
      console.warn("Flipkart Direct Axios failed:", e.message);
    }

    // 3. Final Yahoo Fallback
    const fallbackProducts = await fetchYahooProducts("flipkart.com", "Flipkart", query);
    return { products: fallbackProducts };
  }
}
