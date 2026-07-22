// @ts-nocheck
import puppeteer from "puppeteer";
import axios from "axios";
import * as cheerio from "cheerio";
import { BaseProvider, ProviderResponse, Product } from "../types";
import { fetchYahooProducts } from "../yahooHelper";

export class AmazonProvider implements BaseProvider {
  name = "Amazon";

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
      
      await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
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
            image: imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-image-latency')) : null,
            link: linkEl ? linkEl.getAttribute('href') : null,
            rating: ratingEl ? ratingEl.textContent?.split(" ")[0] : null,
          };
        });
      });

      const parsedProducts: Product[] = [];
      products.forEach((item: any) => {
        if (item.title && item.priceStr) {
          const price = parseInt(item.priceStr.replace(/[^0-9]/g, ""), 10);
          const originalPrice = item.origPriceStr ? parseInt(item.origPriceStr.replace(/[^0-9]/g, ""), 10) : undefined;
          
          parsedProducts.push({
            id: `amz-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title,
            brand: item.title.split(" ")[0],
            price: price || 999,
            originalPrice,
            discount: originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined,
            image: item.image || "https://images-na.ssl-images-amazon.com/images/G/31/social_share/amazon_logo._CB633266945_.png",
            rating: item.rating || "4.2",
            marketplace: "Amazon",
            productUrl: item.link?.startsWith("http") ? item.link : `https://www.amazon.in${item.link}`,
            availability: true,
          });
        }
      });

      if (localBrowser && browser) await browser.close();
      
      if (parsedProducts.length > 0) {
        return { products: parsedProducts };
      }
    } catch (error: any) {
      console.warn("Amazon Puppeteer failed:", error.message);
      if (localBrowser && browser) {
        try { await browser.close(); } catch(e) {}
      }
    }

    // 2. Direct HTTP Axios Search Fallback
    try {
      const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
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

      $('.s-result-item[data-component-type="s-search-result"]').slice(0, 15).each((_, el) => {
        const title = $(el).find('h2').text().trim();
        const priceStr = $(el).find('.a-price-whole').first().text().trim();
        const img = $(el).find('img.s-image').attr('src');
        const link = $(el).find('h2 a').attr('href') || $(el).find('a.a-link-normal').attr('href');

        if (title && priceStr) {
          const price = parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
          parsedProducts.push({
            id: `amz-${Math.random().toString(36).substr(2, 9)}`,
            title,
            brand: title.split(" ")[0],
            price: price || 999,
            image: img || "https://images-na.ssl-images-amazon.com/images/G/31/social_share/amazon_logo._CB633266945_.png",
            marketplace: "Amazon",
            productUrl: link?.startsWith("http") ? link : `https://www.amazon.in${link}`,
            availability: true,
            rating: "4.1"
          });
        }
      });

      if (parsedProducts.length > 0) return { products: parsedProducts };
    } catch (e: any) {
      console.warn("Amazon Direct Axios failed:", e.message);
    }

    // 3. Final Yahoo Fallback
    const fallbackProducts = await fetchYahooProducts("amazon.in", "Amazon", query);
    return { products: fallbackProducts };
  }
}
