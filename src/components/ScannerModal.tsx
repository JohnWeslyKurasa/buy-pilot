"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScannerModal({ 
  onClose, 
  onScan 
}: { 
  onClose: () => void; 
  onScan: (text: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Success
        scanner.clear();
        onScan(decodedText);
      },
      (err) => {
        // Error (fires constantly when no code is detected, so we don't spam state)
        // console.log(err);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Camera className="w-5 h-5 text-primary" />
            Scan Barcode or QR
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <p className="text-sm text-muted-foreground text-center mb-6">
            Point your camera at a product's barcode to instantly search for it across all marketplaces.
          </p>
          
          <div id="reader" className="w-full rounded-xl overflow-hidden border-2 border-primary/20"></div>
          
          {error && (
            <div className="mt-4 text-sm text-red-500 font-medium bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
