'use client';

/**
 * History page content with client-side filtering and pagination
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
// Removed next-intl - using English only
import { TipCard } from '@/components/TipCard';
import type { TipItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Filter, Download, Search } from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
// Removed multilingual date locale imports

interface HistoryFilters {
  sport?: string;
  risk?: string;
  result?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface HistoryData {
  tips: Array<TipItem & { date: string }>;
  total: number;
  hasMore: boolean;
}

interface HistoryContentProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function HistoryContent({ searchParams }: HistoryContentProps) {
  
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<HistoryFilters>({});
  
  // Extract initial filters from search params
  useEffect(() => {
    const initialFilters: HistoryFilters = {};
    
    if (searchParams.sport && typeof searchParams.sport === 'string') {
      initialFilters.sport = searchParams.sport;
    }
    if (searchParams.risk && typeof searchParams.risk === 'string') {
      initialFilters.risk = searchParams.risk;
    }
    if (searchParams.result && typeof searchParams.result === 'string') {
      initialFilters.result = searchParams.result;
    }
    
    setFilters(initialFilters);
  }, [searchParams]);
  
  const fetchData = useCallback(async (pageNum: number, filterParams = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        ...filterParams,
      });
      
      const response = await fetch(`/api/tips/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      
      if (pageNum === 1) {
        setData(result);
      } else {
        setData(prev => prev ? {
          ...result,
          tips: [...prev.tips, ...result.tips],
        } : result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    fetchData(1);
  }, [fetchData]);
  
  const handleFilterChange = (key: keyof HistoryFilters, value: string | undefined) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined || value === 'all') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setFilters(newFilters);
    setPage(1);
    fetchData(1, newFilters);
  };
  
  const handleDateRangeChange = (range: string) => {
    const today = new Date();
    let dateFrom: string;
    const dateTo: string = format(today, 'yyyy-MM-dd');
    
    switch (range) {
      case 'week':
        dateFrom = format(subDays(today, 7), 'yyyy-MM-dd');
        break;
      case 'month':
        dateFrom = format(subMonths(today, 1), 'yyyy-MM-dd');
        break;
      case '3months':
        dateFrom = format(subMonths(today, 3), 'yyyy-MM-dd');
        break;
      case 'custom':
        // Keep existing custom dates
        return;
      case 'all':
      default:
        const newFilters = { ...filters };
        delete newFilters.dateFrom;
        delete newFilters.dateTo;
        setFilters(newFilters);
        setPage(1);
        fetchData(1, newFilters);
        return;
    }
    
    const newFilters = { ...filters, dateFrom, dateTo };
    setFilters(newFilters);
    setPage(1);
    fetchData(1, newFilters);
  };
  
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };
  
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...filters,
      });
      
      const response = await fetch(`/api/tips/export?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `betting-tips-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };
  
  // Mock data for available options (would come from API in real app)
  const availableSports = ['Football', 'Basketball', 'Tennis', 'Baseball'];
  const riskOptions = [
    { value: 'all', label: 'All Risks' },
    { value: 'safe', label: 'Safe' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];
  const resultOptions = [
    { value: 'all', label: 'All Results' },
    { value: 'win', label: 'Win' },
    { value: 'loss', label: 'Loss' },
    { value: 'pending', label: 'Pending' },
  ];
  const dateRangeOptions = [
    { value: 'all', label: 'All time' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' },
    { value: '3months', label: 'Last 3 months' },
    ...(filters.dateFrom ? [{ value: 'custom', label: 'Custom' }] : []),
  ];
  
  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            History & Performance
          </h1>
          <p className="text-muted-foreground text-lg">
            Check the performance of previous tips
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sport</label>
              <Select value={filters.sport || 'all'} onValueChange={(value) => handleFilterChange('sport', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {availableSports.map((sport) => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Risk</label>
              <Select value={filters.risk || 'all'} onValueChange={(value) => handleFilterChange('risk', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Risks" />
                </SelectTrigger>
                <SelectContent>
                  {riskOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Result</label>
              <Select value={filters.result || 'all'} onValueChange={(value) => handleFilterChange('result', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Results" />
                </SelectTrigger>
                <SelectContent>
                  {resultOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={filters.dateFrom ? 'custom' : 'all'} onValueChange={handleDateRangeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleExport} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          
          {/* Active Filters */}
          {(filters.sport || filters.risk || filters.result || filters.dateFrom) && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {filters.sport && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('sport', undefined)}>
                    Sport: {filters.sport} ×
                  </Badge>
                )}
                {filters.risk && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('risk', undefined)}>
                    Risk: {filters.risk === 'safe' ? 'Safe' : filters.risk === 'medium' ? 'Medium' : 'High'} ×
                  </Badge>
                )}
                {filters.result && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFilterChange('result', undefined)}>
                    Result: {filters.result === 'win' ? 'Win' : filters.result === 'loss' ? 'Loss' : 'Pending'} ×
                  </Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => handleDateRangeChange('all')}>
                    Date: {filters.dateFrom} to {filters.dateTo} ×
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Results */}
      {loading && page === 1 ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => fetchData(1)} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : data?.tips.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">No results found</p>
            <Button onClick={() => {
              setFilters({});
              fetchData(1, {});
            }} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Tips Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.tips.map((tip) => (
              <TipCard 
                key={`${tip.date}-${tip.id}`}
                tip={tip} 
                date={tip.date}
                compact={true}
              />
            ))}
          </div>
          
          {/* Load More */}
          {data?.hasMore && (
            <div className="text-center pt-6">
              <Button onClick={handleLoadMore} disabled={loading} variant="outline">
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
          
          {/* Results Summary */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            Showing {data?.tips.length || 0} of {data?.total || 0} tips
          </div>
        </div>
      )}
    </div>
  );
}
