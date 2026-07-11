import { NextResponse } from "next/server";
import { AmazonProvider } from "@/lib/providers/AmazonProvider";
import { FlipkartProvider } from "@/lib/providers/FlipkartProvider";
import { MyntraProvider } from "@/lib/providers/MyntraProvider";
import { AjioProvider } from "@/lib/providers/AjioProvider";
import { CromaProvider } from "@/lib/providers/CromaProvider";
import { NykaaProvider } from "@/lib/providers/NykaaProvider";
import { RelianceProvider } from "@/lib/providers/RelianceProvider";
import { MeeshoProvider } from "@/lib/providers/MeeshoProvider";
import { Product, GroupedProduct } from "@/lib/types";
import puppeteer from 'puppeteer';

function normalizeTitle(title: string): string {
  let t = title.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const stopWords = ["tws", "true", "wireless", "earbuds", "earphones", "bluetooth", "headset", "headphones", "with", "mic", "black", "white", "blue", "red", "green"];
  t = t.split(" ").filter(word => !stopWords.includes(word)).join(" ");
  return t.slice(0, 30);
}

async function runInChunks<T, R>(items: T[], chunkSize: number, asyncFn: (item: T) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.allSettled(chunk.map(asyncFn));
    results.push(...chunkResults);
  }
  return results;
}

