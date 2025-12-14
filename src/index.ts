import { MarketingEventsSynthesisAgent } from './agent';
import { loadIntegrationConfig, loadSynthesisConfig, validateConfig } from './config';

/**
 * Main entry point for the HubSpot Marketing Events Synthesis Agent
 */
async function main() {
  try {
    // Load configuration
    console.log('Loading configuration...');
    const integrationConfig = loadIntegrationConfig();
    const synthesisConfig = loadSynthesisConfig();

    // Validate required configuration
    validateConfig(integrationConfig);

    // Create and run the agent
    const agent = new MarketingEventsSynthesisAgent(integrationConfig, synthesisConfig);
    
    // Run the complete synthesis and event creation process
    const result = await agent.run();

    // Output results
    console.log('\n=== Results ===');
    console.log(`Total insights generated: ${result.insights.length}`);
    console.log(`Marketing events created: ${result.eventsSynced.created.length}`);
    console.log(`Marketing events updated: ${result.eventsSynced.updated.length}`);
    console.log(`Marketing events deleted: ${result.eventsSynced.deleted.length}`);
    
    if (result.insights.length > 0) {
      console.log('\nTop 5 insights:');
      result.insights.slice(0, 5).forEach((insight, index) => {
        console.log(`${index + 1}. [${insight.type}] ${insight.name} (score: ${insight.score.toFixed(2)})`);
        console.log(`   Metrics: ${insight.metrics.totalImpressions} impressions, ${insight.metrics.totalClicks} clicks, ${insight.metrics.totalConversions} conversions`);
      });
    }

    console.log('\nAgent completed successfully!');
  } catch (error) {
    console.error('Error running agent:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export * from './agent';
export * from './types';
export * from './config';
export * from './integrations/ga4';
export * from './integrations/hubspot-lifecycle';
export * from './integrations/search-console';
export * from './integrations/google-ads';
export * from './synthesis/engine';
export * from './hubspot/marketing-events-api';

// Run if executed directly
if (require.main === module) {
  main();
}
