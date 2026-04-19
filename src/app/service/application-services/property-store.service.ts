import { computed, Injectable, signal } from '@angular/core';
import {
  ActivePropertySource,
  PropertyModel,
  ShapeSemanticType,
} from '../../domain/entities/property-model';
import { validatePropertyModel } from '../../domain/policies/property-validation';
import {
  addBuildingWithDefaultLayer,
  addLayerToBuilding,
  addLineShape,
  addRectangleShape,
  deleteNodeById,
  findShapeContext,
  setVisibilityBySemanticType,
  updatePropertyFrameDimensions,
} from '../../domain/use-cases/layout-editing';
import {
  createDrawerNodes,
  findSelectedShape,
  getPropertyRootNodeId,
  updateShapeById,
  updateVisibilityByNodeId,
} from '../../domain/use-cases/property-hierarchy';
import { BUILT_IN_PROPERTIES } from '../persistence-services/built-in-properties';
import { STATIC_WORKBOOKS, StaticWorkbook } from '../persistence-services/static-workbooks';

const WORKSPACE_STORAGE_KEY = 'home-floor-planner.workspace-v1';
const LEGACY_ACTIVE_PROPERTY_STORAGE_KEY = 'home-floor-planner.active-property';

interface WorkbookRecord {
  readonly id: string;
  readonly title: string;
  readonly workbookPath: string;
  readonly property: PropertyModel;
  readonly source: ActivePropertySource;
  readonly updatedAtIso: string;
}

interface CreatedWorkbook {
  readonly id: string;
  readonly workbookPath: string;
  readonly title: string;
}

interface PersistedWorkspaceSnapshot {
  readonly activeWorkbookId: string;
  readonly workbooks: WorkbookRecord[];
}

interface LegacyPersistedPropertySnapshot {
  readonly property: PropertyModel;
  readonly source: ActivePropertySource;
}

interface ImportResult {
  readonly ok: boolean;
  readonly message: string;
}

const cloneProperty = (property: PropertyModel): PropertyModel => {
  if (typeof structuredClone === 'function') {
    return structuredClone(property);
  }

  return JSON.parse(JSON.stringify(property)) as PropertyModel;
};

const nowIso = (): string => new Date().toISOString();

const normalizeWorkbookPath = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'workbook';
};

const createDefaultWorkbook = (): WorkbookRecord => ({
  id: 'workbook-default-1',
  title: STATIC_WORKBOOKS[0].title,
  workbookPath: STATIC_WORKBOOKS[0].workbookPath,
  property: cloneProperty(STATIC_WORKBOOKS[0].property),
  source: {
    kind: 'built-in',
    builtInId: STATIC_WORKBOOKS[0].sourceBuiltInId,
  },
  updatedAtIso: nowIso(),
});

const createBlankProperty = (workbookId: string, workbookTitle: string): PropertyModel => ({
  schemaVersion: '1.0.0',
  metadata: {
    propertyId: `prop-${workbookId}`,
    displayName: `${workbookTitle} property`,
  },
  widthCm: 2500,
  heightCm: 2000,
  buildings: [],
  exportMetadata: {
    exportedAtIso: nowIso(),
  },
});

@Injectable({
  providedIn: 'root',
})
export class PropertyStoreService {
  readonly builtInProperties = BUILT_IN_PROPERTIES;
  readonly staticWorkbooks = STATIC_WORKBOOKS;

  private readonly workbooksSignal = signal<readonly WorkbookRecord[]>([createDefaultWorkbook()]);
  private readonly activeWorkbookIdSignal = signal<string>('workbook-default-1');

  private readonly activePropertySignal = signal<PropertyModel>(
    cloneProperty(BUILT_IN_PROPERTIES[0].data),
  );

  private readonly activeSourceSignal = signal<ActivePropertySource>({
    kind: 'built-in',
    builtInId: BUILT_IN_PROPERTIES[0].id,
  });

  private readonly selectedNodeIdSignal = signal<string>(
    getPropertyRootNodeId(BUILT_IN_PROPERTIES[0].data),
  );

  private readonly idCounterSignal = signal(1);

