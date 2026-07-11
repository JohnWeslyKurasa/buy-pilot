"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { GroupedProduct } from "@/lib/types";
import { useState, useEffect } from "react";

export interface FilterState {
  sortBy: string;
  marketplaces: string[];
  brands: string[];
  minRating: number;
}

export function FilterSidebar({ results, onFilterChange, className = "" }: { results: GroupedProduct[], onFilterChange: (filters: FilterState) => void, className?: string }) {
  
  const uniqueBrands = Array.from(new Set(results.map(r => r.brand).filter(b => b && b !== "Unknown"))).slice(0, 10);
  
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "Relevance",
    marketplaces: [],
    brands: [],
    minRating: 0,
  });

  // Notify parent on change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleCheckbox = (category: keyof FilterState, value: string, checked: boolean) => {
    if (category === "sortBy") {
      setFilters(prev => ({ ...prev, sortBy: value }));
      return;
    }
    
    if (category === "minRating") {
      const numVal = parseInt(value[0]);
      setFilters(prev => ({ ...prev, minRating: checked ? numVal : 0 }));
      return;
    }

    setFilters(prev => {
      const arr = prev[category] as string[];
      if (checked) {
        return { ...prev, [category]: [...arr, value] };
      } else {
        return { ...prev, [category]: arr.filter(v => v !== value) };
      }
    });
  };

  const filterCategories = [
    {
      title: "Sort By",
      key: "sortBy",
      type: "radio",
      options: ["Relevance", "Lowest Price", "Highest Rating"]
    },
    {
      title: "Marketplace",
      key: "marketplaces",
      type: "checkbox",
      options: ["Amazon", "Flipkart", "Myntra", "Ajio", "Croma", "Nykaa", "Reliance Digital", "Meesho"]
    }
  ];

  if (uniqueBrands.length > 0) {
    filterCategories.push({
      title: "Brand",
      key: "brands",
      type: "checkbox",
      options: uniqueBrands as string[]
    });
  }

  filterCategories.push({
    title: "Rating",
    key: "minRating",
    type: "radio",
    options: ["4+ & above", "3+ & above", "2+ & above"]
  });

  return (
    <aside className={`w-full lg:w-64 flex-shrink-0 overflow-y-auto h-[calc(100vh-140px)] lg:pr-6 pb-20 no-scrollbar ${className}`}>
      
      {filterCategories.map((category, idx) => (
        <div key={idx} className="mb-6 border-b border-border/50 pb-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center justify-between cursor-pointer">
            {category.title} <ChevronDown className="w-4 h-4" />
          </h3>
          <div className="space-y-3">
            {category.options.map((option, i) => {
              const isChecked = 
                category.key === "sortBy" ? filters.sortBy === option :
                category.key === "minRating" ? filters.minRating === parseInt(option[0]) :
                (filters[category.key as keyof FilterState] as string[]).includes(option);

              return (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type={category.type === "radio" ? "radio" : "checkbox"} 
                    name={category.key}
                    checked={isChecked}
                    onChange={(e) => handleCheckbox(category.key as keyof FilterState, option, e.target.checked)}
                    className="w-4 h-4 rounded-sm border-muted-foreground/30 text-primary focus:ring-primary cursor-pointer accent-primary" 
                  />
                  <span className="text-sm text-foreground/80 group-hover:text-primary transition-colors">{option}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
