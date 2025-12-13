import {
  QualifiedInsight,
  SynthesisConfig,
  GA4Event,
  GA4Conversion,
  HubSpotLifecycleEvent,
  SearchConsoleDemandSignal,
  GoogleAdsPerformance,
} from '../types';
import { randomUUID } from 'crypto';

/**
 * Synthesis Engine - Processes and synthesizes data from all sources
 */
export class SynthesisEngine {
  private config: SynthesisConfig;

  constructor(config: SynthesisConfig) {
    this.config = config;
  }

  /**
   * Synthesize insights from all data sources
   */
  synthesizeInsights(data: {
    ga4Events?: GA4Event[];
    conversions?: GA4Conversion[];
    lifecycleEvents?: HubSpotLifecycleEvent[];
    searchSignals?: SearchConsoleDemandSignal[];
    adsPerformance?: GoogleAdsPerformance[];
  }): QualifiedInsight[] {
    const insights: QualifiedInsight[] = [];

    // Generate query-based insights from search console data
    if (data.searchSignals && data.searchSignals.length > 0) {
      insights.push(...this.generateQueryInsights(data.searchSignals, data));
    }

    // Generate page-based insights
    if (data.searchSignals && data.searchSignals.length > 0) {
      insights.push(...this.generatePageInsights(data.searchSignals, data));
    }

    // Generate journey-based insights from lifecycle events
    if (data.lifecycleEvents && data.lifecycleEvents.length > 0) {
      insights.push(...this.generateJourneyInsights(data.lifecycleEvents, data));
    }

    // Generate message-based insights from ads and conversions
    if (data.adsPerformance && data.adsPerformance.length > 0) {
      insights.push(...this.generateMessageInsights(data.adsPerformance, data));
    }

    // Filter and rank insights
    return this.rankInsights(insights);
  }

  /**
   * Generate query-based insights
   */
  private generateQueryInsights(
    searchSignals: SearchConsoleDemandSignal[],
    allData: any
  ): QualifiedInsight[] {
    const queryGroups = this.groupByQuery(searchSignals);
    const insights: QualifiedInsight[] = [];

    queryGroups.forEach((signals, query) => {
      const metrics = this.calculateMetrics(signals);
      
      if (metrics.totalImpressions >= this.config.thresholds.minImpressions) {
        const score = this.calculateScore({
          search: signals,
        });

        if (score >= this.config.thresholds.minScore) {
          insights.push({
            id: randomUUID(),
            type: 'query',
            name: query,
            score,
            signals: {
              search: signals,
              conversions: this.findRelatedConversions(allData.conversions, query),
            },
            metrics,
            recommendations: this.generateQueryRecommendations(signals, metrics),
          });
        }
      }
    });

    return insights;
  }

  /**
   * Generate page-based insights
   */
  private generatePageInsights(
    searchSignals: SearchConsoleDemandSignal[],
    allData: any
  ): QualifiedInsight[] {
    const pageGroups = this.groupByPage(searchSignals);
    const insights: QualifiedInsight[] = [];

    pageGroups.forEach((signals, page) => {
      const metrics = this.calculateMetrics(signals);
      
      if (metrics.totalImpressions >= this.config.thresholds.minImpressions) {
        const score = this.calculateScore({
          search: signals,
          ga4: allData.ga4Events?.filter((e: GA4Event) => e.page === page),
        });

        if (score >= this.config.thresholds.minScore) {
          insights.push({
            id: randomUUID(),
            type: 'page',
            name: page,
            score,
            signals: {
              search: signals,
              ga4: allData.ga4Events?.filter((e: GA4Event) => e.page === page),
            },
            metrics,
            recommendations: this.generatePageRecommendations(signals, metrics),
          });
        }
      }
    });

    return insights;
  }

