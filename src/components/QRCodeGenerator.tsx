"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
    <div className="space-y-3">
      {!show ? (
        <Button
          variant="outline"
          size="sm"
          className="h-auto py-2.5 flex flex-col items-center gap-1.5 border-white/10 bg-white/5 hover:bg-white/10 w-full"
          onClick={() => setShow(true)}
        >
          <QrCode className="h-4 w-4" />
          <span className="text-xs">Show QR Code</span>
        </Button>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white p-3 flex flex-col items-center gap-3 animate-in fade-in duration-200">
          {dataUrl ? (
            <img src={dataUrl} alt="QR code to share this download" width={size} height={size} />
          ) : (
            <div className="h-[180px] w-[180px] bg-muted rounded-lg animate-pulse" />
          )}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-white/10 bg-white/5 hover:bg-white/10"
              onClick={handleDownload}
              disabled={!dataUrl}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Save QR
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShow(false)}>
              Hide
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
