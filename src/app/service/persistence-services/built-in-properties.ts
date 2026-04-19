import { BuiltInProperty } from '../../domain/entities/property-model';

export const BUILT_IN_PROPERTIES: readonly BuiltInProperty[] = [
  {
    id: 'compact-home',
    title: 'Compact Home Example',
    data: {
      schemaVersion: '1.0.0',
      metadata: {
        propertyId: 'prop-compact-home',
        displayName: 'Compact Home Example',
      },
      widthCm: 2500,
      heightCm: 2050,
      exportMetadata: {
        exportedAtIso: '1970-01-01T00:00:00.000Z',
      },
      buildings: [
        {
          id: 'building-main-house',
          name: 'Main House',
          visible: true,
          layers: [
            {
              id: 'layer-ground-floor',
              name: 'Ground Floor',
              visible: true,
              shapes: [
                {
                  id: 'room-living',
                  kind: 'rectangle',
                  name: 'Living Room',
                  semanticType: 'room',
                  visible: true,
                  strokeColor: '#1d4ed8',
                  fillColor: '#dbeafe',
                  strokeThicknessCm: 2,
                  zIndex: 1,
                  parentShapeId: null,
                  anchor: { xCm: 150, yCm: 200 },
                  widthCm: 700,
                  heightCm: 520,
                  children: [
                    {
                      id: 'wall-living-north',
                      kind: 'line',
                      name: 'North Wall',
                      semanticType: 'wall',
                      visible: true,
                      strokeColor: '#0f172a',
                      strokeThicknessCm: 2,
                      zIndex: 2,
                      parentShapeId: 'room-living',
                      start: { xCm: 0, yCm: 520 },
                      end: { xCm: 700, yCm: 520 },
                      openingDirection: null,
                    },
                    {
                      id: 'door-living-entry',
                      kind: 'line',
                      name: 'Entry Door',
                      semanticType: 'door',
                      visible: true,
                      strokeColor: '#16a34a',
                      strokeThicknessCm: 2,
                      zIndex: 3,
                      parentShapeId: 'room-living',
                      start: { xCm: 300, yCm: 0 },
                      end: { xCm: 420, yCm: 0 },
                      openingDirection: 'inward',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'two-structure-yard',
    title: 'House + Garage Example',
    data: {
      schemaVersion: '1.0.0',
      metadata: {
        propertyId: 'prop-two-structure-yard',
        displayName: 'House + Garage Example',
      },
      widthCm: 3200,
      heightCm: 2400,
      exportMetadata: {
        exportedAtIso: '1970-01-01T00:00:00.000Z',
      },
      buildings: [
        {
          id: 'building-house',
          name: 'House',
          visible: true,
          layers: [
            {
              id: 'layer-house-ground',
              name: 'Ground Floor',
              visible: true,
              shapes: [
                {
                  id: 'room-kitchen',
                  kind: 'rectangle',
                  name: 'Kitchen',
                  semanticType: 'room',
                  visible: true,
                  strokeColor: '#7c3aed',
                  fillColor: '#ede9fe',
                  strokeThicknessCm: 2,
                  zIndex: 1,
                  parentShapeId: null,
                  anchor: { xCm: 180, yCm: 160 },
                  widthCm: 620,
                  heightCm: 460,
                  children: [],
                },
              ],
            },
          ],
        },
        {
          id: 'building-garage',
          name: 'Garage',
          visible: true,
          layers: [
            {
              id: 'layer-garage-ground',
              name: 'Ground Floor',
              visible: true,
              shapes: [
                {
                  id: 'room-garage-shell',
                  kind: 'rectangle',
                  name: 'Garage Shell',
                  semanticType: 'helper-frame',
                  visible: true,
                  strokeColor: '#334155',
                  fillColor: '#e2e8f0',
                  strokeThicknessCm: 2,
                  zIndex: 1,
                  parentShapeId: null,
                  anchor: { xCm: 1600, yCm: 140 },
                  widthCm: 500,
                  heightCm: 400,
                  children: [
                    {
                      id: 'opening-garage-main',
                      kind: 'line',
                      name: 'Garage Opening',
                      semanticType: 'opening',
                      visible: true,
                      strokeColor: '#ea580c',
                      strokeThicknessCm: 2,
                      zIndex: 2,
                      parentShapeId: 'room-garage-shell',
                      start: { xCm: 120, yCm: 0 },
                      end: { xCm: 320, yCm: 0 },
                      openingDirection: 'outward',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
];
