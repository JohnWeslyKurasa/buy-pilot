// @ts-nocheck
import axios from "axios";
import { BaseProvider, ProviderResponse, Product } from "../types";
import { fetchYahooProducts } from "../yahooHelper";

export class AjioProvider implements BaseProvider {
  name = "Ajio";

  async search(query: string): Promise<ProviderResponse> {
    // 1. Try Direct Ajio API Search
    try {
      const apiUrl = `https://www.ajio.com/api/search?fields=SITE&text=${encodeURIComponent(query)}&pageSize=15`;
      const { data } = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
        },
        timeout: 8000
      });

      if (data && data.products && Array.isArray(data.products) && data.products.length > 0) {
        const parsedProducts: Product[] = data.products.slice(0, 15).map((p: any) => ({
          id: `aji-${p.code || Math.random().toString(36).substr(2, 9)}`,
          title: `${p.fnlColorVariantData?.brandName || "Ajio"} ${p.name || query}`,
          brand: p.fnlColorVariantData?.brandName || "Ajio",
          price: p.price?.value || 999,
          originalPrice: p.wasPriceData?.value,
          discount: p.discountPercent ? parseInt(p.discountPercent, 10) : undefined,
          image: p.images?.[0]?.url || "https://assets.ajio.com/static/img/Ajio-Logo.svg",
          marketplace: "Ajio",
          productUrl: p.url ? `https://www.ajio.com${p.url}` : `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`,
          availability: true,
          rating: p.averageRating ? p.averageRating.toString() : "4.0"
        }));

        return { products: parsedProducts };
      }
    } catch (e: any) {
      console.warn("Ajio Direct API Search failed:", e.message);
    }

    // 2. Fallback to Yahoo Search
    const fallbackProducts = await fetchYahooProducts("ajio.com", "Ajio", query);
    return { products: fallbackProducts };
  }
}
