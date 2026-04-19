import {
  Building,
  BuildingLayer,
  LineShape,
  PropertyModel,
  RectangleShape,
  Shape,
} from '../entities/property-model';

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
}

const hasNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const validatePropertyModel = (value: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!isObject(value)) {
    return { isValid: false, errors: ['Expected a JSON object at the root.'] };
  }

  const property = value as Partial<PropertyModel>;

  if (property.schemaVersion !== '1.0.0') {
    errors.push('Unsupported or missing schemaVersion. Expected 1.0.0.');
  }

  if (!property.metadata?.propertyId) {
    errors.push('Missing metadata.propertyId.');
  }

  if (!property.metadata?.displayName) {
    errors.push('Missing metadata.displayName.');
  }

  if (!hasNumber(property.widthCm) || property.widthCm <= 0) {
    errors.push('Property widthCm must be a positive number.');
  }

  if (!hasNumber(property.heightCm) || property.heightCm <= 0) {
    errors.push('Property heightCm must be a positive number.');
  }

  if (!Array.isArray(property.buildings)) {
    errors.push('Property buildings must be an array.');
  } else {
    property.buildings.forEach((building, buildingIndex) => {
      validateBuilding(building, buildingIndex, errors);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateBuilding = (building: Building, buildingIndex: number, errors: string[]): void => {
  if (!building.id) {
    errors.push(`Building at index ${buildingIndex} is missing id.`);
  }

  if (!Array.isArray(building.layers)) {
    errors.push(`Building ${building.id || buildingIndex} must include layers array.`);
    return;
  }

  building.layers.forEach((layer, layerIndex) => {
    validateLayer(layer, building.id || `#${buildingIndex}`, layerIndex, errors);
  });
};

const validateLayer = (
  layer: BuildingLayer,
  buildingId: string,
  layerIndex: number,
  errors: string[],
): void => {
  if (!layer.id) {
    errors.push(`Layer at index ${layerIndex} in building ${buildingId} is missing id.`);
  }

  if (!Array.isArray(layer.shapes)) {
    errors.push(`Layer ${layer.id || layerIndex} must include shapes array.`);
    return;
  }

  layer.shapes.forEach((shape, shapeIndex) => {
    validateShape(
      shape,
      `building ${buildingId} layer ${layer.id || layerIndex}`,
      shapeIndex,
      errors,
    );
  });
};

const validateShape = (
  shape: Shape,
  context: string,
  shapeIndex: number,
  errors: string[],
): void => {
  if (shape.kind !== 'rectangle' && shape.kind !== 'line') {
    errors.push(`Shape at ${context} index ${shapeIndex} has unsupported kind.`);
    return;
  }

  if (!shape.id) {
    errors.push(`Shape at ${context} index ${shapeIndex} is missing id.`);
  }

  if (!shape.name) {
    errors.push(`Shape ${shape.id || shapeIndex} in ${context} is missing name.`);
  }

  if (shape.kind === 'rectangle') {
    validateRectangle(shape, context, errors);
    shape.children.forEach((child, childIndex) => {
      validateShape(child, `${context} rectangle ${shape.id}`, childIndex, errors);
    });
    return;
  }

  validateLine(shape, context, errors);
};

const validateRectangle = (shape: RectangleShape, context: string, errors: string[]): void => {
  if (!hasNumber(shape.widthCm) || shape.widthCm <= 0) {
    errors.push(`Rectangle ${shape.id} in ${context} must have widthCm > 0.`);
  }

  if (!hasNumber(shape.heightCm) || shape.heightCm <= 0) {
    errors.push(`Rectangle ${shape.id} in ${context} must have heightCm > 0.`);
  }

  if (!Array.isArray(shape.children)) {
    errors.push(`Rectangle ${shape.id} in ${context} must include children array.`);
  }
};

const validateLine = (shape: LineShape, context: string, errors: string[]): void => {
  if (!shape.parentShapeId) {
    errors.push(`Line ${shape.id} in ${context} must reference a rectangle parentShapeId.`);
  }

  if (!hasNumber(shape.start.xCm) || !hasNumber(shape.start.yCm)) {
    errors.push(`Line ${shape.id} in ${context} has invalid start coordinates.`);
  }

  if (!hasNumber(shape.end.xCm) || !hasNumber(shape.end.yCm)) {
    errors.push(`Line ${shape.id} in ${context} has invalid end coordinates.`);
  }
};
