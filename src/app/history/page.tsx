/**
 * History page - filterable list of past tips with results
 */

import { Metadata } from 'next';
import { HistoryContent } from './HistoryContent';

interface HistoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: 'Betting Tips History | Past Results & Performance',
  description: 'Check the performance of previous tips and analyze our betting success rates with detailed historical data.',
  openGraph: {
    title: 'Betting Tips History | Past Results & Performance',
    description: 'Check the performance of previous tips and analyze our betting success rates with detailed historical data.',
  },
  twitter: {
    title: 'Betting Tips History | Past Results & Performance',
    description: 'Check the performance of previous tips and analyze our betting success rates with detailed historical data.',
  },
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const resolvedSearchParams = await searchParams;
  return <HistoryContent searchParams={resolvedSearchParams} />;
}
