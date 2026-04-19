import { PropertyModel, Shape } from '../entities/property-model';

interface ProjectedShapeBase {
  readonly id: string;
  readonly name: string;
  readonly semanticType: string;
  readonly zIndex: number;
  readonly strokeColor: string;
  readonly strokeThicknessCm: number;
}

export interface ProjectedRectangleShape extends ProjectedShapeBase {
  readonly kind: 'rectangle';
  readonly xCm: number;
  readonly yCm: number;
  readonly widthCm: number;
  readonly heightCm: number;
  readonly fillColor: string;
}

export interface ProjectedLineShape extends ProjectedShapeBase {
  readonly kind: 'line';
  readonly startXCm: number;
  readonly startYCm: number;
  readonly endXCm: number;
  readonly endYCm: number;
}

export type ProjectedShape = ProjectedRectangleShape | ProjectedLineShape;

export interface LayoutProjection {
  readonly widthCm: number;
  readonly heightCm: number;
  readonly shapes: readonly ProjectedShape[];
}

export const projectPropertyToLayout = (property: PropertyModel): LayoutProjection => {
  const projectedShapes: ProjectedShape[] = [];

  for (const building of property.buildings) {
    if (!building.visible) {
      continue;
    }

    for (const layer of building.layers) {
      if (!layer.visible) {
        continue;
      }

      for (const shape of layer.shapes) {
        appendProjectedShape(projectedShapes, shape, 0, 0, true);
      }
    }
  }

  return {
    widthCm: property.widthCm,
    heightCm: property.heightCm,
    shapes: [...projectedShapes].sort((left, right) => left.zIndex - right.zIndex),
  };
};

const appendProjectedShape = (
  projectedShapes: ProjectedShape[],
  shape: Shape,
  parentXCm: number,
  parentYCm: number,
  parentVisible: boolean,
): void => {
  const effectiveVisible = parentVisible && shape.visible;
  if (!effectiveVisible) {
    return;
  }

  if (shape.kind === 'rectangle') {
    const absoluteXCm = parentXCm + shape.anchor.xCm;
    const absoluteYCm = parentYCm + shape.anchor.yCm;

    projectedShapes.push({
      kind: 'rectangle',
      id: shape.id,
      name: shape.name,
      semanticType: shape.semanticType,
      zIndex: shape.zIndex,
      strokeColor: shape.strokeColor,
      strokeThicknessCm: shape.strokeThicknessCm,
      fillColor: shape.fillColor,
      xCm: absoluteXCm,
      yCm: absoluteYCm,
      widthCm: shape.widthCm,
      heightCm: shape.heightCm,
    });

    for (const child of shape.children) {
      appendProjectedShape(projectedShapes, child, absoluteXCm, absoluteYCm, effectiveVisible);
    }

    return;
  }

  projectedShapes.push({
    kind: 'line',
    id: shape.id,
    name: shape.name,
    semanticType: shape.semanticType,
    zIndex: shape.zIndex,
    strokeColor: shape.strokeColor,
    strokeThicknessCm: shape.strokeThicknessCm,
    startXCm: parentXCm + shape.start.xCm,
    startYCm: parentYCm + shape.start.yCm,
    endXCm: parentXCm + shape.end.xCm,
    endYCm: parentYCm + shape.end.yCm,
  });
};
