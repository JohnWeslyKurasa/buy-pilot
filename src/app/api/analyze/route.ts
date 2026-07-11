import { NextResponse } from "next/server";
import { GroupedProduct } from "@/lib/types";

export interface CategoryRecommendation {
  title: string;
  iconType: string;
  product: GroupedProduct;
  colorClass: string;
}

export interface AiAnalysis {
  summary: string;
  recommendations: CategoryRecommendation[];
  pros: string[];
  cons: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, products } = body as { query: string; products: GroupedProduct[] };

    if (!query || !products || products.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const qLower = query.toLowerCase();
    
    // Sort helpers
    const byRating = [...products].sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
    const byPrice = [...products].sort((a, b) => a.lowestPrice - b.lowestPrice);
    const byDiscount = [...products].sort((a, b) => {
      const maxDiscA = Math.max(...a.offers.map(o => o.discount || 0), 0);
      const maxDiscB = Math.max(...b.offers.map(o => o.discount || 0), 0);
      return maxDiscB - maxDiscA;
    });

    const recommendations: CategoryRecommendation[] = [];
    const usedIds = new Set<string>();

    const addRec = (title: string, iconType: string, colorClass: string, product?: GroupedProduct) => {
      if (product && !usedIds.has(product.id) && recommendations.length < 8) {
        recommendations.push({ title, iconType, colorClass, product });
        usedIds.add(product.id);
      }
    };

    // Generic Basics
    addRec("Top Rated", "Trophy", "text-amber-500", byRating[0]);
    addRec("Highest Review Quality", "Star", "text-green-600", byRating[1] || byRating[0]);
    addRec("Best Value (Quality + Price)", "Percent", "text-orange-500", byDiscount[0] || byRating[2]);

    // Domain Specific Logic
    const isTech = /earbud|headphone|phone|watch|laptop|tv|speaker|charger/i.test(qLower);
    const isFashion = /shirt|shoe|cap|pant|dress|wear|sneaker|jacket/i.test(qLower);

    if (isTech) {
      addRec("Best Battery", "Battery", "text-blue-500", products.find(p => p.batteryLife || p.title.match(/hours|mah/i)) || byRating[2]);
      addRec("Best Sound", "Volume2", "text-purple-500", products.find(p => p.title.match(/pro|studio|high-res|anc/i)) || byRating[3]);
      addRec("Best Bass", "Headphones", "text-pink-500", products.find(p => p.title.match(/bass|extra|deep/i)));
      addRec("Best for Gaming", "Gamepad2", "text-red-500", products.find(p => p.title.match(/gaming|low latency/i)));
      addRec("Best for Calls", "PhoneCall", "text-teal-500", products.find(p => p.title.match(/enc|quad mic|clear/i)));
    } else if (isFashion) {
      addRec("Most Stylish", "Sparkles", "text-purple-500", products.find(p => p.title.match(/stylish|trend/i)) || byRating[2]);
      addRec("Premium Pick", "Star", "text-amber-400", byPrice[byPrice.length - 1]); // most expensive
      addRec("Daily Wear", "Sun", "text-blue-400", byRating[3]);
    } else {
      addRec("Premium Pick", "Star", "text-amber-400", byPrice[byPrice.length - 1]);
      addRec("Highly Rated", "ThumbsUp", "text-blue-500", byRating[2]);
    }

    // Fill up to 6 if we don't have enough
    let idx = 0;
    while (recommendations.length < 6 && idx < byRating.length) {
      addRec("Top Alternative", "CheckCircle2", "text-teal-500", byRating[idx]);
      idx++;
    }

    const analysis: AiAnalysis = {
      summary: `Based on your search for "${query}", here are the best products from our cross-marketplace analysis. We've aggregated data to ensure you get the absolute best match for your needs.`,
      recommendations,
      pros: [
        `Lowest price found is ₹${byPrice[0].lowestPrice.toLocaleString("en-IN")}`,
        `Highest rated option is ${byRating[0].brand} with ${byRating[0].rating || 'good'} stars`,
      ],
      cons: [
        `Prices and stock availability can fluctuate rapidly across stores`,
        `Always check seller ratings before final purchase`
      ]
    };

    return NextResponse.json(analysis);

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: "Failed to generate AI analysis" }, { status: 500 });
  }
}
