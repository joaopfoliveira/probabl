/**
 * Component for affiliate buttons with proper SEO attributes
 */
"use client"

import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useMemo } from 'react';

interface AffiliateButtonProps {
  href: string;
  label: string;
  locale?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export function AffiliateButton({ 
  href, 
  label, 
  locale = 'en',
  variant = 'default',
  size = 'md',
  className = '',
  showIcon = true
}: AffiliateButtonProps) {
  // Add tracking parameters to URL using useMemo to prevent hydration mismatch
  const trackingUrl = useMemo(() => {
    const url = new URL(href);
    url.searchParams.set('src', 'site');
    url.searchParams.set('loc', locale);
    url.searchParams.set('utm_source', 'betting-tips-ai');
    url.searchParams.set('utm_medium', 'affiliate');
    url.searchParams.set('utm_campaign', 'tips-cta');
    return url.toString();
  }, [href, locale]);
  
  const sizeMap = {
    sm: 'sm',
    md: 'default',
    lg: 'lg',
  } as const;
  
  return (
    <Button
      asChild
      variant={variant}
      size={sizeMap[size]}
      className={className}
    >
      <a
        href={trackingUrl}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="inline-flex items-center gap-2"
      >
        <span>{label}</span>
        {showIcon && <ExternalLink className="h-4 w-4" />}
      </a>
    </Button>
  );
}

/**
 * Predefined affiliate buttons for common use cases
 */
interface MainAffiliateButtonProps {
  locale: string;
  className?: string;
}

export function MainAffiliateButton({ locale, className }: MainAffiliateButtonProps) {
  const affiliateUrl = process.env.NEXT_PUBLIC_AFFILIATE_MAIN || 'https://example.com';
  
  const labels = {
    pt: 'Ver Casas de Apostas',
    en: 'View Bookmakers',
  };
  
  const label = labels[locale as keyof typeof labels] || labels.en;
  
  return (
    <AffiliateButton
      href={affiliateUrl}
      label={label}
      locale={locale}
      variant="default"
      size="md"
      className={className}
    />
  );
}

export function FooterAffiliateButton({ locale, className }: MainAffiliateButtonProps) {
  const affiliateUrl = process.env.NEXT_PUBLIC_AFFILIATE_MAIN || 'https://responsiblegambling.org/';
  
  const labels = {
    pt: 'Apostas Responsáveis',
    en: 'Responsible Betting',
  };
  
  const label = labels[locale as keyof typeof labels] || labels.en;
  
  return (
    <AffiliateButton
      href={affiliateUrl}
      label={label}
      locale={locale}
      variant="outline"
      size="sm"
      className={className}
    />
  );
}

export function InlineAffiliateLink({ 
  href, 
  children, 
  locale = 'en',
  className = ''
}: {
  href: string;
  children: React.ReactNode;
  locale?: string;
  className?: string;
}) {
  // Add tracking parameters to URL using useMemo to prevent hydration mismatch
  const trackingUrl = useMemo(() => {
    const url = new URL(href);
    url.searchParams.set('src', 'site');
    url.searchParams.set('loc', locale);
    url.searchParams.set('utm_source', 'betting-tips-ai');
    url.searchParams.set('utm_medium', 'affiliate');
    url.searchParams.set('utm_campaign', 'inline-link');
    return url.toString();
  }, [href, locale]);
  
  return (
    <a
      href={trackingUrl}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={`text-primary hover:underline inline-flex items-center gap-1 ${className}`}
    >
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