  readonly workbooks = this.workbooksSignal.asReadonly();
  readonly activeWorkbookId = this.activeWorkbookIdSignal.asReadonly();
  readonly activeProperty = this.activePropertySignal.asReadonly();
  readonly activeSource = this.activeSourceSignal.asReadonly();
  readonly selectedNodeId = this.selectedNodeIdSignal.asReadonly();

  readonly workbookSummaries = computed(() =>
    this.workbooks().map((workbook) => ({
      id: workbook.id,
      title: workbook.title,
      workbookPath: workbook.workbookPath,
      updatedAtIso: workbook.updatedAtIso,
    })),
  );

  readonly activeWorkbookPath = computed(() => {
    const activeWorkbook = this.workbooks().find(
      (workbook) => workbook.id === this.activeWorkbookId(),
    );

    return activeWorkbook?.workbookPath ?? this.staticWorkbooks[0].workbookPath;
  });

  readonly activeWorkbookTitle = computed(() => {
    const activeWorkbook = this.workbooks().find(
      (workbook) => workbook.id === this.activeWorkbookId(),
    );

    return activeWorkbook?.title ?? 'Unknown workbook';
  });

  readonly activePropertyTitle = computed(() => this.activeProperty().metadata.displayName);

  readonly drawerNodes = computed(() => createDrawerNodes(this.activeProperty()));

  readonly selectedNode = computed(() => {
    const selectedId = this.selectedNodeId();
    return this.drawerNodes().find((node) => node.id === selectedId) ?? null;
  });

  readonly selectedShapeDetails = computed(() =>
    findSelectedShape(this.activeProperty(), this.selectedNodeId()),
  );

  readonly activePropertySummary = computed(() => {
    const property = this.activeProperty();
    const buildingCount = property.buildings.length;
    const layerCount = property.buildings.reduce(
      (count, building) => count + building.layers.length,
      0,
    );

    return {
      buildingCount,
      layerCount,
      propertyWidthCm: property.widthCm,
      propertyHeightCm: property.heightCm,
    };
  });

  constructor() {
    this.restoreFromLocalStorage();
  }

  createWorkbook(title: string): CreatedWorkbook | null {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return null;
    }

    const workbookId = this.nextId('workbook');
    const workbookPath = this.ensureUniqueWorkbookPath(normalizeWorkbookPath(trimmedTitle));
    const newWorkbook: WorkbookRecord = {
      id: workbookId,
      title: trimmedTitle,
      workbookPath,
      property: createBlankProperty(workbookId, trimmedTitle),
      source: { kind: 'local-restore' },
      updatedAtIso: nowIso(),
    };

