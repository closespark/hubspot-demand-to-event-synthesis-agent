# Examples

This directory contains example usage patterns for the HubSpot Marketing Events Synthesis Agent.

## Basic Usage

The `basic-usage.ts` file demonstrates the core functionality of the agent:

1. Configuring integrations
2. Setting synthesis parameters
3. Running the complete synthesis process
4. Accessing generated insights
5. Retrieving marketing events

### Running the Example

```bash
# Using ts-node
npx ts-node examples/basic-usage.ts

# Or compile and run
npm run build
node dist/examples/basic-usage.js
```

### Prerequisites

Make sure you have configured your `.env` file with the necessary credentials:

```bash
HUBSPOT_API_KEY=your_api_key
HUBSPOT_PORTAL_ID=your_portal_id
# Add other optional configurations as needed
```

## Extending the Examples

You can modify the example to:
- Adjust threshold values for different qualification criteria
- Change the weight distribution between signal sources
- Customize the date range for data ingestion
- Filter insights by type or score

## Additional Use Cases

### Synthesis Only (No Event Creation)

```typescript
import { MarketingEventsSynthesisAgent } from '../src/agent';

const agent = new MarketingEventsSynthesisAgent(config, synthesisConfig);
const insights = await agent.synthesizeOnly();

// Work with insights without creating events
insights.forEach(insight => {
  console.log(`${insight.type}: ${insight.name} (score: ${insight.score})`);
});
```

### Batch Event Creation

```typescript
import { HubSpotMarketingEventsAPI } from '../src/hubspot/marketing-events-api';

const api = new HubSpotMarketingEventsAPI(apiKey);
const eventIds = await api.batchCreateEvents(insights);
```

### Custom Filtering

```typescript
// Filter high-scoring insights only
const topInsights = insights.filter(i => i.score > 0.8);

// Filter by insight type
const queryInsights = insights.filter(i => i.type === 'query');
const journeyInsights = insights.filter(i => i.type === 'journey');
```
