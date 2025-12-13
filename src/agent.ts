import { IntegrationConfig, SynthesisConfig, QualifiedInsight } from './types';
import { GA4Integration } from './integrations/ga4';
import { HubSpotLifecycleIntegration } from './integrations/hubspot-lifecycle';
import { SearchConsoleIntegration } from './integrations/search-console';
import { GoogleAdsIntegration } from './integrations/google-ads';
import { SynthesisEngine } from './synthesis/engine';
import { HubSpotMarketingEventsAPI } from './hubspot/marketing-events-api';

/**
 * Main Agent Orchestrator
 * Coordinates data ingestion, synthesis, and marketing event creation
 */
export class MarketingEventsSynthesisAgent {
  private integrationConfig: IntegrationConfig;
  private synthesisConfig: SynthesisConfig;
  private marketingEventsAPI: HubSpotMarketingEventsAPI;
  private synthesisEngine: SynthesisEngine;

  // Integration instances
  private ga4Integration?: GA4Integration;
  private lifecycleIntegration: HubSpotLifecycleIntegration;
  private searchConsoleIntegration?: SearchConsoleIntegration;
  private googleAdsIntegration?: GoogleAdsIntegration;

  constructor(integrationConfig: IntegrationConfig, synthesisConfig: SynthesisConfig) {
    this.integrationConfig = integrationConfig;
    this.synthesisConfig = synthesisConfig;

    // Initialize HubSpot API (required)
    this.marketingEventsAPI = new HubSpotMarketingEventsAPI(
      integrationConfig.hubspot.apiKey
    );
    this.lifecycleIntegration = new HubSpotLifecycleIntegration(
      integrationConfig.hubspot.apiKey
    );

    // Initialize optional integrations
    if (integrationConfig.ga4) {
      this.ga4Integration = new GA4Integration(
        integrationConfig.ga4.propertyId,
        integrationConfig.ga4.credentials
      );
    }

    if (integrationConfig.googleSearchConsole) {
      this.searchConsoleIntegration = new SearchConsoleIntegration(
        integrationConfig.googleSearchConsole.siteUrl,
        integrationConfig.googleSearchConsole.credentials
      );
    }

    if (integrationConfig.googleAds) {
      this.googleAdsIntegration = new GoogleAdsIntegration(
        integrationConfig.googleAds.customerId,
        integrationConfig.googleAds.credentials
      );
    }

    // Initialize synthesis engine
    this.synthesisEngine = new SynthesisEngine(synthesisConfig);
  }

  /**
   * Run the complete synthesis process
   */
  async run(): Promise<{
    insights: QualifiedInsight[];
    eventsSynced: {
      created: string[];
      updated: string[];
      deleted: string[];
    };
  }> {
    console.log('Starting Marketing Events Synthesis Agent...');

    // Step 1: Ingest data from all sources
    console.log('Step 1: Ingesting data from all sources...');
    const data = await this.ingestData();

    // Step 2: Synthesize insights
    console.log('Step 2: Synthesizing insights...');
    const insights = this.synthesisEngine.synthesizeInsights(data);
    console.log(`Generated ${insights.length} qualified insights`);

    // Step 3: Create/update marketing events in HubSpot
    console.log('Step 3: Syncing marketing events to HubSpot...');
    const eventsSynced = await this.marketingEventsAPI.syncEvents(insights);
    console.log(`Events created: ${eventsSynced.created.length}, updated: ${eventsSynced.updated.length}, deleted: ${eventsSynced.deleted.length}`);

    console.log('Marketing Events Synthesis Agent completed successfully!');

    return {
      insights,
      eventsSynced,
    };
  }

  /**
   * Ingest data from all configured sources
   */
  private async ingestData() {
    const { startDate, endDate } = this.synthesisConfig.dateRange;
    const data: any = {};

    try {
      // Fetch GA4 data
      if (this.ga4Integration) {
        console.log('Fetching GA4 data...');
        const [events, conversions] = await Promise.all([
          this.ga4Integration.fetchEvents(startDate, endDate),
          this.ga4Integration.fetchConversions(startDate, endDate),
        ]);
        data.ga4Events = events;
        data.conversions = conversions;
        console.log(`Fetched ${events.length} GA4 events and ${conversions.length} conversions`);
      }

      // Fetch HubSpot lifecycle events
      console.log('Fetching HubSpot lifecycle events...');
      data.lifecycleEvents = await this.lifecycleIntegration.fetchLifecycleEvents(
        startDate,
        endDate
      );
      console.log(`Fetched ${data.lifecycleEvents.length} lifecycle events`);

      // Fetch Search Console data
      if (this.searchConsoleIntegration) {
        console.log('Fetching Search Console data...');
        data.searchSignals = await this.searchConsoleIntegration.fetchDemandSignals(
          startDate,
          endDate
        );
        console.log(`Fetched ${data.searchSignals.length} search signals`);
      }

      // Fetch Google Ads data
      if (this.googleAdsIntegration) {
        console.log('Fetching Google Ads data...');
        data.adsPerformance = await this.googleAdsIntegration.fetchPerformanceData(
          startDate,
          endDate
        );
        console.log(`Fetched ${data.adsPerformance.length} ads performance records`);
      }
    } catch (error) {
      console.error('Error ingesting data:', error);
      throw error;
    }

    return data;
  }

  /**
   * Run synthesis only (without creating events)
   */
  async synthesizeOnly(): Promise<QualifiedInsight[]> {
    console.log('Running synthesis only...');
    const data = await this.ingestData();
    const insights = this.synthesisEngine.synthesizeInsights(data);
    console.log(`Generated ${insights.length} qualified insights`);
    return insights;
  }

  /**
   * Get current marketing events
   */
  async getCurrentEvents() {
    return this.marketingEventsAPI.getEvents();
  }
}
