'use client';

import { useEffect } from 'react';

interface GoogleAdsenseProps {
  clientId: string;
}

export function GoogleAdsense({ clientId }: GoogleAdsenseProps) {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="${clientId}"]`);
    
    if (!existingScript) {
      // Create script element
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.crossOrigin = 'anonymous';
      
      // Add script to head
      document.head.appendChild(script);
      
      // Cleanup function
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [clientId]);

  return null; // This component doesn't render anything
}
