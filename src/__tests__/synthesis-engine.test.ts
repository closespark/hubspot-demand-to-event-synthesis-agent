import { SynthesisEngine } from '../synthesis/engine';
import { SynthesisConfig, SearchConsoleDemandSignal, GoogleAdsPerformance } from '../types';

describe('SynthesisEngine', () => {
  let engine: SynthesisEngine;
  let config: SynthesisConfig;

  beforeEach(() => {
    config = {
      dateRange: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      },
      thresholds: {
        minImpressions: 100,
        minConversions: 1,
        minScore: 0.5,
      },
      weights: {
        ga4: 0.25,
        lifecycle: 0.35,
        search: 0.20,
        ads: 0.20,
      },
    };
    engine = new SynthesisEngine(config);
  });

  describe('synthesizeInsights', () => {
    it('should return empty array when no data provided', () => {
      const insights = engine.synthesizeInsights({});
      expect(insights).toEqual([]);
    });

    it('should generate query insights from search console data', () => {
      const searchSignals: SearchConsoleDemandSignal[] = [
        {
          query: 'test query',
          page: '/page1',
          impressions: 1000,
          clicks: 50,
          ctr: 0.05,
          position: 5,
          date: new Date('2024-01-15'),
        },
      ];

      const insights = engine.synthesizeInsights({ searchSignals });
      expect(insights.length).toBeGreaterThan(0);
      
      const queryInsights = insights.filter(i => i.type === 'query');
      expect(queryInsights.length).toBeGreaterThan(0);
      expect(queryInsights[0].name).toBe('test query');
    });

    it('should filter insights below minimum score threshold', () => {
      const searchSignals: SearchConsoleDemandSignal[] = [
        {
          query: 'low performing query',
          page: '/page1',
          impressions: 10, // Below threshold
          clicks: 1,
          ctr: 0.01,
          position: 50,
          date: new Date('2024-01-15'),
        },
      ];

      const insights = engine.synthesizeInsights({ searchSignals });
      expect(insights.length).toBe(0);
    });

    it('should generate message insights from ads data', () => {
      const adsPerformance: GoogleAdsPerformance[] = [
        {
          campaignId: 'camp1',
          campaignName: 'Test Campaign',
          adGroupId: 'ag1',
          adGroupName: 'Test Ad Group',
          keyword: 'test keyword',
          impressions: 1000,
          clicks: 100,
          conversions: 10,
          cost: 100,
          date: new Date('2024-01-15'),
        },
      ];

      const insights = engine.synthesizeInsights({ adsPerformance });
      expect(insights.length).toBeGreaterThan(0);
      
      const messageInsights = insights.filter(i => i.type === 'message');
      expect(messageInsights.length).toBeGreaterThan(0);
    });

    it('should rank insights by score', () => {
      const searchSignals: SearchConsoleDemandSignal[] = [
        {
          query: 'high performing',
          page: '/page1',
          impressions: 10000,
          clicks: 500,
          ctr: 0.05,
          position: 3,
          date: new Date('2024-01-15'),
        },
        {
          query: 'low performing',
          page: '/page2',
          impressions: 500,
          clicks: 10,
          ctr: 0.02,
          position: 20,
          date: new Date('2024-01-15'),
        },
      ];

      const insights = engine.synthesizeInsights({ searchSignals });
      
      // Verify insights are sorted by score descending
      for (let i = 1; i < insights.length; i++) {
        expect(insights[i - 1].score).toBeGreaterThanOrEqual(insights[i].score);
      }
    });
  });
});
