"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyRekeningButton({ number }: { number: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      toast.success("Nomor rekening disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin. Salin manual: " + number);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 gap-1 text-xs">
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-600" /> Tersalin
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> Salin
        </>
      )}
    </Button>
  );
}
