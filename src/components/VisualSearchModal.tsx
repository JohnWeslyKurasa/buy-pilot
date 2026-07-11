"use client";

import { useState, useRef } from "react";
import { X, Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VisualSearchModal({ 
  onClose, 
  onSearch 
}: { 
  onClose: () => void; 
  onSearch: (query: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);

      try {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 })
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to analyze image");
        }

        if (data.query) {
          onSearch(data.query);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Camera className="w-5 h-5 text-primary" />
            Visual Search
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full" disabled={loading}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          {!preview ? (
            <>
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <Camera className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground text-center">Take a photo to search</h3>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Point your camera at any product, and our AI will identify it and search across all marketplaces instantly.
              </p>
              
              <div className="flex gap-4 w-full">
                <Button 
                  className="flex-1 rounded-xl h-14" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Take Photo
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="relative w-full h-64 rounded-2xl overflow-hidden border-4 border-primary/20 mb-6">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                {loading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="font-semibold animate-pulse">Analyzing product...</p>
                  </div>
                )}
              </div>
              {error && (
                <div className="w-full text-sm text-red-500 font-medium bg-red-50 px-4 py-3 rounded-xl mb-4 border border-red-100">
                  {error}
                </div>
              )}
              {error && (
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl h-12" 
                  onClick={() => { setPreview(null); setError(null); }}
                >
                  Try Again
                </Button>
              )}
            </>
          )}

          {/* Hidden File Input configured to open native camera on mobile */}
          <input 
            type="file" 
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
