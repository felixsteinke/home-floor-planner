import { describe, expect, it } from 'vitest';
import { validatePropertyModel } from './property-validation';

describe('validatePropertyModel', () => {
  it('returns valid for a minimal property model', () => {
    const result = validatePropertyModel({
      schemaVersion: '1.0.0',
      metadata: {
        propertyId: 'prop-1',
        displayName: 'Example',
      },
      widthCm: 1000,
      heightCm: 1200,
      buildings: [],
    });

    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('collects validation errors for invalid shape', () => {
    const result = validatePropertyModel({
      schemaVersion: '9.9.9',
      metadata: {},
      widthCm: -10,
      heightCm: 0,
      buildings: 'wrong',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
