import { Product } from "../types";
import { exec } from "child_process";
import path from "path";

export class AjioProvider {
  name = "Ajio";
  async search(query: string): Promise<{ products: Product[] }> {
    return new Promise((resolve) => {
      const scriptPath = path.join(process.cwd(), "scripts", "stealth-ajio.js");
      
      exec(`node "${scriptPath}" "${query}"`, { timeout: 45000 }, (error, stdout, stderr) => {
        if (error) {
          console.error("Ajio stealth error:", error);
          resolve({ products: [] });
          return;
        }
        
        try {
          const lines = stdout.split('\\n').map(l => l.trim()).filter(l => l);
          const jsonStr = lines[lines.length - 1]; // The last line is the JSON array
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
          
          resolve({ products: formatted });
        } catch (e) {
          console.error("Ajio JSON parse error:", e);
          resolve({ products: [] });
        }
      });
    });
  }
}
