import axios from "axios";
import * as cheerio from "cheerio";
import { BaseProvider, ProviderResponse, Product } from "../types";

export class NykaaProvider implements BaseProvider {
  name = "Nykaa";

  async search(query: string, sharedBrowser?: any): Promise<ProviderResponse> {
    try {
      const searchUrl = "https://search.yahoo.com/search?p=site:" + "nykaa.com" + "+" + encodeURIComponent(query) + "&fr=yfp-t";
      
      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 10000
      });

      const $ = cheerio.load(data);
      const parsedProducts: Product[] = [];
      const results = $('.algo-sr');

      results.each((i, el) => {
        if (parsedProducts.length >= 15) return;
        
        const titleEl = $(el).find('.compTitle a');
        let rawTitle = titleEl.text() || titleEl.attr('aria-label') || "";
        let rawLink = titleEl.attr('href') || "";
        const snippetText = $(el).find('.compTitle').next().text() || $(el).find('.fc-falcon').text() || "";
        
        let title = rawTitle.replace(/^.*?https?:\/\/[^\s]+(?:\s*[›>]\s*[^\s]+)*\s*/i, '').trim();
        title = title.replace(/^.*?www\.[^\s]+(?:\s*[›>]\s*[^\s]+)*\s*/i, '').trim();
        title = title.replace(/[^a-zA-Z0-9 \-]/g, '').trim();
        if (title.endsWith('Buy')) title = title.substring(0, title.length - 3).trim();
        if (title.length < 5) return;
        
        let link = rawLink;
        if (link.includes('RU=')) {
           try {
              link = decodeURIComponent(link.split('RU=')[1].split('/')[0]);
           } catch(e) {}
        }
        
        if (!link.includes("nykaa.com")) return;
        
        let price = 0;
        const priceMatch = snippetText.match(/(?:₹|Rs\.?)\s*([0-9,]+)/i) || title.match(/(?:₹|Rs\.?)\s*([0-9,]+)/i);
        if (priceMatch) {
          price = parseInt(priceMatch[1].replace(/[^0-9]/g, ""), 10);
        }
        
        const brandStr = title.split(" ")[0];
        
        parsedProducts.push({
          id: `nyk-${Math.random().toString(36).substr(2, 9)}`,
          title: title.substring(0, 80),
          brand: brandStr.length > 2 ? brandStr : "Unknown",
          price,
          image: "", // Empty string means no fake image. Grouping will rely on Amazon/Flipkart/Myntra for the image!
          marketplace: "Nykaa",
          productUrl: link.startsWith("http") ? link : `https://www.nykaa.com${link}`,
          availability: true,
          rating: (snippetText.match(/([3-4]\.[0-9])\s*star/i)?.[1]) || undefined
        });
      });

      return { products: parsedProducts };
    } catch (error: any) {
      console.error("NykaaProvider Error:", error.message);
      return { products: [], error: error.message };
    }
  }
}
