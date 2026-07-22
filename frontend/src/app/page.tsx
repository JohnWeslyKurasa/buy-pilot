"use client";


import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { SearchHero } from "@/components/SearchHero";
import { SearchHeader } from "@/components/SearchHeader";
import { HomeHeader } from "@/components/HomeHeader";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { LoadingExperience } from "@/components/LoadingExperience";
import { ProductResults } from "@/components/ProductResults";
import { AiSummary } from "@/components/AiSummary";
import { CompareModal } from "@/components/CompareModal";
import { GroupedProduct } from "@/lib/types";
import { AiAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<GroupedProduct[] | null>(null);
  const [filteredResults, setFilteredResults] = useState<GroupedProduct[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setResults(null);
    setFilteredResults(null);
    setAiAnalysis(null);
    setCompareIds([]);
    setShowCompare(false);
    
    try {
      let rawUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      if (rawUrl.endsWith('/')) rawUrl = rawUrl.slice(0, -1);
      const baseUrl = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

      // 1. Fetch Grouped Real Products
      const searchRes = await fetch(`${baseUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!searchRes.ok) {
        throw new Error(`API error: ${searchRes.status} ${searchRes.statusText}`);
      }

      const data = await searchRes.json();
      
      const products: GroupedProduct[] = data.results || [];
      setResults(data.results);
      setFilteredResults(data.results);

      // 2. Pass to AI for deep analysis
      if (products.length > 0) {
        const analyzeRes = await fetch(`${baseUrl}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, products })
        });
        
        if (analyzeRes.ok) {
          const analyzeData = await analyzeRes.json();
          setAiAnalysis(analyzeData);
        }
      }
      
      setIsSearching(false);
      
    } catch (error) {
      console.error("Search pipeline failed:", error);
      setIsSearching(false);
      setResults([]);
    }
  };

  // Apply filters whenever results or activeFilters change
  useEffect(() => {
    if (!results) return;
    if (!activeFilters) {
      setFilteredResults(results);
      return;
    }

    let current = [...results];

    // Filter by Brand
    if (activeFilters.brands.length > 0) {
      current = current.filter(p => activeFilters.brands.includes(p.brand));
    }

    // Filter by Marketplace
    if (activeFilters.marketplaces.length > 0) {
      current = current.filter(p => p.offers.some(o => activeFilters.marketplaces.includes(o.marketplace)));
    }

    // Filter by Rating
    if (activeFilters.minRating > 0) {
      current = current.filter(p => parseFloat(p.rating || "0") >= activeFilters.minRating);
    }

    // Sort
    if (activeFilters.sortBy === "Lowest Price") {
      current.sort((a, b) => a.lowestPrice - b.lowestPrice);
    } else if (activeFilters.sortBy === "Highest Rating") {
      current.sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
    } else {
      // Relevance (default)
    }

    setFilteredResults(current);
  }, [results, activeFilters]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 4) {
        alert("You can compare up to 4 items at a time.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const comparedProducts = results?.filter(p => compareIds.includes(p.id)) || [];

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-foreground flex flex-col relative overflow-hidden font-sans">
      
      {(!isSearching && !results) ? (
        <>
          {/* Default Hero State */}
          <HomeHeader />
          <div className="flex-1 flex items-center justify-center -mt-20">
            <SearchHero onSearch={handleSearch} />
          </div>
        </>
      ) : (
        <>
          {/* Active Search State with Google Shopping Style */}
          <SearchHeader initialQuery={searchQuery} onSearch={handleSearch} />
          
          <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row relative">
            
            {isSearching ? (
              <LoadingExperience isSearching={isSearching} query={searchQuery} />
            ) : (
              filteredResults !== null && (
                <>
                  <div className="hidden lg:block w-72 shrink-0 p-6 border-r border-border/40 bg-white shadow-sm z-10 sticky top-0 h-screen overflow-y-auto pt-6 pb-32">
                    <FilterSidebar results={results || []} onFilterChange={setActiveFilters} />
                  </div>
                  
                  <div className="flex-1 p-4 lg:p-8 overflow-y-auto pb-32">
                    {/* Mobile Filters Toggle */}
                    <div className="lg:hidden flex justify-end mb-6">
                      <Button onClick={() => setShowMobileFilters(true)} variant="outline" className="rounded-full shadow-sm bg-white border-border text-foreground hover:bg-muted transition-all">
                        <Filter className="w-4 h-4 mr-2" /> 
                        Filter & Sort
                      </Button>
                    </div>

                    {/* Mobile Filters Drawer/Modal */}
                    {showMobileFilters && (
                      <div className="fixed inset-0 z-[100] bg-white flex flex-col lg:hidden animate-in slide-in-from-bottom-full">
                        <div className="flex items-center justify-between p-4 border-b border-border/50 sticky top-0 bg-white z-10 shadow-sm">
                          <h2 className="text-xl font-bold text-foreground">Filter & Sort</h2>
                          <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)} className="rounded-full">
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                          <FilterSidebar results={results || []} onFilterChange={setActiveFilters} className="w-full h-auto !pb-6" />
                        </div>
                        <div className="p-4 border-t border-border/50 bg-white sticky bottom-0">
                          <Button className="w-full rounded-xl py-6 text-base font-bold shadow-md" onClick={() => setShowMobileFilters(false)}>
                            Show Results
                          </Button>
                        </div>
                      </div>
                    )}

                    {aiAnalysis && <AiSummary analysis={aiAnalysis} />}
                    <ProductResults 
                      results={filteredResults} 
                      onToggleCompare={toggleCompare} 
                      compareIds={compareIds} 
                    />
                  </div>
                </>
              )
            )}
            
          </div>
        </>
      )}

      {/* Compare Floating Dock */}
      {compareIds.length > 0 && !showCompare && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-2xl border border-primary/20 px-6 py-3 flex items-center gap-4 z-40 animate-in slide-in-from-bottom-10">
          <span className="font-semibold text-sm">{compareIds.length} items selected</span>
          <Button onClick={() => setShowCompare(true)} className="rounded-full shadow-md">
            Compare Now
          </Button>
          <button onClick={() => setCompareIds([])} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && (
        <CompareModal 
          products={comparedProducts} 
          onClose={() => setShowCompare(false)} 
          onRemove={toggleCompare} 
        />
      )}

    </main>
  );
}
