import { describe, expect, it } from 'vitest';
import { PropertyModel } from '../entities/property-model';
import { projectPropertyToLayout } from './layout-projection';

const testProperty: PropertyModel = {
  schemaVersion: '1.0.0',
  metadata: {
    propertyId: 'projection-test',
    displayName: 'Projection Test',
  },
  widthCm: 1000,
  heightCm: 800,
  exportMetadata: {
    exportedAtIso: '1970-01-01T00:00:00.000Z',
  },
  buildings: [
    {
      id: 'building-1',
      name: 'Building 1',
      visible: true,
      layers: [
        {
          id: 'layer-1',
          name: 'Layer 1',
          visible: true,
          shapes: [
            {
              id: 'rect-1',
              kind: 'rectangle',
              name: 'Rect 1',
              semanticType: 'room',
              visible: true,
              strokeColor: '#000000',
              fillColor: '#ffffff',
              strokeThicknessCm: 2,
              zIndex: 1,
              parentShapeId: null,
              anchor: { xCm: 100, yCm: 120 },
              widthCm: 300,
              heightCm: 200,
              children: [
                {
                  id: 'line-1',
                  kind: 'line',
                  name: 'Line 1',
                  semanticType: 'wall',
                  visible: true,
                  strokeColor: '#333333',
                  strokeThicknessCm: 2,
                  zIndex: 2,
                  parentShapeId: 'rect-1',
                  start: { xCm: 20, yCm: 30 },
                  end: { xCm: 140, yCm: 30 },
                  openingDirection: null,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe('projectPropertyToLayout', () => {
  it('projects rectangle and nested line using absolute coordinates', () => {
    const projection = projectPropertyToLayout(testProperty);

    const rectangle = projection.shapes.find((shape) => shape.id === 'rect-1');
    const line = projection.shapes.find((shape) => shape.id === 'line-1');

    expect(rectangle?.kind).toBe('rectangle');
    if (rectangle?.kind === 'rectangle') {
      expect(rectangle.xCm).toBe(100);
      expect(rectangle.yCm).toBe(120);
    }

    expect(line?.kind).toBe('line');
    if (line?.kind === 'line') {
      expect(line.startXCm).toBe(120);
      expect(line.startYCm).toBe(150);
      expect(line.endXCm).toBe(240);
      expect(line.endYCm).toBe(150);
    }
  });

  it('skips shapes hidden by parent visibility', () => {
    const hiddenParent: PropertyModel = {
      ...testProperty,
      buildings: [
        {
          ...testProperty.buildings[0],
          visible: false,
        },
      ],
    };

    const projection = projectPropertyToLayout(hiddenParent);
    expect(projection.shapes.length).toBe(0);
  });
});
