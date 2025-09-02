/**
 * Web scraper module for collecting betting tips from multiple sources
 */

import { chromium, Browser, Page } from 'playwright';
import { AUTOMATION_CONFIG, SCRAPING_SELECTORS } from './config';
import { logger } from './logger';

export interface ScrapedTip {
  source: string;
  sport: string;
  event: string;
  selection: string;
  odds: number;
  confidence?: string;
  league?: string;
  url?: string;
  timestamp: string;
}

export class WebScraper {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });
      logger.info('Web scraper initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize web scraper:', error);
      throw error;
    }
  }

  async scrapeAllSources(): Promise<ScrapedTip[]> {
    if (!this.browser) {
      await this.initialize();
    }

    const allTips: ScrapedTip[] = [];
    
    for (const source of AUTOMATION_CONFIG.sources) {
      if (!source.enabled) continue;

      try {
        logger.info(`Scraping ${source.name}...`);
        const tips = await this.scrapeSource(source);
        allTips.push(...tips);
        logger.info(`Scraped ${tips.length} tips from ${source.name}`);
      } catch (error) {
        logger.error(`Failed to scrape ${source.name}:`, error);
        // Continue with other sources even if one fails
      }
    }

    logger.info(`Total tips scraped: ${allTips.length}`);
    return allTips;
  }

  private async scrapeSource(source: any): Promise<ScrapedTip[]> {
    const page = await this.browser!.newPage();
    const tips: ScrapedTip[] = [];

    try {
      // Set realistic headers
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      await page.goto(source.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for content to load
      await page.waitForTimeout(2000);

      switch (source.name) {
        case 'OddsPortal':
          return await this.scrapeOddsPortal(page);
        case 'Tipster':
          return await this.scrapeTipster(page);
        case 'Betting Expert':
          return await this.scrapeBettingExpert(page);
        default:
          logger.warn(`No scraper implemented for ${source.name}`);
          return [];
      }
    } catch (error) {
      logger.error(`Error scraping ${source.name}:`, error);
      return [];
    } finally {
      await page.close();
    }
  }

  private async scrapeOddsPortal(page: Page): Promise<ScrapedTip[]> {
    const tips: ScrapedTip[] = [];

    try {
      // This is a placeholder implementation - actual selectors would need to be tested
      const tipElements = await page.$$('.tip-item, .match-item, .event-item');
      
      for (const element of tipElements.slice(0, 10)) { // Limit to 10 tips
        try {
          const sport = await element.$eval('.sport, .category', el => el.textContent?.trim()) || 'Unknown';
          const event = await element.$eval('.match, .teams, .event-name', el => el.textContent?.trim()) || 'Unknown Event';
          const odds = await element.$eval('.odds, .decimal-odds', el => {
            const text = el.textContent?.trim() || '1.0';
            return parseFloat(text) || 1.0;
          });

          if (odds >= AUTOMATION_CONFIG.generation.minOdds && odds <= AUTOMATION_CONFIG.generation.maxOdds) {
            tips.push({
              source: 'OddsPortal',
              sport: this.normalizeSport(sport),
              event,
              selection: 'Win', // Simplified - would extract actual selection
              odds,
              timestamp: new Date().toISOString(),
              url: page.url()
            });
          }
        } catch (error) {
          // Skip this element if we can't parse it
          continue;
        }
      }
    } catch (error) {
      logger.error('Error scraping OddsPortal specific content:', error);
    }

    return tips;
  }

  private async scrapeTipster(page: Page): Promise<ScrapedTip[]> {
    // Placeholder implementation - similar pattern
    return [];
  }

  private async scrapeBettingExpert(page: Page): Promise<ScrapedTip[]> {
    // Placeholder implementation - similar pattern  
    return [];
  }

  private normalizeSport(sport: string): string {
    const normalized = sport.toLowerCase();
    if (normalized.includes('football') || normalized.includes('soccer')) return 'Football';
    if (normalized.includes('tennis')) return 'Tennis';
    if (normalized.includes('basketball')) return 'Basketball';
    if (normalized.includes('baseball')) return 'Baseball';
    return 'Football'; // Default
  }

  async generateMockData(): Promise<ScrapedTip[]> {
    // For testing purposes - generate realistic mock data
    const mockTips: ScrapedTip[] = [
      {
        source: 'MockSource',
        sport: 'Tennis',
        event: 'Novak Djokovic vs Carlos Alcaraz',
        selection: 'Djokovic to win',
        odds: 1.75,
        confidence: 'High',
        league: 'ATP Finals',
        timestamp: new Date().toISOString()
      },
      {
        source: 'MockSource', 
        sport: 'Football',
        event: 'Manchester City vs Arsenal',
        selection: 'Over 2.5 goals',
        odds: 1.85,
        confidence: 'Medium',
        league: 'Premier League',
        timestamp: new Date().toISOString()
      },
      {
        source: 'MockSource',
        sport: 'Basketball',
        event: 'Lakers vs Warriors',
        selection: 'Lakers +5.5',
        odds: 1.90,
        confidence: 'Medium',
        league: 'NBA',
        timestamp: new Date().toISOString()
      }
    ];

    return mockTips;
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Web scraper cleaned up');
    }
  }
}