    this.workbooksSignal.update((current) => [...current, newWorkbook]);
    this.switchWorkbook(workbookId);
    return {
      id: workbookId,
      workbookPath,
      title: trimmedTitle,
    };
  }

  openFirstStaticWorkbook(): boolean {
    const firstStaticWorkbook = this.staticWorkbooks[0];
    return this.openWorkbookByPath(firstStaticWorkbook.workbookPath);
  }

  openWorkbookByPath(workbookPath: string): boolean {
    const normalizedPath = normalizeWorkbookPath(workbookPath);
    const localWorkbook = this.workbooks().find(
      (workbook) => workbook.workbookPath === normalizedPath,
    );
    if (localWorkbook) {
      return this.switchWorkbook(localWorkbook.id);
    }

    const staticWorkbook = this.staticWorkbooks.find(
      (workbook) => workbook.workbookPath === normalizedPath,
    );
    if (!staticWorkbook) {
      return false;
    }

    this.createWorkbookFromStatic(staticWorkbook);
    return true;
  }

  switchWorkbook(workbookId: string): boolean {
    const workbook = this.workbooks().find((item) => item.id === workbookId);
    if (!workbook) {
      return false;
    }

    this.activeWorkbookIdSignal.set(workbook.id);
    this.activePropertySignal.set(cloneProperty(workbook.property));
    this.activeSourceSignal.set(workbook.source);
    this.selectedNodeIdSignal.set(getPropertyRootNodeId(workbook.property));
    this.persistToLocalStorage();
    return true;
  }

  selectNode(nodeId: string): void {
    const exists = this.drawerNodes().some((node) => node.id === nodeId);
    if (exists) {
      this.selectedNodeIdSignal.set(nodeId);
    }
  }

  toggleNodeVisibility(nodeId: string): boolean {
    const node = this.drawerNodes().find((item) => item.id === nodeId);
    if (!node || !node.canToggleVisibility) {
      return false;
    }

    const updatedProperty = updateVisibilityByNodeId(this.activeProperty(), nodeId, !node.visible);
    this.setActiveProperty(updatedProperty, this.activeSource());
    this.updateContextToHighestVisibleParent(updatedProperty);
    return true;
  }

  setSemanticTypeVisibility(semanticType: ShapeSemanticType, visible: boolean): void {
    const updatedProperty = setVisibilityBySemanticType(
      this.activeProperty(),
      semanticType,
      visible,
    );
    this.setActiveProperty(updatedProperty, this.activeSource());
  }

  updatePropertyFrame(widthCm: number, heightCm: number): boolean {
    if (widthCm <= 0 || heightCm <= 0) {
      return false;
    }

    const updatedProperty = updatePropertyFrameDimensions(this.activeProperty(), widthCm, heightCm);
    this.setActiveProperty(updatedProperty, this.activeSource());
    return true;
  }

  addBuildingRectangle(): string {
    const property = this.activeProperty();
    const buildingOrdinal = property.buildings.length + 1;
    const buildingId = this.nextId('building');
    const layerId = this.nextId('layer');
    const rectangleId = this.nextId('shape');

    const widthCm = Math.max(300, Math.round(property.widthCm / 3));
    const heightCm = Math.max(250, Math.round(property.heightCm / 3));

    const updatedProperty = addBuildingWithDefaultLayer(property, {
      buildingId,
      buildingName: `Building ${buildingOrdinal}`,
      layerId,
      layerName: 'Ground Floor',
      rectangle: {
        id: rectangleId,
        name: `Building ${buildingOrdinal} Frame`,
        anchorXCm: 120 + buildingOrdinal * 80,
        anchorYCm: 120 + buildingOrdinal * 80,
        widthCm,
        heightCm,
        semanticType: 'building',
        visible: true,
      },
    });

    this.setActiveProperty(updatedProperty, this.activeSource());
    this.selectedNodeIdSignal.set(rectangleId);
    return rectangleId;
  }

  addLayerUnderSelectedBuilding(): string | null {
    const selected = this.selectedNode();
    if (!selected || selected.kind !== 'building') {
      return null;
    }

    const layerId = this.nextId('layer');
    const updatedProperty = addLayerToBuilding(
      this.activeProperty(),
      selected.id,
      layerId,
      `Layer ${this.countLayers(selected.id) + 1}`,
    );

    this.setActiveProperty(updatedProperty, this.activeSource());
    this.selectedNodeIdSignal.set(layerId);
    return layerId;
  }

  addRectangleInSelectedContext(options?: {
    readonly asHelperFrame?: boolean;
    readonly hidden?: boolean;
  }): string | null {
    const context = this.resolveRectangleCreationContext();
    if (!context) {
      return null;
    }

    const rectangleId = this.nextId('shape');
    const semanticType = options?.asHelperFrame ? 'helper-frame' : 'room';

    const updatedProperty = addRectangleShape(this.activeProperty(), {
      buildingId: context.buildingId,
      layerId: context.layerId,
      parentRectangleId: context.parentRectangleId,
      rectangle: {
        id: rectangleId,
        name: semanticType === 'helper-frame' ? 'Hidden Frame' : 'Room',
        anchorXCm: 40,
        anchorYCm: 40,
        widthCm: 260,
        heightCm: 220,
        semanticType,
        visible: !(options?.hidden ?? false),
        strokeColor: semanticType === 'helper-frame' ? '#64748b' : '#1d4ed8',
        fillColor: semanticType === 'helper-frame' ? '#f8fafc' : '#dbeafe',
        strokeThicknessCm: 2,
        zIndex: 2,
      },
    });

    this.setActiveProperty(updatedProperty, this.activeSource());
    this.selectedNodeIdSignal.set(rectangleId);
    return rectangleId;
  }

  addLineInSelectedRectangleContext(options: {
    readonly semanticType: 'wall' | 'door' | 'opening';
    readonly openingDirection: 'inward' | 'outward' | null;
  }): string | null {
    const context = this.resolveLineCreationContext();
    if (!context) {
      return null;
    }

    const lineId = this.nextId('shape');

    const updatedProperty = addLineShape(this.activeProperty(), {
      buildingId: context.buildingId,
      layerId: context.layerId,
      parentRectangleId: context.parentRectangleId,
      line: {
        id: lineId,
        name: options.semanticType === 'wall' ? 'Wall Segment' : 'Opening Segment',
        startXCm: 20,
        startYCm: 20,
        endXCm: 180,
        endYCm: 20,
        semanticType: options.semanticType,
        openingDirection: options.openingDirection,
        visible: true,
        strokeColor: options.semanticType === 'wall' ? '#0f172a' : '#16a34a',
        strokeThicknessCm: 2,
        zIndex: 3,
      },
    });

    this.setActiveProperty(updatedProperty, this.activeSource());
    this.selectedNodeIdSignal.set(lineId);
    return lineId;
  }

  deleteSelectedNode(): boolean {
    const selected = this.selectedNode();
    if (!selected || selected.kind === 'property') {
      return false;
    }

    const updatedProperty = deleteNodeById(this.activeProperty(), selected.id);
    this.setActiveProperty(updatedProperty, this.activeSource());
    return true;
  }

  updateSelectedShapeName(name: string): boolean {
    const selected = this.selectedShapeDetails();
    const nextName = name.trim();
    if (!selected || nextName.length === 0) {
      return false;
    }

    const updatedProperty = updateShapeById(this.activeProperty(), selected.shape.id, (shape) => ({
      ...shape,
      name: nextName,
    }));

    this.setActiveProperty(updatedProperty, this.activeSource());
    return true;
  }

  updateSelectedShapeStyle(values: {
    readonly semanticType: ShapeSemanticType;
    readonly strokeColor: string;
    readonly fillColor: string;
    readonly strokeThicknessCm: number;
    readonly zIndex: number;
    readonly visible: boolean;
    readonly openingDirection: 'inward' | 'outward' | null;
  }): boolean {
    const selected = this.selectedShapeDetails();
    if (!selected || values.strokeThicknessCm <= 0) {
      return false;
    }

    const updatedProperty = updateShapeById(this.activeProperty(), selected.shape.id, (shape) => {
      if (shape.kind === 'rectangle') {
        return {
          ...shape,
          semanticType: values.semanticType,
          strokeColor: values.strokeColor,
          fillColor: values.fillColor,
          strokeThicknessCm: values.strokeThicknessCm,
          zIndex: values.zIndex,
          visible: values.visible,
        };
      }

      return {
        ...shape,
        semanticType: values.semanticType,
        strokeColor: values.strokeColor,
        strokeThicknessCm: values.strokeThicknessCm,
        zIndex: values.zIndex,
        visible: values.visible,
        openingDirection: values.openingDirection,
      };
    });

    this.setActiveProperty(updatedProperty, this.activeSource());
    return true;
  }

  updateSelectedRectangleGeometry(values: {
    readonly xCm: number;
    readonly yCm: number;
    readonly widthCm: number;
    readonly heightCm: number;
  }): boolean {
    const selected = this.selectedShapeDetails();
    if (!selected || selected.shape.kind !== 'rectangle') {
      return false;
    }

    const isValid = values.widthCm > 0 && values.heightCm > 0;
    if (!isValid) {
      return false;
    }

    const updatedProperty = updateShapeById(this.activeProperty(), selected.shape.id, (shape) => {
      if (shape.kind !== 'rectangle') {
        return shape;
      }

      return {
        ...shape,
        anchor: {
          xCm: values.xCm,
          yCm: values.yCm,
        },
        widthCm: values.widthCm,
        heightCm: values.heightCm,
      };
    });

    this.setActiveProperty(updatedProperty, this.activeSource());
    return true;
  }

  updateSelectedLineGeometry(values: {
    readonly startXCm: number;
    readonly startYCm: number;
    readonly endXCm: number;
    readonly endYCm: number;
  }): boolean {
    const selected = this.selectedShapeDetails();
    if (!selected || selected.shape.kind !== 'line') {
      return false;
    }

    const updatedProperty = updateShapeById(this.activeProperty(), selected.shape.id, (shape) => {
      if (shape.kind !== 'line') {
        return shape;
      }

      return {
        ...shape,
        start: {
          xCm: values.startXCm,
          yCm: values.startYCm,
        },
        end: {
          xCm: values.endXCm,
          yCm: values.endYCm,
        },
      };
    });

    this.setActiveProperty(updatedProperty, this.activeSource());
    return true;
  }

  selectBuiltInProperty(builtInId: string, requireConfirmation = true): boolean {
    const selection = this.builtInProperties.find((item) => item.id === builtInId);
    if (!selection) {
      return false;
    }

    if (requireConfirmation && !this.confirmReplacement()) {
      return false;
    }

    this.setActiveProperty(cloneProperty(selection.data), {
      kind: 'built-in',
      builtInId: selection.id,
    });

    return true;
  }

  clearLocalActiveProperty(requireConfirmation = true): boolean {
    if (requireConfirmation && !this.confirmClear()) {
      return false;
    }

    this.setActiveProperty(cloneProperty(this.builtInProperties[0].data), {
      kind: 'built-in',
      builtInId: this.builtInProperties[0].id,
    });

    return true;
  }

  importPropertyJson(jsonText: string, requireConfirmation = true): ImportResult {
    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(jsonText) as unknown;
    } catch {
      return {
        ok: false,
        message: 'Import failed: file is not valid JSON.',
      };
    }

    const validation = validatePropertyModel(parsedJson);
    if (!validation.isValid) {
      return {
        ok: false,
        message: `Import failed: ${validation.errors.join(' ')}`,
      };
    }

    if (requireConfirmation && !this.confirmReplacement()) {
      return {
        ok: false,
        message: 'Import cancelled.',
      };
    }

    this.setActiveProperty(cloneProperty(parsedJson as PropertyModel), {
      kind: 'imported',
    });

    return {
      ok: true,
      message: 'Import completed. Active property replaced successfully.',
    };
  }

  exportActivePropertyJson(): string {
    const property = this.activeProperty();
    const exportDocument: PropertyModel = {
      ...property,
      exportMetadata: {
        exportedAtIso: nowIso(),
      },
    };

    return JSON.stringify(exportDocument, null, 2);
  }

  private resolveRectangleCreationContext(): {
    readonly buildingId: string;
    readonly layerId: string;
    readonly parentRectangleId: string | null;
  } | null {
    const selected = this.selectedNode();
    if (!selected) {
      return null;
    }

    if (selected.kind === 'layer') {
      const context = this.findBuildingAndLayerByLayerId(selected.id);
      if (!context) {
        return null;
      }

      return {
        buildingId: context.buildingId,
        layerId: context.layerId,
        parentRectangleId: null,
      };
    }

    if (selected.kind === 'shape') {
      const context = findShapeContext(this.activeProperty(), selected.id);
      if (!context) {
        return null;
      }

      if (context.shape.kind === 'rectangle') {
        return {
          buildingId: context.buildingId,
          layerId: context.layerId,
          parentRectangleId: context.shape.id,
        };
      }

      if (context.shape.parentShapeId) {
        return {
          buildingId: context.buildingId,
          layerId: context.layerId,
          parentRectangleId: context.shape.parentShapeId,
        };
      }

      return {
        buildingId: context.buildingId,
        layerId: context.layerId,
        parentRectangleId: null,
      };
    }

    return null;
  }

  private resolveLineCreationContext(): {
    readonly buildingId: string;
    readonly layerId: string;
    readonly parentRectangleId: string;
  } | null {
    const selected = this.selectedNode();
    if (!selected || selected.kind !== 'shape') {
      return null;
    }

    const context = findShapeContext(this.activeProperty(), selected.id);
    if (!context) {
      return null;
    }

    if (context.shape.kind === 'rectangle') {
      return {
        buildingId: context.buildingId,
        layerId: context.layerId,
        parentRectangleId: context.shape.id,
      };
    }

    if (!context.shape.parentShapeId) {
      return null;
    }

    return {
      buildingId: context.buildingId,
      layerId: context.layerId,
      parentRectangleId: context.shape.parentShapeId,
    };
  }

  private findBuildingAndLayerByLayerId(layerId: string): {
    readonly buildingId: string;
    readonly layerId: string;
  } | null {
    for (const building of this.activeProperty().buildings) {
      const layer = building.layers.find((item) => item.id === layerId);
      if (layer) {
        return {
          buildingId: building.id,
          layerId: layer.id,
        };
      }
    }

    return null;
  }

  private countLayers(buildingId: string): number {
    const building = this.activeProperty().buildings.find((item) => item.id === buildingId);
    return building?.layers.length ?? 0;
  }

  private createWorkbookFromStatic(staticWorkbook: StaticWorkbook): CreatedWorkbook {
    const workbookId = this.nextId('workbook');
    const workbookPath = this.ensureUniqueWorkbookPath(staticWorkbook.workbookPath);
    const workbook: WorkbookRecord = {
      id: workbookId,
      title: staticWorkbook.title,
      workbookPath,
      property: cloneProperty(staticWorkbook.property),
      source: {
        kind: 'built-in',
        builtInId: staticWorkbook.sourceBuiltInId,
      },
      updatedAtIso: nowIso(),
    };

    this.workbooksSignal.update((current) => [...current, workbook]);
    this.switchWorkbook(workbookId);

    return {
      id: workbookId,
      workbookPath,
      title: staticWorkbook.title,
    };
  }

  private ensureUniqueWorkbookPath(basePath: string, excludedWorkbookId?: string): string {
    const existingPaths = new Set(
      this.workbooks()
        .filter((workbook) => workbook.id !== excludedWorkbookId)
        .map((workbook) => workbook.workbookPath),
    );

    if (!existingPaths.has(basePath)) {
      return basePath;
    }

    let suffix = 2;
    let candidate = `${basePath}-${suffix}`;
    while (existingPaths.has(candidate)) {
      suffix += 1;
      candidate = `${basePath}-${suffix}`;
    }

    return candidate;
  }

  private updateContextToHighestVisibleParent(property: PropertyModel): void {
    const visibleBuildings = property.buildings.filter((building) => building.visible);
    if (visibleBuildings.length === 1) {
      this.selectedNodeIdSignal.set(visibleBuildings[0].id);
      return;
    }

    const selected = this.selectedNode();
    if (selected && selected.kind === 'building' && selected.visible) {
      return;
    }

    this.selectedNodeIdSignal.set(getPropertyRootNodeId(property));
  }

  private restoreFromLocalStorage(): void {
    if (!this.hasWindow()) {
      return;
    }

    const workspaceRaw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (workspaceRaw) {
      this.restoreWorkspaceSnapshot(workspaceRaw);
      return;
    }

    const legacyRaw = localStorage.getItem(LEGACY_ACTIVE_PROPERTY_STORAGE_KEY);
    if (!legacyRaw) {
      return;
    }

    this.restoreLegacySnapshot(legacyRaw);
  }

  private restoreWorkspaceSnapshot(rawValue: string): void {
    try {
      const parsed = JSON.parse(rawValue) as PersistedWorkspaceSnapshot;
      if (!Array.isArray(parsed.workbooks) || parsed.workbooks.length === 0) {
        return;
      }

      const validWorkbooks = parsed.workbooks.filter((workbook) => {
        const validation = validatePropertyModel(workbook.property);
        return validation.isValid;
      });

      if (validWorkbooks.length === 0) {
        return;
      }

      const hydratedWorkbooks: WorkbookRecord[] = [];
      const usedPaths = new Set<string>();
      for (const workbook of validWorkbooks) {
        const persistedWorkbookPath = (workbook as Partial<WorkbookRecord>).workbookPath;
        const sourcePath: string =
          typeof persistedWorkbookPath === 'string' && persistedWorkbookPath.length > 0
            ? persistedWorkbookPath
            : (workbook.title ?? 'workbook');

        const basePath = normalizeWorkbookPath(sourcePath);
        let workbookPath = basePath;
        let suffix = 2;
        while (usedPaths.has(workbookPath)) {
          workbookPath = `${basePath}-${suffix}`;
          suffix += 1;
        }
        usedPaths.add(workbookPath);

        hydratedWorkbooks.push({
          ...workbook,
          workbookPath,
          property: cloneProperty(workbook.property),
        });
      }

      this.workbooksSignal.set(hydratedWorkbooks);

      const activeIdExists = hydratedWorkbooks.some(
        (workbook) => workbook.id === parsed.activeWorkbookId,
      );
      const activeWorkbookId = activeIdExists ? parsed.activeWorkbookId : hydratedWorkbooks[0].id;
      this.switchWorkbook(activeWorkbookId);
    } catch {
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    }
  }

  private restoreLegacySnapshot(rawValue: string): void {
    try {
      const parsed = JSON.parse(rawValue) as LegacyPersistedPropertySnapshot;
      const validation = validatePropertyModel(parsed.property);
      if (!validation.isValid) {
        localStorage.removeItem(LEGACY_ACTIVE_PROPERTY_STORAGE_KEY);
        return;
      }

      const migratedWorkbook: WorkbookRecord = {
        id: 'workbook-migrated',
        title: 'Migrated workbook',
        workbookPath: this.ensureUniqueWorkbookPath('migrated-workbook'),
        property: cloneProperty(parsed.property),
        source: parsed.source ?? { kind: 'local-restore' },
        updatedAtIso: nowIso(),
      };

      this.workbooksSignal.set([migratedWorkbook]);
      this.switchWorkbook(migratedWorkbook.id);
      localStorage.removeItem(LEGACY_ACTIVE_PROPERTY_STORAGE_KEY);
    } catch {
      localStorage.removeItem(LEGACY_ACTIVE_PROPERTY_STORAGE_KEY);
    }
  }

  private setActiveProperty(property: PropertyModel, source: ActivePropertySource): void {
    this.activePropertySignal.set(property);
    this.activeSourceSignal.set(source);
    const selectedId = this.selectedNodeId();
    const selectedStillExists = createDrawerNodes(property).some((node) => node.id === selectedId);
    if (!selectedStillExists) {
      this.selectedNodeIdSignal.set(getPropertyRootNodeId(property));
    }

    this.workbooksSignal.update((current) =>
      current.map((workbook) => {
        if (workbook.id !== this.activeWorkbookId()) {
          return workbook;
        }

        return {
          ...workbook,
          property,
          source,
          updatedAtIso: nowIso(),
        };
      }),
    );

    this.persistToLocalStorage();
  }

  private persistToLocalStorage(): void {
    if (!this.hasWindow()) {
      return;
    }

    const snapshot: PersistedWorkspaceSnapshot = {
      activeWorkbookId: this.activeWorkbookId(),
      workbooks: this.workbooks().map((workbook) => ({
        ...workbook,
        property: cloneProperty(workbook.property),
      })),
    };

    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(snapshot));
  }

  private nextId(prefix: string): string {
    const nextValue = this.idCounterSignal() + 1;
    this.idCounterSignal.set(nextValue);
    return `${prefix}-${nextValue}`;
  }

  private confirmReplacement(): boolean {
    if (!this.hasWindow()) {
      return true;
    }

    return window.confirm(
      'This replaces the active property for drawer, editor, and input fields. Continue?',
    );
  }

  private confirmClear(): boolean {
    if (!this.hasWindow()) {
      return true;
    }

    return window.confirm('Reset only the active workbook to a built-in sample?');
  }

  private hasWindow(): boolean {
    return typeof window !== 'undefined';
  }
}
