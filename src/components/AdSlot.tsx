/**
 * Component for Google AdSense ad slots
 * Only renders in production when NEXT_PUBLIC_GADS_CLIENT is set
 */

'use client';

import { useEffect } from 'react';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSlot({ 
  slot, 
  format = 'auto', 
  responsive = true,
  style,
  className = ''
}: AdSlotProps) {
  const clientId = process.env.NEXT_PUBLIC_GADS_CLIENT;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Don't render ads in development or if client ID is not set
  if (!isProduction || !clientId) {
    // Show placeholder in development
    if (!isProduction) {
      return (
        <div 
          className={`bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 ${className}`}
          style={{ minHeight: '250px', ...style }}
        >
          <div className="text-center">
            <div className="font-mono text-xs">AdSense Slot</div>
            <div className="text-xs mt-1">Slot: {slot}</div>
            <div className="text-xs">Format: {format}</div>
          </div>
        </div>
      );
    }
    return null;
  }
  
  useEffect(() => {
    try {
      // Initialize adsbygoogle if not already done
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);
  
  const adStyle: React.CSSProperties = {
    display: 'block',
    ...style,
  };
  
  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}

/**
 * Predefined ad slot components for common placements
 */
export function AdSlotBanner({ className }: { className?: string }) {
  return (
    <AdSlot
      slot="1234567890" // Replace with actual slot ID
      format="horizontal"
      className={className}
      style={{ minHeight: '90px' }}
    />
  );
}

export function AdSlotSidebar({ className }: { className?: string }) {
  return (
    <AdSlot
      slot="1234567891" // Replace with actual slot ID
      format="vertical"
      className={className}
      style={{ minWidth: '160px', minHeight: '600px' }}
    />
  );
}

export function AdSlotInArticle({ className }: { className?: string }) {
  return (
    <AdSlot
      slot="1234567892" // Replace with actual slot ID
      format="rectangle"
      className={className}
      style={{ minHeight: '250px' }}
    />
  );
}

export function AdSlotFooter({ className }: { className?: string }) {
  return (
    <AdSlot
      slot="1234567893" // Replace with actual slot ID
      format="horizontal"
      className={className}
      style={{ minHeight: '90px' }}
    />
  );
}
