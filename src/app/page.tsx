"use client";


import { useState, useEffect } from "react";
import { SearchHero } from "@/components/SearchHero";
import { SearchHeader } from "@/components/SearchHeader";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { LoadingExperience } from "@/components/LoadingExperience";
import { ProductResults } from "@/components/ProductResults";
import { AiSummary } from "@/components/AiSummary";
import { CompareModal } from "@/components/CompareModal";
import { GroupedProduct } from "@/lib/types";
import { AiAnalysis } from "@/app/api/analyze/route";
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
      // 1. Fetch Grouped Real Products
      const searchRes = await fetch(`/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await searchRes.json();
      
      const products: GroupedProduct[] = data.results || [];
      setResults(data.results);
      setFilteredResults(data.results);

      // 2. Pass to AI for deep analysis
      if (products.length > 0) {
        const analyzeRes = await fetch('/api/analyze', {
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
          <header className="w-full h-16 border-b border-border/40 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
            <div className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">BP</div>
              Buy Pilot
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">U</div>
          </header>
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
                  <div className="w-full flex lg:hidden items-center justify-between p-4 border-b bg-white z-20 sticky top-32">
                    <span className="font-bold">Filters</span>
                    <Button variant="outline" size="sm" onClick={() => setShowMobileFilters(!showMobileFilters)}>
                      {showMobileFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                  </div>
                  
                  <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 shrink-0 p-6 border-r border-border/40 bg-white shadow-sm z-10 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:pt-6 lg:pb-32`}>
                    <FilterSidebar results={results} onFilterChange={setActiveFilters} />
                  </div>
                  
                  <div className="flex-1 p-2 sm:p-4 lg:p-8 overflow-y-auto pb-32">
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
