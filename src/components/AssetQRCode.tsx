import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetQRCodeProps {
  assetId: string;
  assetName: string;
  assetTag?: string | null;
}

export function AssetQRCode({ assetId, assetName, assetTag }: AssetQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  
  // URL that the QR code will link to - the report issue page with asset pre-selected
  const reportUrl = `${window.location.origin}/report?asset=${assetId}`;

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    // Create a canvas to render the QR code with label
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 32;
    const qrSize = 256;
    const labelHeight = 60;
    const totalWidth = qrSize + padding * 2;
    const totalHeight = qrSize + padding * 2 + labelHeight;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Draw QR code
      ctx.drawImage(img, padding, padding, qrSize, qrSize);

      // Draw label
      ctx.fillStyle = "#000000";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(assetName, totalWidth / 2, qrSize + padding + 30);
      
      if (assetTag) {
        ctx.font = "14px Arial";
        ctx.fillStyle = "#666666";
        ctx.fillText(`Tag: ${assetTag}`, totalWidth / 2, qrSize + padding + 50);
      }

      // Download
      const link = document.createElement("a");
      link.download = `qr-${assetName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div ref={qrRef} className="bg-white p-4 rounded-lg">
          <QRCodeSVG
            value={reportUrl}
            size={160}
            level="H"
            includeMargin={false}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Scan to report an issue for this asset
        </p>
        <Button onClick={downloadQRCode} variant="outline" size="sm" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Download QR Sticker
        </Button>
      </CardContent>
    </Card>
  );
}
