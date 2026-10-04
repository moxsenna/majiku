import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Camera, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRCodeScannerProps {
  onScanSuccess: (data: string) => void;
  onScanError?: (error: string) => void;
  locationName?: string;
}

export function QRCodeScanner({ onScanSuccess, onScanError, locationName = "MAJIKU Daycare" }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");

  // Simulate QR scan (in production, use a real QR scanner library like @zxing/browser)
  const handleStartScan = () => {
    setIsScanning(true);
    setScanStatus("scanning");
    
    // Simulate scanning process
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate for demo
      if (success) {
        setScanStatus("success");
        onScanSuccess(`MAJIKU-${Date.now()}-${locationName.replace(/\s/g, "-")}`);
      } else {
        setScanStatus("error");
        onScanError?.("QR Code tidak valid atau tidak terbaca");
      }
      setTimeout(() => {
        setIsScanning(false);
        setScanStatus("idle");
      }, 2000);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Camera Preview Area */}
      <div 
        className={cn(
          "relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden border-4 transition-colors",
          scanStatus === "scanning" && "border-primary animate-pulse",
          scanStatus === "success" && "border-green-500",
          scanStatus === "error" && "border-red-500",
          scanStatus === "idle" && "border-border"
        )}
      >
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
          {scanStatus === "idle" && (
            <div className="text-center">
              <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Arahkan kamera ke QR Code</p>
            </div>
          )}
          {scanStatus === "scanning" && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-2" />
              <p className="text-sm text-primary font-medium">Memindai QR Code...</p>
            </div>
          )}
          {scanStatus === "success" && (
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-green-500 font-medium">QR Code Terverifikasi!</p>
            </div>
          )}
          {scanStatus === "error" && (
            <div className="text-center">
              <XCircle className="w-16 h-16 mx-auto text-red-500 mb-2" />
              <p className="text-sm text-red-500 font-medium">QR Code Tidak Valid</p>
            </div>
          )}
        </div>

        {/* Scan Corner Markers */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg" />
      </div>

      {/* Scan Button */}
      <Button
        size="lg"
        className="w-full h-14 text-lg gap-3"
        onClick={handleStartScan}
        disabled={isScanning}
      >
        <Camera className="w-6 h-6" />
        {isScanning ? "Memindai..." : "Scan QR Code"}
      </Button>

      {/* Location Badge */}
      <div className="text-center">
        <Badge variant="outline" className="text-xs">
          📍 Lokasi: {locationName}
        </Badge>
      </div>
    </div>
  );
}
