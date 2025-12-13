import axios, { AxiosInstance } from 'axios';
import { HubSpotMarketingEvent, QualifiedInsight } from '../types';

/**
 * HubSpot Marketing Events API Client
 * Manages creation, update, and deletion of Marketing Events via HubSpot API
 */
export class HubSpotMarketingEventsAPI {
  private client: AxiosInstance;
  private appId: string;

  constructor(apiKey: string, appId: string = 'demand-synthesis-agent') {
    this.appId = appId;
    this.client = axios.create({
      baseURL: 'https://api.hubapi.com/marketing/v3/marketing-events',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a marketing event from a qualified insight
   */
  async createEvent(insight: QualifiedInsight): Promise<string> {
    const event = this.insightToMarketingEvent(insight);
    
    try {
      const response = await this.client.post(`/events`, event);
      console.log(`Created marketing event: ${response.data.id} for insight: ${insight.name}`);
      return response.data.id;
    } catch (error) {
      console.error('Error creating marketing event:', error);
      throw error;
    }
  }

  /**
   * Update an existing marketing event
   */
  async updateEvent(eventId: string, insight: QualifiedInsight): Promise<void> {
    const event = this.insightToMarketingEvent(insight);
    
    try {
      await this.client.patch(`/events/${this.appId}/${eventId}`, event);
      console.log(`Updated marketing event: ${eventId}`);
    } catch (error) {
      console.error('Error updating marketing event:', error);
      throw error;
    }
  }

  /**
   * Delete a marketing event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.client.delete(`/events/${this.appId}/${eventId}`);
      console.log(`Deleted marketing event: ${eventId}`);
    } catch (error) {
      console.error('Error deleting marketing event:', error);
      throw error;
    }
  }

  /**
   * Get all marketing events for this app
   */
  async getEvents(): Promise<any[]> {
    try {
      const response = await this.client.get(`/events`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching marketing events:', error);
      throw error;
    }
  }

  /**
   * Convert a qualified insight to a HubSpot Marketing Event
   */
  private insightToMarketingEvent(insight: QualifiedInsight): HubSpotMarketingEvent {
    const now = Date.now();
    const eventType = this.mapInsightTypeToEventType(insight.type);
    
    return {
      eventName: this.generateEventName(insight),
      eventType,
      startDateTime: now,
      endDateTime: now + (30 * 24 * 60 * 60 * 1000), // 30 days from now
      eventDescription: this.generateEventDescription(insight),
      eventOrganizer: this.appId,
      externalEventId: insight.id,
      customProperties: {
        insightType: insight.type,
        insightScore: insight.score.toString(),
        totalImpressions: insight.metrics.totalImpressions.toString(),
        totalClicks: insight.metrics.totalClicks.toString(),
        totalConversions: insight.metrics.totalConversions.toString(),
        recommendations: JSON.stringify(insight.recommendations),
      },
    };
  }

  /**
   * Map insight type to HubSpot event type
   */
  private mapInsightTypeToEventType(type: string): string {
    const typeMap: Record<string, string> = {
      query: 'SEMINAR',
      page: 'WEBINAR',
      journey: 'WORKSHOP',
      message: 'CONFERENCE',
    };
    return typeMap[type] || 'SEMINAR';
  }

  /**
   * Generate event name from insight
   */
  private generateEventName(insight: QualifiedInsight): string {
    const typeLabel = insight.type.charAt(0).toUpperCase() + insight.type.slice(1);
    return `${typeLabel} Campaign: ${insight.name}`;
  }

  /**
   * Generate event description from insight
   */
  private generateEventDescription(insight: QualifiedInsight): string {
    const parts = [
      `Qualified ${insight.type} insight with score ${insight.score.toFixed(2)}`,
      `Metrics: ${insight.metrics.totalImpressions} impressions, ${insight.metrics.totalClicks} clicks, ${insight.metrics.totalConversions} conversions`,
    ];

    if (insight.recommendations.length > 0) {
      parts.push(`Recommendations: ${insight.recommendations.join('; ')}`);
    }

    return parts.join('. ');
  }

  /**
   * Batch create events from multiple insights
   */
  async batchCreateEvents(insights: QualifiedInsight[]): Promise<string[]> {
    const eventIds: string[] = [];
    
    for (const insight of insights) {
      try {
        const eventId = await this.createEvent(insight);
        eventIds.push(eventId);
      } catch (error) {
        console.error(`Failed to create event for insight ${insight.id}:`, error);
      }
    }
    
    return eventIds;
  }

  /**
   * Sync insights with existing events
   */
  async syncEvents(insights: QualifiedInsight[]): Promise<{
    created: string[];
    updated: string[];
    deleted: string[];
  }> {
    const result = {
      created: [] as string[],
      updated: [] as string[],
      deleted: [] as string[],
    };

    try {
      const existingEvents = await this.getEvents();
      const existingEventMap = new Map(
        existingEvents.map(e => [e.externalEventId, e.id])
      );
      const insightIds = new Set(insights.map(i => i.id));

      // Create or update insights
      for (const insight of insights) {
        if (existingEventMap.has(insight.id)) {
          const eventId = existingEventMap.get(insight.id)!;
          await this.updateEvent(eventId, insight);
          result.updated.push(eventId);
        } else {
          const eventId = await this.createEvent(insight);
          result.created.push(eventId);
        }
      }

      // Delete events that no longer have corresponding insights
      for (const [externalId, eventId] of existingEventMap.entries()) {
        if (!insightIds.has(externalId)) {
          await this.deleteEvent(eventId);
          result.deleted.push(eventId);
        }
      }
    } catch (error) {
      console.error('Error syncing events:', error);
      throw error;
    }

    return result;
  }
}
