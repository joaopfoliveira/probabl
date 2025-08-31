'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navigationItems = [
  { href: '/', label: 'Home' },
  { href: '/today', label: 'Today' },
  { href: '/history', label: 'History' },
  // { href: '/blog', label: 'Blog' }, // Commented out - Blog disabled
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors hover:text-foreground/80 ${
              isActive ? 'text-foreground' : 'text-foreground/60'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}