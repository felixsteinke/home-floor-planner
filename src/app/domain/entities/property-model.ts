export type ShapeSemanticType =
  | 'property'
  | 'building'
  | 'building-layer'
  | 'room'
  | 'wall'
  | 'door'
  | 'opening'
  | 'helper-frame';

export interface PointCm {
  readonly xCm: number;
  readonly yCm: number;
}

interface ShapeBase {
  readonly id: string;
  readonly name: string;
  readonly semanticType: ShapeSemanticType;
  readonly visible: boolean;
  readonly strokeColor: string;
  readonly strokeThicknessCm: number;
  readonly zIndex: number;
  readonly parentShapeId: string | null;
}

export interface RectangleShape extends ShapeBase {
  readonly kind: 'rectangle';
  readonly anchor: PointCm;
  readonly widthCm: number;
  readonly heightCm: number;
  readonly fillColor: string;
  readonly children: Shape[];
}

export interface LineShape extends ShapeBase {
  readonly kind: 'line';
  readonly start: PointCm;
  readonly end: PointCm;
  readonly openingDirection: 'inward' | 'outward' | null;
}

export type Shape = RectangleShape | LineShape;

export interface BuildingLayer {
  readonly id: string;
  readonly name: string;
  readonly visible: boolean;
  readonly shapes: Shape[];
}

export interface Building {
  readonly id: string;
  readonly name: string;
  readonly visible: boolean;
  readonly layers: BuildingLayer[];
}

export interface PropertyMetadata {
  readonly propertyId: string;
  readonly displayName: string;
}

export interface ExportMetadata {
  readonly exportedAtIso: string;
}

export interface PropertyModel {
  readonly schemaVersion: '1.0.0';
  readonly metadata: PropertyMetadata;
  readonly widthCm: number;
  readonly heightCm: number;
  readonly buildings: Building[];
  readonly exportMetadata: ExportMetadata;
}

export interface BuiltInProperty {
  readonly id: string;
  readonly title: string;
  readonly data: PropertyModel;
}

export type ActivePropertySource =
  | { readonly kind: 'built-in'; readonly builtInId: string }
  | { readonly kind: 'imported' }
  | { readonly kind: 'local-restore' };
