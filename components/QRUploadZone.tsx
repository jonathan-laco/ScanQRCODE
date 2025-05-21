'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp, ScanLine } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface QRUploadZoneProps {
  onScanResult: (result: string) => void;
}

export default function QRUploadZone({ onScanResult }: QRUploadZoneProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(30);
    
    try {
      const fileUrl = URL.createObjectURL(file);
      setProgress(50);
      
      const hints = new Map();
      hints.set(2, true); // Enable try harder mode
      
      const codeReader = new BrowserQRCodeReader(hints);
      setProgress(70);
      
      const result = await codeReader.decodeFromImageUrl(fileUrl);
      
      setProgress(100);
      onScanResult(result.getText());
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        URL.revokeObjectURL(fileUrl);
      }, 1000);
      
    } catch (error) {
      console.error("Error scanning QR code:", error);
      setIsProcessing(false);
      setProgress(0);
      toast({
        title: "Erro",
        description: "Não foi possível detectar um QR code na imagem",
        variant: "destructive",
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
    },
    disabled: isProcessing,
    multiple: false,
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-all duration-200 ease-in-out cursor-pointer bg-background hover:bg-secondary/50",
          isDragActive && "border-primary bg-secondary/50",
          isDragAccept && "border-green-500 bg-green-50 dark:bg-green-950/20",
          isDragReject && "border-red-500 bg-red-50 dark:bg-red-950/20",
          isProcessing && "pointer-events-none opacity-80"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Solte o QR Code Aqui</h3>
            <p className="text-sm text-muted-foreground">
              Solte sua imagem QR code aqui, ou clique para selecionar
            </p>
          </div>
          
          <Button disabled={isProcessing}>
            <FileUp className="h-4 w-4 mr-2" />
            Selecionar Imagem
          </Button>
          
          {isProcessing && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-sm text-muted-foreground">Processando QR code...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}