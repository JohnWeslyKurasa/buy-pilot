// @ts-nocheck
import { exec } from "child_process";
import path from "path";
import { BaseProvider, ProviderResponse, Product } from "../types";
import { fetchYahooProducts } from "../yahooHelper";

export class AjioProvider implements BaseProvider {
  name = "Ajio";
  
  async search(query: string): Promise<ProviderResponse> {
    const runStealth = (): Promise<Product[]> => {
      return new Promise((resolve, reject) => {
        const scriptPath = path.join(process.cwd(), "scripts", "stealth-ajio.js");
        exec(`node "${scriptPath}" "${query}"`, { timeout: 20000 }, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          
          try {
            const lines = stdout.split('\n').map(l => l.trim()).filter(l => l);
            const jsonStr = lines[lines.length - 1];
            const rawProducts = JSON.parse(jsonStr);
            
            const formatted: Product[] = rawProducts.map((p: any) => ({
              id: `aji-${Math.random().toString(36).substr(2, 9)}`,
              title: p.title,
              brand: p.brand || p.title.split(" ")[0] || "Ajio",
              price: p.price,
              originalPrice: p.originalPrice,
              discount: p.discount,
              image: p.image,
              marketplace: "Ajio",
              productUrl: p.productUrl || `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`,
            }));
            
            resolve(formatted);
          } catch (e) {
            reject(e);
          }
        });
      });
    };

    try {
      const products = await runStealth();
      if (products.length > 0) return { products };
      throw new Error("No products returned by Ajio script");
    } catch (e: any) {
      console.warn("Ajio Stealth Scraper failed, falling back to Yahoo Search:", e.message);
      const fallbackProducts = await fetchYahooProducts("ajio.com", "Ajio", query);
      return { products: fallbackProducts };
    }
  }
}
