// @ts-nocheck
import express from "express";
const router = express.Router();
import { AmazonProvider } from "../lib/providers/AmazonProvider";
import { FlipkartProvider } from "../lib/providers/FlipkartProvider";
import { MyntraProvider } from "../lib/providers/MyntraProvider";
import { AjioProvider } from "../lib/providers/AjioProvider";
import { CromaProvider } from "../lib/providers/CromaProvider";
import { NykaaProvider } from "../lib/providers/NykaaProvider";
import { RelianceProvider } from "../lib/providers/RelianceProvider";
import { MeeshoProvider } from "../lib/providers/MeeshoProvider";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

async function runInChunks(items, chunkSize, asyncFn) {
  const results = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.allSettled(chunk.map(asyncFn));
    results.push(...chunkResults);
  }
  return results;
}

router.post("/", async (req, res) => {
  const { query: q } = req.body;

  if (!q) {
    return res.status(400).json({ error: "Query required" });
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
  const fashionKeywords = ["shirt", "tshirt", "jeans", "pant", "shoe", "sneaker", "dress", "kurti", "top", "saree", "watch", "perfume", "makeup", "lipstick", "legging", "kurta"];
  const digitalKeywords = ["phone", "mobile", "laptop", "macbook", "iphone", "ipad", "tablet", "tv", "television", "earbud", "headphone", "tws", "speaker", "camera", "monitor", "charger", "mouse", "keyboard"];

  const isFashion = fashionKeywords.some((kw) => queryLower.includes(kw));
  const isDigital = digitalKeywords.some((kw) => queryLower.includes(kw));

  if (isDigital && !isFashion) {
    providers = providers.filter((p) => !["Myntra", "Ajio", "Nykaa", "Meesho"].includes(p.name));
  } else if (isFashion && !isDigital) {
    providers = providers.filter((p) => !["Croma", "Reliance Digital"].includes(p.name));
  }

  let sharedBrowser;
  try {
    sharedBrowser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });
  } catch (err: any) {
    console.warn("Failed to launch shared Puppeteer browser:", err.message);
  }

  try {
    // Run all providers in parallel
    const responses = await Promise.allSettled(providers.map((provider) =>
      provider.search(q, sharedBrowser)
    ));

    let allProducts = [];
    responses.forEach((result, idx) => {
      const providerName = providers[idx].name;
      if (result.status === "fulfilled" && result.value?.products) {
        allProducts = [...allProducts, ...result.value.products];
        console.log(`✅ ${providerName}: ${result.value.products.length} products`);
      } else {
        console.log(`❌ ${providerName}: 0 (${result.reason?.message || "failed"})`);
      }
    });
    console.log(`Total merged: ${allProducts.length}`);

    if (allProducts.length === 0) {
      return res.json({ success: true, results: [], message: "No products found." });
    }

    // --- Fuzzy Grouping ---
    const normalizeTitle = (t) =>
      t.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();

    const calculateSimilarity = (title1, title2) => {
      const words1 = new Set(title1.split(" ").filter((w) => w.length > 2));
      const words2 = new Set(title2.split(" ").filter((w) => w.length > 2));
      if (words1.size === 0 || words2.size === 0) return 0;
      let intersection = 0;
      words1.forEach((w) => { if (words2.has(w)) intersection++; });
      return intersection / Math.min(words1.size, words2.size);
    };

    const groups = [];

    for (const p of allProducts) {
      if (!p.title) continue;
      const normTitle = normalizeTitle(p.title);
      const brand = p.brand?.toLowerCase() || "unknown";

      let matchedGroup = groups.find((g) => {
        const gBrand = g.brand.toLowerCase();
        if (brand !== "unknown" && gBrand !== "unknown" && brand !== gBrand) return false;
        const sim = calculateSimilarity(normTitle, normalizeTitle(g.title));
        return sim > 0.4;
      });

      if (matchedGroup) {
        if (!matchedGroup.image && p.image) matchedGroup.image = p.image;
        if (p.price > 0 && p.price < matchedGroup.lowestPrice) matchedGroup.lowestPrice = p.price;
        if (p.price > matchedGroup.highestPrice) matchedGroup.highestPrice = p.price;

        matchedGroup.offers.push({
          marketplace: p.marketplace,
          price: p.price,
          originalPrice: p.originalPrice,
          discount: p.discount,
          productUrl: p.productUrl,
          deliveryDate: p.deliveryDate,
          freeDelivery: p.freeDelivery,
          stockStatus: p.stockStatus,
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
          offers: [
            {
              marketplace: p.marketplace,
              price: p.price,
              originalPrice: p.originalPrice,
              discount: p.discount,
              productUrl: p.productUrl,
              deliveryDate: p.deliveryDate,
              freeDelivery: p.freeDelivery,
              stockStatus: p.stockStatus,
            },
          ],
          badges: [],
        });
      }
    }

    // Filter: must have a title, a URL, and either an image or at least one valid offer
    const yahooStores = ["Croma", "Reliance Digital", "Nykaa", "Meesho"];
    let groupedArray = groups.filter(
      (g) =>
        g.title &&
        g.offers.length > 0 &&
        g.offers[0].productUrl &&
        (g.image || g.offers.some((o) => yahooStores.includes(o.marketplace)))
    );

    groupedArray.forEach((g) => {
      if (g.lowestPrice > 0 && g.lowestPrice < 1500) g.badges.push("Low Price");
      if (parseFloat(g.rating || "0") >= 4.2) g.badges.push("Highly Rated");
      if (g.offers.some((o) => o.discount && o.discount > 50)) g.badges.push("Best Value");
    });

    groupedArray.sort((a, b) => {
      const ratingA = parseFloat(a.rating || "0");
      const ratingB = parseFloat(b.rating || "0");
      if (ratingA !== ratingB) return ratingB - ratingA;
      return (a.lowestPrice || 9999999) - (b.lowestPrice || 9999999);
    });

    if (groupedArray.length === 0) {
      return res.json({ success: true, results: [], message: "No products found." });
    }

    return res.json({
      success: true,
      query: q,
      count: groupedArray.length,
      results: groupedArray,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return res.json({ query: q, count: 0, results: [] });
  } finally {
    if (sharedBrowser) {
      await sharedBrowser.close();
    }
  }
});

export default router;
