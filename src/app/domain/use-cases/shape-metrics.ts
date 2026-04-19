import { LineShape, RectangleShape, Shape } from '../entities/property-model';

export const calculateRectangleAreaCm2 = (shape: RectangleShape): number =>
  shape.widthCm * shape.heightCm;

export const calculateLineLengthCm = (shape: LineShape): number => {
  const xDelta = shape.end.xCm - shape.start.xCm;
  const yDelta = shape.end.yCm - shape.start.yCm;

  return Math.hypot(xDelta, yDelta);
};

export const describeShapeGeometry = (shape: Shape): string => {
  if (shape.kind === 'rectangle') {
    const areaCm2 = calculateRectangleAreaCm2(shape);
    return `${shape.widthCm} x ${shape.heightCm} cm (area ${areaCm2.toFixed(0)} cm2)`;
  }

  const lengthCm = calculateLineLengthCm(shape);
  return `length ${lengthCm.toFixed(0)} cm`;
};
