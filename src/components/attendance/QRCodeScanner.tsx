import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, AlertCircle } from "lucide-react";

interface QRCodeScannerProps {
  onScanSuccess?: (data: string) => void;
  onScanError?: (error: string) => void;
  locationName?: string;
}

/**
 * @deprecated Fitur QR Scanner telah digantikan dengan Absensi Manual terverifikasi.
 * Komponen ini dipertahankan sebagai placeholder non-aktif.
 */
export function QRCodeScanner({ locationName = "MAJIKU Daycare" }: QRCodeScannerProps) {
  return (
    <div className="space-y-4">
      <Card className="border-dashed border-2">
        <CardContent className="p-6 text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <QrCode className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Pemindaian QR Tidak Aktif</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Gunakan pencatatan absensi manual untuk mencatat kehadiran pengajar.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            📍 Lokasi: {locationName}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
