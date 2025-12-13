# HubSpot Marketing Events Synthesis Agent

A strategic agent that ingests and synthesizes data from GA4, HubSpot lifecycle events, Google Search Console, and Google Ads to identify queries, pages, journeys, and messages driving qualified outcomes. It automatically converts validated insights into strategically defined HubSpot Marketing Events via the HubSpot Marketing Events API.

## Overview

This agent acts as a control layer that:
1. **Ingests** multi-source demand signals (GA4 behavior/conversions, HubSpot lifecycle events, Google Search Console demand signals, Google Ads performance)
2. **Synthesizes** insights by identifying high-performing queries, pages, customer journeys, and messaging
3. **Creates** strategic HubSpot Marketing Events that serve as the control layer for downstream social, content, and paid execution

## Features

- 🔄 **Multi-Source Data Ingestion**: Connects to GA4, HubSpot, Google Search Console, and Google Ads
- 🧠 **Intelligent Synthesis**: Weighted scoring algorithm identifies qualified insights
- 📊 **Automated Event Management**: Creates, updates, and manages HubSpot Marketing Events via API
- ⚖️ **Configurable Scoring**: Customize thresholds and weights for different signal types
- 🎯 **Actionable Recommendations**: Generates specific recommendations for each insight
- 🔄 **Sync Management**: Automatically syncs insights with existing marketing events

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure your credentials:

```bash
cp .env.example .env
```

### Required Configuration

- `HUBSPOT_API_KEY`: Your HubSpot API key (Private App token recommended)
- `HUBSPOT_PORTAL_ID`: Your HubSpot portal/account ID

### Optional Integrations

Configure only the data sources you want to use:

- **GA4**: Set `GA4_PROPERTY_ID` and `GA4_CREDENTIALS`
- **Google Search Console**: Set `GSC_SITE_URL` and `GSC_CREDENTIALS`
- **Google Ads**: Set `GOOGLE_ADS_CUSTOMER_ID` and `GOOGLE_ADS_CREDENTIALS`

### Synthesis Parameters

- `DAYS_BACK`: Number of days to look back for data (default: 30)
- `MIN_IMPRESSIONS`: Minimum impressions threshold (default: 100)
- `MIN_CONVERSIONS`: Minimum conversions threshold (default: 1)
- `MIN_SCORE`: Minimum insight score threshold (default: 0.5)

### Weighting Configuration

Adjust the importance of different signals (must sum to 1.0):

- `WEIGHT_GA4`: Weight for GA4 behavior data (default: 0.25)
- `WEIGHT_LIFECYCLE`: Weight for HubSpot lifecycle events (default: 0.35)
- `WEIGHT_SEARCH`: Weight for Search Console data (default: 0.20)
- `WEIGHT_ADS`: Weight for Google Ads data (default: 0.20)

## Usage

### Build the project

```bash
npm run build
```

### Run the agent

```bash
npm start
```

Or in development mode:

```bash
npm run dev
```

### Programmatic Usage

```typescript
import { MarketingEventsSynthesisAgent } from './agent';
import { loadIntegrationConfig, loadSynthesisConfig } from './config';

const integrationConfig = loadIntegrationConfig();
const synthesisConfig = loadSynthesisConfig();

const agent = new MarketingEventsSynthesisAgent(integrationConfig, synthesisConfig);

// Run complete synthesis and event creation
const result = await agent.run();
console.log(`Generated ${result.insights.length} insights`);

// Or just synthesize without creating events
const insights = await agent.synthesizeOnly();
```

## Architecture

### Data Flow

```
┌─────────────────┐
│  Data Sources   │
│  - GA4          │
│  - HubSpot      │
│  - Search Con.  │
│  - Google Ads   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Integrations  │
│   Layer         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Synthesis     │
│   Engine        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Qualified      │
│  Insights       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   HubSpot       │
│   Marketing     │
│   Events API    │
└─────────────────┘
```

### Components

- **Integrations Layer**: Modules for each data source (GA4, HubSpot, Search Console, Google Ads)
- **Synthesis Engine**: Processes and scores insights based on configurable thresholds and weights
- **Marketing Events API**: Creates and manages HubSpot Marketing Events
- **Agent Orchestrator**: Coordinates the complete workflow

## Insight Types

The agent generates four types of qualified insights:

1. **Query Insights**: High-performing search queries from Search Console
2. **Page Insights**: Pages driving significant engagement and conversions
3. **Journey Insights**: Customer lifecycle transitions with high conversion rates
4. **Message Insights**: Ad campaigns and messaging with strong performance

## Scoring Algorithm

Insights are scored using a weighted formula:

```
Score = (GA4_weight × GA4_score) + (Lifecycle_weight × Lifecycle_score) + 
        (Search_weight × Search_score) + (Ads_weight × Ads_score)
```

Each signal is normalized and weighted according to your configuration. Only insights exceeding the minimum score threshold are converted to marketing events.

## Development

### Run tests

```bash
npm test
```

### Run linter

```bash
npm run lint
```

### Fix linting issues

```bash
npm run lint:fix
```

## API Reference

### MarketingEventsSynthesisAgent

Main agent class that orchestrates the entire process.

#### Methods

- `run()`: Execute complete synthesis and event creation
- `synthesizeOnly()`: Generate insights without creating events
- `getCurrentEvents()`: Retrieve existing marketing events

### SynthesisEngine

Core synthesis logic.

#### Methods

- `synthesizeInsights(data)`: Process multi-source data and generate qualified insights

### HubSpotMarketingEventsAPI

HubSpot Marketing Events API client.

#### Methods

- `createEvent(insight)`: Create a new marketing event
- `updateEvent(eventId, insight)`: Update an existing event
- `deleteEvent(eventId)`: Delete an event
- `syncEvents(insights)`: Sync insights with existing events

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

ISC

## Support

For issues and questions, please open an issue in the GitHub repository.