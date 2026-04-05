import { describe, it, expect } from 'vitest';
import { getWeatherDescription } from '../../src/lib/weather-codes';

describe('lib/weather-codes', () => {
  it('returns description for code 0', () => {
    expect(getWeatherDescription(0)).toBe('Clear sky');
  });

  it('returns description for code 61', () => {
    expect(getWeatherDescription(61)).toBe('Slight rain');
  });

  it('returns unknown for unmapped code 999', () => {
    expect(getWeatherDescription(999)).toBe('Unknown (code: 999)');
  });

  it('returns unknown for code 100', () => {
    expect(getWeatherDescription(100)).toBe('Unknown (code: 100)');
  });
});
