import {
  Building,
  BuildingLayer,
  LineShape,
  PropertyModel,
  RectangleShape,
  Shape,
  ShapeSemanticType,
} from '../entities/property-model';

export interface AddBuildingInput {
  readonly buildingId: string;
  readonly buildingName: string;
  readonly layerId: string;
  readonly layerName: string;
  readonly rectangle: {
    readonly id: string;
    readonly name: string;
    readonly anchorXCm: number;
    readonly anchorYCm: number;
    readonly widthCm: number;
    readonly heightCm: number;
    readonly semanticType: 'building' | 'room' | 'helper-frame';
    readonly visible: boolean;
  };
}

export interface AddRectangleInput {
  readonly buildingId: string;
  readonly layerId: string;
  readonly parentRectangleId: string | null;
  readonly rectangle: {
    readonly id: string;
    readonly name: string;
    readonly anchorXCm: number;
    readonly anchorYCm: number;
    readonly widthCm: number;
    readonly heightCm: number;
    readonly semanticType: 'room' | 'helper-frame' | 'building';
    readonly visible: boolean;
    readonly strokeColor: string;
    readonly fillColor: string;
    readonly strokeThicknessCm: number;
    readonly zIndex: number;
  };
}

export interface AddLineInput {
  readonly buildingId: string;
  readonly layerId: string;
  readonly parentRectangleId: string;
  readonly line: {
    readonly id: string;
    readonly name: string;
    readonly startXCm: number;
    readonly startYCm: number;
    readonly endXCm: number;
    readonly endYCm: number;
    readonly semanticType: 'wall' | 'door' | 'opening';
    readonly openingDirection: 'inward' | 'outward' | null;
    readonly visible: boolean;
    readonly strokeColor: string;
    readonly strokeThicknessCm: number;
    readonly zIndex: number;
  };
}

export interface ShapeContext {
  readonly buildingId: string;
  readonly layerId: string;
  readonly shape: Shape;
}

export const updatePropertyFrameDimensions = (
  property: PropertyModel,
  widthCm: number,
  heightCm: number,
): PropertyModel => ({
  ...property,
  widthCm,
  heightCm,
});

export const addBuildingWithDefaultLayer = (
  property: PropertyModel,
  input: AddBuildingInput,
): PropertyModel => {
  const topRectangle: RectangleShape = {
    id: input.rectangle.id,
    kind: 'rectangle',
    name: input.rectangle.name,
    semanticType: input.rectangle.semanticType,
    visible: input.rectangle.visible,
    strokeColor: '#1d4ed8',
    fillColor: '#dbeafe',
    strokeThicknessCm: 2,
    zIndex: 1,
    parentShapeId: null,
    anchor: {
      xCm: input.rectangle.anchorXCm,
      yCm: input.rectangle.anchorYCm,
    },
    widthCm: input.rectangle.widthCm,
    heightCm: input.rectangle.heightCm,
    children: [],
  };

  const layer: BuildingLayer = {
    id: input.layerId,
    name: input.layerName,
    visible: true,
    shapes: [topRectangle],
  };

  const building: Building = {
    id: input.buildingId,
    name: input.buildingName,
    visible: true,
    layers: [layer],
  };

  return {
    ...property,
    buildings: [...property.buildings, building],
  };
};

export const addLayerToBuilding = (
  property: PropertyModel,
  buildingId: string,
  layerId: string,
  layerName: string,
): PropertyModel => ({
  ...property,
  buildings: property.buildings.map((building) => {
    if (building.id !== buildingId) {
      return building;
    }

    return {
      ...building,
      layers: [
        ...building.layers,
        {
          id: layerId,
          name: layerName,
          visible: true,
          shapes: [],
        },
      ],
    };
  }),
});

export const addRectangleShape = (
  property: PropertyModel,
  input: AddRectangleInput,
): PropertyModel => ({
  ...property,
  buildings: property.buildings.map((building) => {
    if (building.id !== input.buildingId) {
      return building;
    }

    return {
      ...building,
      layers: building.layers.map((layer) => {
        if (layer.id !== input.layerId) {
          return layer;
        }

        const rectangle: RectangleShape = {
          id: input.rectangle.id,
          kind: 'rectangle',
          name: input.rectangle.name,
          semanticType: input.rectangle.semanticType,
          visible: input.rectangle.visible,
          strokeColor: input.rectangle.strokeColor,
          fillColor: input.rectangle.fillColor,
          strokeThicknessCm: input.rectangle.strokeThicknessCm,
          zIndex: input.rectangle.zIndex,
          parentShapeId: input.parentRectangleId,
          anchor: {
            xCm: input.rectangle.anchorXCm,
            yCm: input.rectangle.anchorYCm,
          },
          widthCm: input.rectangle.widthCm,
          heightCm: input.rectangle.heightCm,
          children: [],
        };

        if (!input.parentRectangleId) {
          return {
            ...layer,
            shapes: [...layer.shapes, rectangle],
          };
        }

        return {
          ...layer,
          shapes: appendChildToRectangle(layer.shapes, input.parentRectangleId, rectangle),
        };
      }),
    };
  }),
});

