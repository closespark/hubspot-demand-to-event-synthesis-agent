import dotenv from 'dotenv';
import { IntegrationConfig, SynthesisConfig } from '../types';

dotenv.config();

/**
 * Load integration configuration from environment variables
 */
export function loadIntegrationConfig(): IntegrationConfig {
  return {
    hubspot: {
      apiKey: process.env.HUBSPOT_API_KEY || '',
      portalId: process.env.HUBSPOT_PORTAL_ID || '',
    },
    ga4: process.env.GA4_PROPERTY_ID ? {
      propertyId: process.env.GA4_PROPERTY_ID,
      credentials: process.env.GA4_CREDENTIALS ? JSON.parse(process.env.GA4_CREDENTIALS) : null,
    } : undefined,
    googleSearchConsole: process.env.GSC_SITE_URL ? {
      siteUrl: process.env.GSC_SITE_URL,
      credentials: process.env.GSC_CREDENTIALS ? JSON.parse(process.env.GSC_CREDENTIALS) : null,
    } : undefined,
    googleAds: process.env.GOOGLE_ADS_CUSTOMER_ID ? {
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
      credentials: process.env.GOOGLE_ADS_CREDENTIALS ? JSON.parse(process.env.GOOGLE_ADS_CREDENTIALS) : null,
    } : undefined,
  };
}

/**
 * Load synthesis configuration with defaults
 */
export function loadSynthesisConfig(): SynthesisConfig {
  const daysBack = parseInt(process.env.DAYS_BACK || '30', 10);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  return {
    dateRange: {
      startDate,
      endDate,
    },
    thresholds: {
      minImpressions: parseInt(process.env.MIN_IMPRESSIONS || '100', 10),
      minConversions: parseInt(process.env.MIN_CONVERSIONS || '1', 10),
      minScore: parseFloat(process.env.MIN_SCORE || '0.5'),
    },
    weights: {
      ga4: parseFloat(process.env.WEIGHT_GA4 || '0.25'),
      lifecycle: parseFloat(process.env.WEIGHT_LIFECYCLE || '0.35'),
      search: parseFloat(process.env.WEIGHT_SEARCH || '0.20'),
      ads: parseFloat(process.env.WEIGHT_ADS || '0.20'),
    },
  };
}

/**
 * Validate required configuration
 */
export function validateConfig(config: IntegrationConfig): void {
  if (!config.hubspot.apiKey) {
    throw new Error('HUBSPOT_API_KEY is required');
  }
  if (!config.hubspot.portalId) {
    throw new Error('HUBSPOT_PORTAL_ID is required');
  }
}
