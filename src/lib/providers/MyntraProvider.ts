import axios from "axios";
import { BaseProvider, ProviderResponse, Product } from "../types";

export class MyntraProvider implements BaseProvider {
  name = "Myntra";

  async search(query: string, sharedBrowser?: any): Promise<ProviderResponse> {
    try {
      const { data } = await axios.get(`https://www.myntra.com/${encodeURIComponent(query).replace(/%20/g, '-')}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html'
        },
        timeout: 10000
      });
      
      const parsedProducts: Product[] = [];
      
      const nameMatch = [...data.matchAll(/"productName":"(.*?)"/g)];
      const imgMatch = [...data.matchAll(/"searchImage":"(.*?)"/g)];
      const priceMatch = [...data.matchAll(/"price":([0-9]+)/g)];
      const origPriceMatch = [...data.matchAll(/"mrp":([0-9]+)/g)];
      const ratingMatch = [...data.matchAll(/"rating":([0-9.]+)/g)];
      const brandMatch = [...data.matchAll(/"brand":"(.*?)"/g)];
      const idMatch = [...data.matchAll(/"productId":([0-9]+)/g)];

      for (let i = 0; i < Math.min(15, nameMatch.length); i++) {
        if (!nameMatch[i] || !imgMatch[i] || !priceMatch[i]) continue;
        
        const title = nameMatch[i][1];
        const price = parseInt(priceMatch[i][1], 10);
        const originalPrice = origPriceMatch[i] ? parseInt(origPriceMatch[i][1], 10) : undefined;
        const brand = brandMatch[i] ? brandMatch[i][1] : title.split(" ")[0];
        
        let imageUrl = imgMatch[i][1].replace(/\\u002F/g, '/');
        if (imageUrl.startsWith('http://')) {
          imageUrl = imageUrl.replace('http://', 'https://');
        }
        
        parsedProducts.push({
          id: `myn-${idMatch[i]?.[1] || Math.random().toString(36).substr(2, 9)}`,
          title: title,
          brand: brand,
          price,
          originalPrice,
          discount: originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined,
          image: imageUrl,
          rating: ratingMatch[i]?.[1],
          marketplace: "Myntra",
          productUrl: idMatch[i] ? `https://www.myntra.com/${idMatch[i][1]}` : `https://www.myntra.com/${encodeURIComponent(query).replace(/%20/g, '-')}`,
          availability: true,
        });
      }

      return { products: parsedProducts };
    } catch (error: any) {
      console.error("MyntraProvider Error:", error.message);
      return { products: [], error: error.message };
    }
  }
}
