import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScanAsset() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    setError(null);
    
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Stop scanner and navigate to report page with asset ID
          scanner.stop().then(() => {
            navigate(`/report?asset=${decodedText}`);
          });
        },
        () => {} // Ignore scan errors
      );
      
      setIsScanning(true);
    } catch (err) {
      setError("Unable to access camera. Please ensure camera permissions are granted.");
      console.error("Scanner error:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="w-fit mb-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Asset QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            id="qr-reader" 
            className="w-full aspect-square bg-muted rounded-lg overflow-hidden"
          />
          
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          
          {!isScanning ? (
            <Button onClick={startScanner} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start Scanner
            </Button>
          ) : (
            <Button onClick={stopScanner} variant="outline" className="w-full">
              <X className="w-4 h-4 mr-2" />
              Stop Scanner
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground text-center">
            Point your camera at an asset QR code to report an issue
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