export const addLineShape = (property: PropertyModel, input: AddLineInput): PropertyModel => ({
  ...property,
  buildings: property.buildings.map((building) => {
    if (building.id !== input.buildingId) {
      return building;
    }

    return {
      ...building,
      layers: building.layers.map((layer) => {
        if (layer.id !== input.layerId) {
          return layer;
        }

        const line: LineShape = {
          id: input.line.id,
          kind: 'line',
          name: input.line.name,
          semanticType: input.line.semanticType,
          visible: input.line.visible,
          strokeColor: input.line.strokeColor,
          strokeThicknessCm: input.line.strokeThicknessCm,
          zIndex: input.line.zIndex,
          parentShapeId: input.parentRectangleId,
          start: {
            xCm: input.line.startXCm,
            yCm: input.line.startYCm,
          },
          end: {
            xCm: input.line.endXCm,
            yCm: input.line.endYCm,
          },
          openingDirection: input.line.openingDirection,
        };

        return {
          ...layer,
          shapes: appendChildToRectangle(layer.shapes, input.parentRectangleId, line),
        };
      }),
    };
  }),
});

export const deleteNodeById = (property: PropertyModel, nodeId: string): PropertyModel => ({
  ...property,
  buildings: property.buildings
    .filter((building) => building.id !== nodeId)
    .map((building) => ({
      ...building,
      layers: building.layers
        .filter((layer) => layer.id !== nodeId)
        .map((layer) => ({
          ...layer,
          shapes: removeShapeFromTree(layer.shapes, nodeId),
        })),
    })),
});

export const findShapeContext = (property: PropertyModel, shapeId: string): ShapeContext | null => {
  for (const building of property.buildings) {
    for (const layer of building.layers) {
      const shape = findShapeInTree(layer.shapes, shapeId);
      if (shape) {
        return {
          buildingId: building.id,
          layerId: layer.id,
          shape,
        };
      }
    }
  }

  return null;
};

export const setVisibilityBySemanticType = (
  property: PropertyModel,
  semanticType: ShapeSemanticType,
  visible: boolean,
): PropertyModel => ({
  ...property,
  buildings: property.buildings.map((building) => ({
    ...building,
    layers: building.layers.map((layer) => ({
      ...layer,
      shapes: updateVisibilityByType(layer.shapes, semanticType, visible),
    })),
  })),
});

const appendChildToRectangle = (
  shapes: readonly Shape[],
  rectangleId: string,
  child: Shape,
): Shape[] =>
  shapes.map((shape) => {
    if (shape.id === rectangleId && shape.kind === 'rectangle') {
      return {
        ...shape,
        children: [...shape.children, child],
      };
    }

    if (shape.kind !== 'rectangle') {
      return shape;
    }

    return {
      ...shape,
      children: appendChildToRectangle(shape.children, rectangleId, child),
    };
  });

const removeShapeFromTree = (shapes: readonly Shape[], nodeId: string): Shape[] =>
  shapes
    .filter((shape) => shape.id !== nodeId)
    .map((shape) => {
      if (shape.kind !== 'rectangle') {
        return shape;
      }

      return {
        ...shape,
        children: removeShapeFromTree(shape.children, nodeId),
      };
    });

const findShapeInTree = (shapes: readonly Shape[], shapeId: string): Shape | null => {
  for (const shape of shapes) {
    if (shape.id === shapeId) {
      return shape;
    }

    if (shape.kind === 'rectangle') {
      const child = findShapeInTree(shape.children, shapeId);
      if (child) {
        return child;
      }
    }
  }

  return null;
};

const updateVisibilityByType = (
  shapes: readonly Shape[],
  semanticType: ShapeSemanticType,
  visible: boolean,
): Shape[] =>
  shapes.map((shape) => {
    const baseShape =
      shape.semanticType === semanticType
        ? {
            ...shape,
            visible,
          }
        : shape;

    if (baseShape.kind !== 'rectangle') {
      return baseShape;
    }

    return {
      ...baseShape,
      children: updateVisibilityByType(baseShape.children, semanticType, visible),
    };
  });
