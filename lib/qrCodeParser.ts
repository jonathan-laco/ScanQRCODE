import { ParsedQRContent } from '@/lib/types';

export const parseQRContent = (content: string): ParsedQRContent => {
  // URL validation
  const urlRegex = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#].*)?$/i;
  const emailRegex = /^mailto:(.+)/i;
  const phoneRegex = /^tel:(.+)/i;
  const smsRegex = /^sms:(.+?)(?:\?body=(.+))?$/i;
  const geoRegex = /^geo:(-?\d+\.\d+),(-?\d+\.\d+)(?:,(-?\d+\.\d+))?(?:\?(.+))?$/i;
  const calendarRegex = /^BEGIN:VCALENDAR/i;

  // Check URL
  if (urlRegex.test(content)) {
    // URL parsing
    let url: URL;
    try {
      // Add https if no protocol specified
      if (!content.startsWith('http')) {
        url = new URL(`https://${content}`);
      } else {
        url = new URL(content);
      }
      
      return {
        type: 'url',
        title: 'Web URL',
        details: [
          { label: 'URL', value: content, isLink: true },
          { label: 'Domain', value: url.hostname, isLink: false },
          { label: 'Path', value: url.pathname || '/', isLink: false },
        ]
      };
    } catch (e) {
      // If URL parsing fails, treat as text
      return {
        type: 'url',
        title: 'Web URL',
        details: [
          { label: 'URL', value: content, isLink: true },
        ]
      };
    }
  }
  
  // Check Email
  else if (emailRegex.test(content)) {
    const matches = content.match(emailRegex);
    const email = matches ? matches[1] : '';
    
    return {
      type: 'email',
      title: 'Email Address',
      details: [
        { label: 'Email', value: email, isLink: false },
        { label: 'Action', value: content, isLink: true },
      ]
    };
  }
  
  // Check Phone
  else if (phoneRegex.test(content)) {
    const matches = content.match(phoneRegex);
    const phone = matches ? matches[1] : '';
    
    return {
      type: 'phone',
      title: 'Phone Number',
      details: [
        { label: 'Number', value: phone, isLink: false },
        { label: 'Action', value: content, isLink: true },
      ]
    };
  }
  
  // Check SMS
  else if (smsRegex.test(content)) {
    const matches = content.match(smsRegex);
    const number = matches ? matches[1] : '';
    const message = matches && matches[2] ? decodeURIComponent(matches[2]) : '';
    
    return {
      type: 'sms',
      title: 'SMS Message',
      details: [
        { label: 'Number', value: number, isLink: false },
        { label: 'Message', value: message || 'None', isLink: false },
        { label: 'Action', value: content, isLink: true },
      ]
    };
  }
  
  // Check Geo location
  else if (geoRegex.test(content)) {
    const matches = content.match(geoRegex);
    const latitude = matches ? matches[1] : '';
    const longitude = matches ? matches[2] : '';
    
    return {
      type: 'geo',
      title: 'Geographic Location',
      details: [
        { label: 'Latitude', value: latitude, isLink: false },
        { label: 'Longitude', value: longitude, isLink: false },
        { label: 'Maps', value: `https://maps.google.com/?q=${latitude},${longitude}`, isLink: true },
      ]
    };
  }
  
  // Check Calendar
  else if (calendarRegex.test(content)) {
    return {
      type: 'calendar',
      title: 'Calendar Event',
      details: [
        { label: 'Content', value: 'Calendar event data', isLink: false },
        { label: 'Raw Data', value: content.substring(0, 100) + '...', isLink: false },
      ]
    };
  }
  
  // Treat as plain text
  else {
    return {
      type: 'text',
      title: 'Text Content',
      details: [
        { label: 'Content', value: content, isLink: false },
      ]
    };
  }
};