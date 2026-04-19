import { PropertyModel } from '../../domain/entities/property-model';
import { BUILT_IN_PROPERTIES } from './built-in-properties';

export interface StaticWorkbook {
  readonly workbookPath: string;
  readonly title: string;
  readonly sourceBuiltInId: string;
  readonly property: PropertyModel;
}

export const STATIC_WORKBOOKS: readonly StaticWorkbook[] = BUILT_IN_PROPERTIES.map((builtIn) => ({
  workbookPath: builtIn.id,
  title: builtIn.title,
  sourceBuiltInId: builtIn.id,
  property: builtIn.data,
}));
