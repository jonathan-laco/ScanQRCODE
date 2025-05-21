'use client';

import { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, History, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import QRUploadZone from '@/components/QRUploadZone';
import QRCameraScanner from '@/components/QRCameraScanner';
import ResultDisplay from '@/components/ResultDisplay';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QRScanResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'qrScanHistory';

export default function QRScannerPage() {
  const [scanResults, setScanResults] = useState<QRScanResult[]>([]);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const { toast } = useToast();
  const historyRef = useRef<HTMLDivElement>(null);
  const [selectedResult, setSelectedResult] = useState<QRScanResult | null>(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setScanResults(parsed);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleScanResult = (result: string) => {
    // Sempre buscar o histórico mais recente do localStorage
    let currentHistory: QRScanResult[] = [];
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          currentHistory = parsed;
        }
      }
    } catch (error) {
      currentHistory = [];
    }

    const newResult: QRScanResult = {
      id: Date.now().toString(),
      content: result,
      timestamp: new Date(),
    };
    
    const updatedResults = [newResult, ...currentHistory];
    setScanResults(updatedResults);
    
    // Scroll para o topo do histórico apenas se necessário e se o usuário não estiver no topo
    setTimeout(() => {
      if (historyRef.current) {
        const el = historyRef.current;
        if (el.scrollHeight > el.clientHeight && el.scrollTop > 0) {
          el.scrollTop = 0;
        }
      }
    }, 100);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
      toast({
        title: 'QR Code Escaneado',
        description: 'QR code decodificado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar histórico',
        variant: 'destructive',
      });
    }
  };

  const clearHistory = () => {
    setScanResults([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: 'Histórico Limpo',
      description: 'Todo o histórico foi apagado',
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-background/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Leitor QR</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-4 md:py-6">
        <div className="w-full max-w-5xl mx-auto grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-1 lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload QR Code</span>
                  <span className="sm:hidden">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">Escanear com Câmera</span>
                  <span className="sm:hidden">Câmera</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-0">
                <QRUploadZone onScanResult={handleScanResult} />
              </TabsContent>

              <TabsContent value="camera" className="mt-0">
                <QRCameraScanner onScanResult={handleScanResult} />
              </TabsContent>
            </Tabs>

            {scanResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-medium">Último Resultado</h2>
                </div>
                <ResultDisplay result={selectedResult || scanResults[0]} />
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-medium">Histórico</h2>
              </div>
              {scanResults.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { clearHistory(); setSelectedResult(null); }}
                  className="h-7 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            <Separator className="my-2" />
            
            {scanResults.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">Nenhum histórico ainda</p>
                <p className="text-xs mt-1">QR codes escaneados aparecerão aqui</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] pr-4">
                <div ref={historyRef} className="space-y-2 mt-2">
                  {scanResults.map((result) => (
                    <div 
                      key={result.id}
                      className={`p-2 rounded-md transition-colors cursor-pointer ${
                        selectedResult?.id === result.id 
                        ? 'bg-primary/10 border border-primary' 
                        : 'bg-muted/50 hover:bg-muted border border-transparent'
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="line-clamp-1 text-sm font-medium">{result.content}</div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-3 text-center text-xs text-muted-foreground">
        <p>Desenvolvido por Jonathan Laco</p>
      </footer>
    </div>
  );
}