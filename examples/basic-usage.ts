/**
 * Basic Usage Example for HubSpot Marketing Events Synthesis Agent
 * 
 * This example demonstrates how to use the agent programmatically
 */

import { MarketingEventsSynthesisAgent } from '../src/agent';
import { IntegrationConfig, SynthesisConfig } from '../src/types';

async function main() {
  // Configure integrations
  const integrationConfig: IntegrationConfig = {
    hubspot: {
      apiKey: process.env.HUBSPOT_API_KEY || 'your-api-key-here',
      portalId: process.env.HUBSPOT_PORTAL_ID || 'your-portal-id',
    },
    // Optional: Add GA4 configuration
    ga4: process.env.GA4_PROPERTY_ID ? {
      propertyId: process.env.GA4_PROPERTY_ID,
      credentials: JSON.parse(process.env.GA4_CREDENTIALS || '{}'),
    } : undefined,
    // Optional: Add Search Console configuration
    googleSearchConsole: process.env.GSC_SITE_URL ? {
      siteUrl: process.env.GSC_SITE_URL,
      credentials: JSON.parse(process.env.GSC_CREDENTIALS || '{}'),
    } : undefined,
    // Optional: Add Google Ads configuration
    googleAds: process.env.GOOGLE_ADS_CUSTOMER_ID ? {
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
      credentials: JSON.parse(process.env.GOOGLE_ADS_CREDENTIALS || '{}'),
    } : undefined,
  };

  // Configure synthesis parameters
  const synthesisConfig: SynthesisConfig = {
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(),
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

  // Create the agent
  const agent = new MarketingEventsSynthesisAgent(integrationConfig, synthesisConfig);

  try {
    // Example 1: Run complete synthesis and create marketing events
    console.log('Running complete synthesis...\n');
    const result = await agent.run();

    console.log(`\nResults:`);
    console.log(`- Generated ${result.insights.length} qualified insights`);
    console.log(`- Created ${result.eventsSynced.created.length} new marketing events`);
    console.log(`- Updated ${result.eventsSynced.updated.length} existing events`);
    console.log(`- Deleted ${result.eventsSynced.deleted.length} obsolete events`);

    // Display top insights
    if (result.insights.length > 0) {
      console.log('\nTop 3 Insights:');
      result.insights.slice(0, 3).forEach((insight, index) => {
        console.log(`\n${index + 1}. ${insight.type.toUpperCase()}: ${insight.name}`);
        console.log(`   Score: ${insight.score.toFixed(2)}`);
        console.log(`   Impressions: ${insight.metrics.totalImpressions}`);
        console.log(`   Clicks: ${insight.metrics.totalClicks}`);
        console.log(`   Conversions: ${insight.metrics.totalConversions}`);
        console.log(`   Recommendations:`);
        insight.recommendations.forEach(rec => {
          console.log(`   - ${rec}`);
        });
      });
    }

    // Example 2: Get current marketing events
    console.log('\n\nFetching current marketing events...');
    const events = await agent.getCurrentEvents();
    console.log(`Found ${events.length} marketing events`);

  } catch (error) {
    console.error('Error running agent:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
}

export { main };
