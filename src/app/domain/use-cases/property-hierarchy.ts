import { Building, BuildingLayer, PropertyModel, Shape } from '../entities/property-model';
import { describeShapeGeometry } from './shape-metrics';

export type PropertyNodeKind = 'property' | 'building' | 'layer' | 'shape';

export interface DrawerNode {
  readonly id: string;
  readonly parentId: string | null;
  readonly kind: PropertyNodeKind;
  readonly level: number;
  readonly name: string;
  readonly typeLabel: string;
  readonly geometrySummary: string;
  readonly styleSummary: string;
  readonly visibilitySummary: string;
  readonly visible: boolean;
  readonly effectiveVisible: boolean;
  readonly canToggleVisibility: boolean;
}

export interface SelectedShapeDetails {
  readonly shape: Shape;
  readonly buildingId: string;
  readonly layerId: string;
}

export const getPropertyRootNodeId = (property: PropertyModel): string =>
  `property:${property.metadata.propertyId}`;

export const createDrawerNodes = (property: PropertyModel): readonly DrawerNode[] => {
  const propertyRootId = getPropertyRootNodeId(property);
  const nodes: DrawerNode[] = [
    {
      id: propertyRootId,
      parentId: null,
      kind: 'property',
      level: 1,
      name: property.metadata.displayName,
      typeLabel: 'property',
      geometrySummary: `${property.widthCm} x ${property.heightCm} cm`,
      styleSummary: 'n/a',
      visibilitySummary: 'Visible',
      visible: true,
      effectiveVisible: true,
      canToggleVisibility: false,
    },
  ];

  for (const building of property.buildings) {
    nodes.push({
      id: building.id,
      parentId: propertyRootId,
      kind: 'building',
      level: 2,
      name: building.name,
      typeLabel: 'building',
      geometrySummary: `${building.layers.length} layer(s)`,
      styleSummary: 'n/a',
      visibilitySummary: building.visible ? 'Visible' : 'Hidden',
      visible: building.visible,
      effectiveVisible: building.visible,
      canToggleVisibility: true,
    });

    for (const layer of building.layers) {
      nodes.push({
        id: layer.id,
        parentId: building.id,
        kind: 'layer',
        level: 3,
        name: layer.name,
        typeLabel: 'layer',
        geometrySummary: `${layer.shapes.length} top-level shape(s)`,
        styleSummary: 'n/a',
        visibilitySummary: getVisibilitySummary(layer.visible, building.visible && layer.visible),
        visible: layer.visible,
        effectiveVisible: building.visible && layer.visible,
        canToggleVisibility: true,
      });

      for (const shape of layer.shapes) {
        appendShapeNode(nodes, shape, layer.id, 4, building.visible && layer.visible);
      }
    }
  }

  return nodes;
};

const appendShapeNode = (
  nodes: DrawerNode[],
  shape: Shape,
  parentId: string,
  level: number,
  parentVisible: boolean,
): void => {
  const effectiveVisible = parentVisible && shape.visible;

  nodes.push({
    id: shape.id,
    parentId,
    kind: 'shape',
    level,
    name: shape.name,
    typeLabel: shape.semanticType,
    geometrySummary: describeShapeGeometry(shape),
    styleSummary: describeShapeStyle(shape),
    visibilitySummary: getVisibilitySummary(shape.visible, effectiveVisible),
    visible: shape.visible,
    effectiveVisible,
    canToggleVisibility: true,
  });

  if (shape.kind !== 'rectangle') {
    return;
  }

  for (const child of shape.children) {
    appendShapeNode(nodes, child, shape.id, level + 1, effectiveVisible);
  }
};

const describeShapeStyle = (shape: Shape): string => {
  if (shape.kind === 'rectangle') {
    return `stroke ${shape.strokeColor}, fill ${shape.fillColor}, z ${shape.zIndex}`;
  }

  return `stroke ${shape.strokeColor}, z ${shape.zIndex}`;
};

const getVisibilitySummary = (visible: boolean, effectiveVisible: boolean): string => {
  if (!visible) {
    return 'Hidden';
  }

  return effectiveVisible ? 'Visible' : 'Hidden by parent';
};

export const findSelectedShape = (
  property: PropertyModel,
  shapeId: string | null,
): SelectedShapeDetails | null => {
  if (!shapeId) {
    return null;
  }

  for (const building of property.buildings) {
    for (const layer of building.layers) {
      const shape = findShapeInCollection(layer.shapes, shapeId);
      if (shape) {
        return {
          shape,
          buildingId: building.id,
          layerId: layer.id,
        };
      }
    }
  }

  return null;
};

const findShapeInCollection = (shapes: readonly Shape[], shapeId: string): Shape | null => {
  for (const shape of shapes) {
    if (shape.id === shapeId) {
      return shape;
    }

    if (shape.kind === 'rectangle') {
      const nested = findShapeInCollection(shape.children, shapeId);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

export const updateVisibilityByNodeId = (
  property: PropertyModel,
  nodeId: string,
  visible: boolean,
): PropertyModel => ({
  ...property,
  buildings: property.buildings.map((building) =>
    updateBuildingVisibility(building, nodeId, visible),
  ),
});

const updateBuildingVisibility = (
  building: Building,
  nodeId: string,
  visible: boolean,
): Building => {
  if (building.id === nodeId) {
    return {
      ...building,
      visible,
    };
  }

  return {
    ...building,
    layers: building.layers.map((layer) => updateLayerVisibility(layer, nodeId, visible)),
  };
};

const updateLayerVisibility = (
  layer: BuildingLayer,
  nodeId: string,
  visible: boolean,
): BuildingLayer => {
  if (layer.id === nodeId) {
    return {
      ...layer,
      visible,
    };
  }

  return {
    ...layer,
    shapes: layer.shapes.map((shape) => updateShapeVisibility(shape, nodeId, visible)),
  };
};

const updateShapeVisibility = (shape: Shape, nodeId: string, visible: boolean): Shape => {
  if (shape.id === nodeId) {
    return {
      ...shape,
      visible,
    };
  }

  if (shape.kind !== 'rectangle') {
    return shape;
  }

  return {
    ...shape,
    children: shape.children.map((child) => updateShapeVisibility(child, nodeId, visible)),
  };
};

export const updateShapeById = (
  property: PropertyModel,
  shapeId: string,
  updater: (shape: Shape) => Shape,
): PropertyModel => ({
  ...property,
  buildings: property.buildings.map((building) => ({
    ...building,
    layers: building.layers.map((layer) => ({
      ...layer,
      shapes: layer.shapes.map((shape) => updateShapeTree(shape, shapeId, updater)),
    })),
  })),
});

const updateShapeTree = (
  shape: Shape,
  shapeId: string,
  updater: (shape: Shape) => Shape,
): Shape => {
  if (shape.id === shapeId) {
    return updater(shape);
  }

  if (shape.kind !== 'rectangle') {
    return shape;
  }

  return {
    ...shape,
    children: shape.children.map((child) => updateShapeTree(child, shapeId, updater)),
  };
};
