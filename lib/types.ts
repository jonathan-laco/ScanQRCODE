export interface QRScanResult {
  id: string;
  content: string;
  timestamp: Date;
}

export interface ParsedQRContent {
  type: 'url' | 'email' | 'phone' | 'sms' | 'geo' | 'calendar' | 'text';
  title: string;
  details: Array<{
    label: string;
    value: string;
    isLink: boolean;
  }>;
}