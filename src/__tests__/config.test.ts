import { loadSynthesisConfig, validateConfig } from '../config';
import { IntegrationConfig } from '../types';

describe('Configuration', () => {
  describe('loadSynthesisConfig', () => {
    it('should load config with default values', () => {
      const config = loadSynthesisConfig();
      
      expect(config.thresholds.minImpressions).toBeGreaterThan(0);
      expect(config.thresholds.minConversions).toBeGreaterThan(0);
      expect(config.thresholds.minScore).toBeGreaterThan(0);
      
      expect(config.weights.ga4).toBeGreaterThan(0);
      expect(config.weights.lifecycle).toBeGreaterThan(0);
      expect(config.weights.search).toBeGreaterThan(0);
      expect(config.weights.ads).toBeGreaterThan(0);
      
      expect(config.dateRange.startDate).toBeInstanceOf(Date);
      expect(config.dateRange.endDate).toBeInstanceOf(Date);
    });

    it('should have end date after start date', () => {
      const config = loadSynthesisConfig();
      expect(config.dateRange.endDate.getTime()).toBeGreaterThan(
        config.dateRange.startDate.getTime()
      );
    });
  });

  describe('validateConfig', () => {
    it('should throw error when HubSpot API key is missing', () => {
      const config: IntegrationConfig = {
        hubspot: {
          apiKey: '',
          portalId: 'test-portal',
        },
      };

      expect(() => validateConfig(config)).toThrow('HUBSPOT_API_KEY is required');
    });

    it('should throw error when HubSpot portal ID is missing', () => {
      const config: IntegrationConfig = {
        hubspot: {
          apiKey: 'test-key',
          portalId: '',
        },
      };

      expect(() => validateConfig(config)).toThrow('HUBSPOT_PORTAL_ID is required');
    });

    it('should not throw error when required config is present', () => {
      const config: IntegrationConfig = {
        hubspot: {
          apiKey: 'test-key',
          portalId: 'test-portal',
        },
      };

      expect(() => validateConfig(config)).not.toThrow();
    });
  });
});
