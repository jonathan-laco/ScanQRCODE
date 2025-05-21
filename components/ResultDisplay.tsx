'use client';

import { useState } from 'react';
import { LinkIcon, Copy, Check, ExternalLink, Smartphone, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { QRScanResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { parseQRContent } from '@/lib/qrCodeParser';

interface ResultDisplayProps {
  result: QRScanResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const parsedResult = parseQRContent(result.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    toast({
      title: 'Copiado',
      description: 'O conteúdo foi copiado para a área de transferência',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const renderIcon = () => {
    switch (parsedResult.type) {
      case 'url':
        return <LinkIcon className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'phone':
        return <Phone className="h-5 w-5" />;
      case 'sms':
        return <Smartphone className="h-5 w-5" />;
      case 'geo':
        return <MapPin className="h-5 w-5" />;
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full overflow-hidden border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "p-2 rounded-full",
              parsedResult.type === 'url' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
              parsedResult.type === 'email' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
              parsedResult.type === 'phone' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            )}>
              {renderIcon()}
            </div>
            <div>
              <CardTitle>{parsedResult.title}</CardTitle>
              <CardDescription>
                {new Date(result.timestamp).toLocaleString()}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline">{parsedResult.type}</Badge>
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-4">
        <div className="space-y-3">
          {parsedResult.details.map((detail, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-24 flex-shrink-0 text-sm font-medium text-muted-foreground">
                {detail.label}:
              </div>
              <div className="flex-1 break-words text-sm">
                {detail.isLink ? (
                  <a 
                    href={detail.value} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    {detail.value}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                ) : (
                  <span>{detail.value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <Separator className="mb-3" />
      
      <CardFooter>
        <div className="flex w-full justify-between">
          {parsedResult.type === 'url' && (
            <Button 
              variant="outline" 
              onClick={() => window.open(result.content, '_blank')}
              className="flex-1 mr-2"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Link
            </Button>
          )}
          
          <Button 
            variant={parsedResult.type === 'url' ? "secondary" : "default"} 
            onClick={handleCopy}
            className={parsedResult.type === 'url' ? "flex-1" : "flex-1"}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}