export async function POST(request: Request) {
  let q = "";
  try {
    const body = await request.json();
    q = body.query;
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!q) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  let providers = [
    new AmazonProvider(),
    new FlipkartProvider(),
    new MyntraProvider(),
    new AjioProvider(),
    new CromaProvider(),
    new NykaaProvider(),
    new RelianceProvider(),
    new MeeshoProvider(),
  ];

  // Smart Category Detection
  const queryLower = q.toLowerCase();
  const fashionKeywords = ["shirt", "tshirt", "jeans", "pant", "shoe", "sneaker", "dress", "kurti", "top", "saree", "watch", "perfume", "makeup", "lipstick"];
  const digitalKeywords = ["phone", "mobile", "laptop", "macbook", "iphone", "ipad", "tablet", "tv", "television", "earbud", "headphone", "tws", "speaker", "camera", "monitor"];

  const isFashion = fashionKeywords.some(kw => queryLower.includes(kw));
  const isDigital = digitalKeywords.some(kw => queryLower.includes(kw));

  if (isDigital && !isFashion) {
    // If it's purely digital, remove fashion-only apps
    providers = providers.filter(p => !["Myntra", "Ajio", "Nykaa", "Meesho"].includes(p.name));
  } else if (isFashion && !isDigital) {
    // If it's purely fashion, remove electronics-only apps
    providers = providers.filter(p => !["Croma", "Reliance Digital"].includes(p.name));
  }

  let sharedBrowser;
  try {
    sharedBrowser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"] });

    // Run in chunks of 3 to prevent CPU starvation on local machines
    const responses = await runInChunks(providers, 3, (provider) => provider.search(q, sharedBrowser));

    let allProducts: Product[] = [];
    responses.forEach((result, idx) => {
      const providerName = providers[idx].name;
      if (result.status === "fulfilled" && result.value?.products) {
        allProducts = [...allProducts, ...result.value.products];
        console.log(`${providerName}: ${result.value.products.length}`);
      } else {
        console.log(`${providerName}: 0`);
      }
    });
    console.log(`Merged: ${allProducts.length}`);

    if (allProducts.length === 0) {
      return NextResponse.json({
        success: true,
        products: [],
        message: "No products found."
      });
    }

    const normalizeTitle = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    // --- Advanced Fuzzy Grouping ---
    const groups: GroupedProduct[] = [];

    const calculateSimilarity = (title1: string, title2: string) => {
      const words1 = title1.split(' ');
      const words2 = title2.split(' ');
      if (words1.length === 0 || words2.length === 0) return 0;
      const intersection = words1.filter(w => words2.includes(w));
      // Use Jaccard similarity or overlap ratio
      return intersection.length / Math.min(words1.length, words2.length);
    };

    for (const p of allProducts) {
      if (!p.title) continue;
      const normTitle = normalizeTitle(p.title);
      const brand = p.brand?.toLowerCase() || 'unknown';
      
      let matchedGroup = groups.find(g => {
        const gBrand = g.brand.toLowerCase();
        // Brand must match (if known) or at least one is unknown
        if (brand !== 'unknown' && gBrand !== 'unknown' && brand !== gBrand) return false;
        
        // Title similarity must be high enough to match, but loose enough to catch Yahoo results
        const sim = calculateSimilarity(normTitle, normalizeTitle(g.title));
        return sim > 0.35; // Lowered from 0.55 to 0.35 to help Yahoo results merge and inherit images
      });

      if (matchedGroup) {
        if (!matchedGroup.image && p.image) {
          matchedGroup.image = p.image;
        }
        if (p.price < matchedGroup.lowestPrice) matchedGroup.lowestPrice = p.price;
        if (p.price > matchedGroup.highestPrice) matchedGroup.highestPrice = p.price;
        
        matchedGroup.offers.push({
          marketplace: p.marketplace,
          price: p.price,
          originalPrice: p.originalPrice,
          discount: p.discount,
          productUrl: p.productUrl,
          deliveryDate: p.deliveryDate,
          freeDelivery: p.freeDelivery,
          stockStatus: p.stockStatus
        });
      } else {
        groups.push({
          id: `grp-${Math.random().toString(36).substring(2, 9)}`,
          title: p.title,
          brand: p.brand || "Unknown",
          image: p.image || "",
          lowestPrice: p.price,
          highestPrice: p.price,
          rating: p.rating,
          reviewCount: p.reviewCount,
          batteryLife: p.batteryLife,
          anc: p.anc,
          bluetoothVersion: p.bluetoothVersion,
          offers: [{
            marketplace: p.marketplace,
            price: p.price,
            originalPrice: p.originalPrice,
            discount: p.discount,
            productUrl: p.productUrl,
            deliveryDate: p.deliveryDate,
            freeDelivery: p.freeDelivery,
            stockStatus: p.stockStatus
          }],
          badges: []
        });
      }
    }

    // STRICT MODE VALIDATION
    // Only keep groups that have all required fields. 
    // This perfectly eliminates Yahoo results that didn't match with Amazon/Flipkart images.
    let groupedArray = groups.filter(g => 
      g.title && 
      (g.image || g.offers.some(o => ["Croma", "Reliance Digital", "Nykaa", "Meesho"].includes(o.marketplace))) && 
      g.lowestPrice > 0 && 
      g.offers.length > 0 && 
      g.offers[0].productUrl && 
      g.offers[0].marketplace
    );

    groupedArray.forEach(g => {
      if (g.lowestPrice < 1500) g.badges.push("Low Price");
      if (parseFloat(g.rating || "0") >= 4.2) g.badges.push("Highly Rated");
      if (g.offers.some(o => o.discount && o.discount > 50)) g.badges.push("Best Value");
    });

    groupedArray.sort((a, b) => {
      const ratingA = parseFloat(a.rating || "0");
      const ratingB = parseFloat(b.rating || "0");
      if (ratingA !== ratingB) return ratingB - ratingA;
      return a.lowestPrice - b.lowestPrice;
    });

    if (groupedArray.length === 0) {
      return NextResponse.json({
        success: true,
        results: [], // Using 'results' for the frontend compatibility
        message: "No products found."
      });
    }

    return NextResponse.json({
      success: true,
      query: q,
      count: groupedArray.length,
      results: groupedArray
    });

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ query: q, count: 0, results: [] });
  } finally {
    if (sharedBrowser) {
      await sharedBrowser.close();
    }
  }
}