  /**
   * Generate journey-based insights
   */
  private generateJourneyInsights(
    lifecycleEvents: HubSpotLifecycleEvent[],
    _allData: any
  ): QualifiedInsight[] {
    const journeyGroups = this.groupByJourney(lifecycleEvents);
    const insights: QualifiedInsight[] = [];

    journeyGroups.forEach((events, journey) => {
      const score = this.calculateScore({
        lifecycle: events,
      });

      if (score >= this.config.thresholds.minScore) {
        insights.push({
          id: randomUUID(),
          type: 'journey',
          name: journey,
          score,
          signals: {
            lifecycle: events,
          },
          metrics: {
            totalImpressions: 0,
            totalClicks: 0,
            totalConversions: events.length,
          },
          recommendations: this.generateJourneyRecommendations(events),
        });
      }
    });

    return insights;
  }

  /**
   * Generate message-based insights
   */
  private generateMessageInsights(
    adsPerformance: GoogleAdsPerformance[],
    _allData: any
  ): QualifiedInsight[] {
    const messageGroups = this.groupByMessage(adsPerformance);
    const insights: QualifiedInsight[] = [];

    messageGroups.forEach((performance, message) => {
      const metrics = this.calculateAdsMetrics(performance);
      
      if (metrics.totalConversions >= this.config.thresholds.minConversions) {
        const score = this.calculateScore({
          ads: performance,
        });

        if (score >= this.config.thresholds.minScore) {
          insights.push({
            id: randomUUID(),
            type: 'message',
            name: message,
            score,
            signals: {
              ads: performance,
            },
            metrics,
            recommendations: this.generateMessageRecommendations(performance, metrics),
          });
        }
      }
    });

    return insights;
  }

