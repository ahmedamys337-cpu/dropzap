"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { QrCode, Download } from "lucide-react";

interface Props {
  url: string;
  size?: number;
}

export default function QRCodeGenerator({ url, size = 180 }: Props) {
  const { toast } = useToast();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!show || !url) return;
    QRCode.toDataURL(url, { width: size, margin: 2, color: { dark: "#000", light: "#fff" } })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [show, url, size]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "dropzap-qr.png";
    a.click();
    toast({ title: "QR code saved" });
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3.5 text-center transition-all hover:bg-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-600/10 active:scale-[0.98] w-full"
      >
        <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center transition-colors group-hover:bg-orange-500/30">
          <QrCode className="h-5 w-5 text-orange-400" />
        </div>
        <span className="text-xs font-semibold">Show QR Code</span>
      </button>

      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShow(false)}
        >
          <div
            className="relative rounded-2xl border border-white/10 bg-white dark:bg-slate-900 p-5 flex flex-col items-center gap-4 shadow-2xl max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Scan to open this download</p>
            {dataUrl ? (
              <Image src={dataUrl} alt="QR code to share this download" width={size} height={size} className="rounded-xl" unoptimized />
            ) : (
              <div className="h-[180px] w-[180px] bg-muted rounded-xl animate-pulse" />
            )}
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-slate-200 dark:border-white/10"
                onClick={handleDownload}
                disabled={!dataUrl}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Save QR
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShow(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
