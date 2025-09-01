import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel | Its Probabl',
  description: 'Administrative panel for managing betting tips and results',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
