'use client';

import { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { Camera, RefreshCw, ZapOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QRCameraScannerProps {
  onScanResult: (result: string) => void;
}

export default function QRCameraScanner({ onScanResult }: QRCameraScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [hasCameraSupport, setHasCameraSupport] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasCameraSupport(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        } else {
          setHasCameraSupport(false);
        }
      } catch (err) {
        console.error('Error checking camera:', err);
        setPermissionDenied(true);
        setHasCameraSupport(false);
      }
    };

    checkCameraSupport();

    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startScanner = async () => {
    if (!selectedCamera || !videoRef.current) return;

    try {
      setIsScanning(true);
      setPermissionDenied(false);
      setScanSuccess(false);

      const constraints = {
        video: {
          deviceId: selectedCamera,
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 1.7777777778 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const hints = new Map();
      hints.set(2, true); // Enable try harder mode
      
      const codeReader = new BrowserQRCodeReader(hints);
      
      controlsRef.current = await codeReader.decodeFromVideoDevice(
        selectedCamera,
        videoRef.current,
        (result) => {
          if (result) {
            setScanSuccess(true);
            onScanResult(result.getText());
            if (controlsRef.current) {
              controlsRef.current.stop();
              setIsScanning(false);
            }
          }
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setIsScanning(false);
      
      if (err instanceof Error && err.message.includes('permission')) {
        setPermissionDenied(true);
        toast({
          title: 'Acesso à Câmera Negado',
          description: 'Por favor, permita o acesso à câmera para escanear QR codes',
          variant: 'destructive',
        });
      }
    }
  };
  
  const stopScanner = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };
  
  const handleCameraChange = (value: string) => {
    if (isScanning) {
      stopScanner();
    }
    setSelectedCamera(value);
  };

  if (!hasCameraSupport) {
    return (
      <Card className="p-6 text-center">
        <div className="space-y-3">
          <div className="bg-destructive/10 text-destructive rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
            <ZapOff className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium">Câmera Não Disponível</h3>
          <p className="text-sm text-muted-foreground">
            Seu dispositivo não possui câmera ou o acesso à câmera não é suportado
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card className={cn(
        "relative overflow-hidden transition-all bg-black w-full max-w-md mx-auto",
        "h-[300px] sm:h-[400px]"
      )}>
        <div className="absolute inset-0 flex items-center justify-center">
          {!isScanning && !scanSuccess && (
            <div className="text-center p-6">
              {permissionDenied ? (
                <div className="space-y-3">
                  <div className="bg-destructive/10 text-destructive rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
                    <ZapOff className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Acesso à Câmera Negado</h3>
                  <p className="text-sm text-gray-300">
                    Por favor, permita o acesso à câmera nas configurações do navegador
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-lg text-white">
                    Pressione iniciar para ativar a câmera
                  </p>
                </div>
              )}
            </div>
          )}
          
          <video 
            ref={videoRef}
            className={cn(
              "absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300",
              isScanning && "opacity-100"
            )}
            playsInline
            muted
            autoPlay
          />
          
          {scanSuccess && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="bg-green-500/20 text-green-500 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-white">QR Code Detectado!</h3>
              </div>
            </div>
          )}
        </div>
        
        {isScanning && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-64 h-64 border-2 border-primary rounded-lg relative">
              <div className="absolute top-0 left-0 w-full animate-qr-scan-line border-t-2 border-primary"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary"></div>
            </div>
          </div>
        )}
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <Select value={selectedCamera} onValueChange={handleCameraChange} disabled={isScanning}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a câmera" />
            </SelectTrigger>
            <SelectContent>
              {cameras.map(camera => (
                <SelectItem 
                  key={camera.deviceId} 
                  value={camera.deviceId}
                >
                  {camera.label || `Câmera ${cameras.indexOf(camera) + 1}`}
                </SelectItem>
              ))}
              {cameras.length === 0 && (
                <SelectItem value="no-camera">
                  Nenhuma câmera encontrada
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/2">
          {!isScanning ? (
            <Button 
              className="w-full"
              onClick={startScanner} 
              disabled={!selectedCamera || cameras.length === 0}
            >
              <Camera className="mr-2 h-4 w-4" />
              Iniciar Scanner
            </Button>
          ) : (
            <Button 
              className="w-full" 
              variant="secondary" 
              onClick={stopScanner}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Parar Scanner
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}