  /**
   * Calculate comprehensive score based on all signals
   */
  private calculateScore(signals: {
    ga4?: GA4Event[];
    lifecycle?: HubSpotLifecycleEvent[];
    search?: SearchConsoleDemandSignal[];
    ads?: GoogleAdsPerformance[];
  }): number {
    let score = 0;
    let totalWeight = 0;

    if (signals.ga4 && signals.ga4.length > 0) {
      score += this.config.weights.ga4 * this.normalizeScore(signals.ga4.length, 100);
      totalWeight += this.config.weights.ga4;
    }

    if (signals.lifecycle && signals.lifecycle.length > 0) {
      score += this.config.weights.lifecycle * this.normalizeScore(signals.lifecycle.length, 50);
      totalWeight += this.config.weights.lifecycle;
    }

    if (signals.search && signals.search.length > 0) {
      const totalClicks = signals.search.reduce((sum, s) => sum + s.clicks, 0);
      score += this.config.weights.search * this.normalizeScore(totalClicks, 100);
      totalWeight += this.config.weights.search;
    }

    if (signals.ads && signals.ads.length > 0) {
      const totalConversions = signals.ads.reduce((sum, a) => sum + a.conversions, 0);
      score += this.config.weights.ads * this.normalizeScore(totalConversions, 20);
      totalWeight += this.config.weights.ads;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Normalize a value to 0-1 range
   */
  private normalizeScore(value: number, maxValue: number): number {
    return Math.min(value / maxValue, 1);
  }

  /**
   * Rank insights by score
   */
  private rankInsights(insights: QualifiedInsight[]): QualifiedInsight[] {
    return insights.sort((a, b) => b.score - a.score);
  }

  /**
   * Helper methods for grouping data
   */
  private groupByQuery(signals: SearchConsoleDemandSignal[]): Map<string, SearchConsoleDemandSignal[]> {
    const groups = new Map<string, SearchConsoleDemandSignal[]>();
    signals.forEach(signal => {
      if (!groups.has(signal.query)) {
        groups.set(signal.query, []);
      }
      groups.get(signal.query)!.push(signal);
    });
    return groups;
  }

  private groupByPage(signals: SearchConsoleDemandSignal[]): Map<string, SearchConsoleDemandSignal[]> {
    const groups = new Map<string, SearchConsoleDemandSignal[]>();
    signals.forEach(signal => {
      if (!groups.has(signal.page)) {
        groups.set(signal.page, []);
      }
      groups.get(signal.page)!.push(signal);
    });
    return groups;
  }

  private groupByJourney(events: HubSpotLifecycleEvent[]): Map<string, HubSpotLifecycleEvent[]> {
    const groups = new Map<string, HubSpotLifecycleEvent[]>();
    events.forEach(event => {
      const journey = `${event.fromStage} → ${event.toStage}`;
      if (!groups.has(journey)) {
        groups.set(journey, []);
      }
      groups.get(journey)!.push(event);
    });
    return groups;
  }

  private groupByMessage(performance: GoogleAdsPerformance[]): Map<string, GoogleAdsPerformance[]> {
    const groups = new Map<string, GoogleAdsPerformance[]>();
    performance.forEach(p => {
      const message = p.campaignName;
      if (!groups.has(message)) {
        groups.set(message, []);
      }
      groups.get(message)!.push(p);
    });
    return groups;
  }

  /**
   * Calculate metrics from signals
   */
  private calculateMetrics(signals: SearchConsoleDemandSignal[]): {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgPosition?: number;
  } {
    return {
      totalImpressions: signals.reduce((sum, s) => sum + s.impressions, 0),
      totalClicks: signals.reduce((sum, s) => sum + s.clicks, 0),
      totalConversions: 0,
      avgPosition: signals.reduce((sum, s) => sum + s.position, 0) / signals.length,
    };
  }

  private calculateAdsMetrics(performance: GoogleAdsPerformance[]): {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalCost?: number;
    roi?: number;
  } {
    const totalCost = performance.reduce((sum, p) => sum + p.cost, 0);
    const totalConversions = performance.reduce((sum, p) => sum + p.conversions, 0);
    
    return {
      totalImpressions: performance.reduce((sum, p) => sum + p.impressions, 0),
      totalClicks: performance.reduce((sum, p) => sum + p.clicks, 0),
      totalConversions,
      totalCost,
      roi: totalCost > 0 ? (totalConversions * 100 - totalCost) / totalCost : undefined,
    };
  }

  /**
   * Find related conversions
   */
  private findRelatedConversions(conversions: GA4Conversion[] | undefined, query: string): GA4Conversion[] {
    if (!conversions) return [];
    return conversions.filter(c => 
      c.campaign?.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Generate recommendations
   */
  private generateQueryRecommendations(signals: SearchConsoleDemandSignal[], metrics: any): string[] {
    const recommendations: string[] = [];
    
    if (metrics.avgPosition && metrics.avgPosition > 10) {
      recommendations.push('Optimize content to improve search ranking');
    }
    
    if (metrics.totalImpressions > 1000 && metrics.totalClicks < 50) {
      recommendations.push('Improve meta descriptions and titles to increase CTR');
    }
    
    recommendations.push('Create targeted marketing event for this query');
    
    return recommendations;
  }

  private generatePageRecommendations(signals: SearchConsoleDemandSignal[], metrics: any): string[] {
    const recommendations: string[] = [];
    
    recommendations.push('Create landing page optimization campaign');
    
    if (metrics.totalClicks > 100) {
      recommendations.push('Set up A/B testing for conversion optimization');
    }
    
    return recommendations;
  }

  private generateJourneyRecommendations(_events: HubSpotLifecycleEvent[]): string[] {
    return [
      'Create nurture campaign for this lifecycle transition',
      'Identify common touchpoints in successful journeys',
    ];
  }

  private generateMessageRecommendations(performance: GoogleAdsPerformance[], metrics: any): string[] {
    const recommendations: string[] = [];
    
    if (metrics.roi && metrics.roi > 2) {
      recommendations.push('Scale this high-performing campaign');
    }
    
    recommendations.push('Apply messaging insights to other channels');
    
    return recommendations;
  }
}
