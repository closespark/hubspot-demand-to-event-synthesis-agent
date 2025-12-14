/**
 * Core type definitions for the HubSpot Marketing Events Synthesis Agent
 */

// GA4 Data Types
export interface GA4Event {
  eventName: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  page: string;
  eventParams: Record<string, any>;
}

export interface GA4Conversion {
  conversionName: string;
  timestamp: Date;
  userId?: string;
  value?: number;
  currency?: string;
  source: string;
  medium: string;
  campaign?: string;
}

// HubSpot Types
export interface HubSpotLifecycleEvent {
  contactId: string;
  fromStage: string;
  toStage: string;
  timestamp: Date;
  properties: Record<string, any>;
}

export interface HubSpotMarketingEvent {
  eventName: string;
  eventType: string;
  startDateTime: number;
  endDateTime?: number;
  eventDescription?: string;
  eventOrganizer: string;
  customProperties?: Record<string, any>;
  externalEventId?: string;
}

// Google Search Console Types
export interface SearchConsoleDemandSignal {
  query: string;
  page: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  date: Date;
}

// Google Ads Types
export interface GoogleAdsPerformance {
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  adGroupName: string;
  keyword: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  date: Date;
}

// Synthesis Types
export interface QualifiedInsight {
  id: string;
  type: 'query' | 'page' | 'journey' | 'message';
  name: string;
  score: number;
  signals: {
    ga4?: GA4Event[];
    conversions?: GA4Conversion[];
    lifecycle?: HubSpotLifecycleEvent[];
    search?: SearchConsoleDemandSignal[];
    ads?: GoogleAdsPerformance[];
  };
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgPosition?: number;
    totalCost?: number;
    roi?: number;
  };
  recommendations: string[];
}

export interface SynthesisConfig {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  thresholds: {
    minImpressions: number;
    minConversions: number;
    minScore: number;
  };
  weights: {
    ga4: number;
    lifecycle: number;
    search: number;
    ads: number;
  };
}

// Configuration Types
export interface IntegrationConfig {
  ga4?: {
    propertyId: string;
    credentials: any;
  };
  hubspot: {
    apiKey: string;
    portalId: string;
  };
  googleSearchConsole?: {
    siteUrl: string;
    credentials: any;
  };
  googleAds?: {
    customerId: string;
    credentials: any;
  };
}
