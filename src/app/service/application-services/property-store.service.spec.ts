import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PropertyStoreService } from './property-store.service';

describe('PropertyStoreService', () => {
  let service: PropertyStoreService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyStoreService);
  });

  it('loads with a built-in property active', () => {
    expect(service.activeWorkbookTitle()).toBe('Compact Home Example');
    expect(service.activeSource().kind).toBe('built-in');
    expect(service.activeProperty().schemaVersion).toBe('1.0.0');
  });

  it('creates a new workbook and switches context to it', () => {
    const created = service.createWorkbook('Renovation Option B');

    expect(created).toBeTruthy();
    expect(created?.workbookPath).toBe('renovation-option-b');
    expect(service.activeWorkbookTitle()).toBe('Renovation Option B');
    expect(service.activeProperty().metadata.displayName).toContain('Renovation Option B');
  });

  it('keeps edits isolated between workbooks', () => {
    const firstWorkbookId = service.activeWorkbookId();
    const secondWorkbook = service.createWorkbook('Garage Plan');
    if (!secondWorkbook) {
      return;
    }

    service.updatePropertyFrame(3100, 2100);
    expect(service.activeProperty().widthCm).toBe(3100);

    service.switchWorkbook(firstWorkbookId);
    expect(service.activeProperty().widthCm).not.toBe(3100);

    service.switchWorkbook(secondWorkbook.id);
    expect(service.activeProperty().widthCm).toBe(3100);
  });

  it('opens workbook from route path, including static fallback', () => {
    const localCreated = service.createWorkbook('Attic Plan');
    if (!localCreated) {
      return;
    }

    const openedLocal = service.openWorkbookByPath(localCreated.workbookPath);
    expect(openedLocal).toBe(true);
    expect(service.activeWorkbookTitle()).toBe('Attic Plan');

    const openedStatic = service.openWorkbookByPath('two-structure-yard');
    expect(openedStatic).toBe(true);
    expect(service.activeWorkbookTitle()).toBe('House + Garage Example');
  });

  it('returns false for unmatched route workbook path', () => {
    const opened = service.openWorkbookByPath('missing-static-workbook');
    expect(opened).toBe(false);
  });

  it('switches built-in property and persists it', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const switched = service.selectBuiltInProperty('two-structure-yard', true);

    expect(switched).toBe(true);
    expect(service.activeProperty().metadata.propertyId).toBe('prop-two-structure-yard');
  });

  it('rejects invalid import payload', () => {
    const result = service.importPropertyJson('{"bad":true}', false);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Import failed');
  });

  it('updates selected shape name from dedicated input action', () => {
    service.selectNode('room-living');

    const updated = service.updateSelectedShapeName('Living Room Updated');

    expect(updated).toBe(true);
    expect(service.selectedShapeDetails()?.shape.name).toBe('Living Room Updated');
  });

  it('shifts selection context when only one building remains visible', () => {
    service.selectBuiltInProperty('two-structure-yard', false);

    service.toggleNodeVisibility('building-house');

    expect(service.selectedNode()?.kind).toBe('building');
    expect(service.selectedNodeId()).toBe('building-garage');
  });

  it('updates selected rectangle geometry', () => {
    service.selectNode('room-living');

    const updated = service.updateSelectedRectangleGeometry({
      xCm: 200,
      yCm: 220,
      widthCm: 710,
      heightCm: 530,
    });

    expect(updated).toBe(true);
    const selected = service.selectedShapeDetails()?.shape;
    expect(selected?.kind).toBe('rectangle');
    if (selected?.kind === 'rectangle') {
      expect(selected.anchor.xCm).toBe(200);
      expect(selected.widthCm).toBe(710);
    }
  });

  it('prevents creating wall line without rectangle context', () => {
    service.selectNode('layer-ground-floor');

    const createdId = service.addLineInSelectedRectangleContext({
      semanticType: 'wall',
      openingDirection: null,
    });

    expect(createdId).toBeNull();
  });

  it('creates helper frame with nested wall line and stores opening-direction for doors', () => {
    service.selectNode('layer-ground-floor');
    const frameId = service.addRectangleInSelectedContext({ asHelperFrame: true, hidden: true });

    expect(frameId).toBeTruthy();
    if (!frameId) {
      return;
    }

    service.selectNode(frameId);
    const doorId = service.addLineInSelectedRectangleContext({
      semanticType: 'door',
      openingDirection: 'inward',
    });

    expect(doorId).toBeTruthy();
    if (!doorId) {
      return;
    }

    service.selectNode(doorId);
    const line = service.selectedShapeDetails()?.shape;
    expect(line?.kind).toBe('line');
    if (line?.kind === 'line') {
      expect(line.semanticType).toBe('door');
      expect(line.openingDirection).toBe('inward');
      expect(line.parentShapeId).toBe(frameId);
    }
  });

  it('adds and deletes entities from drawer actions', () => {
    const buildingRectangleId = service.addBuildingRectangle();
    expect(service.drawerNodes().some((node) => node.id === buildingRectangleId)).toBe(true);

    service.selectNode(buildingRectangleId);
    const deleted = service.deleteSelectedNode();

    expect(deleted).toBe(true);
    expect(service.drawerNodes().some((node) => node.id === buildingRectangleId)).toBe(false);
  });

  it('updates property frame dimensions', () => {
    const updated = service.updatePropertyFrame(2800, 2200);

    expect(updated).toBe(true);
    expect(service.activeProperty().widthCm).toBe(2800);
    expect(service.activeProperty().heightCm).toBe(2200);
  });

  it('exports and imports JSON with equivalent editable structure', () => {
    service.selectNode('room-living');
    service.updateSelectedShapeName('Roundtrip Room');

    const exportedJson = service.exportActivePropertyJson();
    const importResult = service.importPropertyJson(exportedJson, false);

    expect(importResult.ok).toBe(true);
    expect(service.activeProperty().metadata.displayName).toBe('Compact Home Example');
    expect(service.drawerNodes().some((node) => node.name === 'Roundtrip Room')).toBe(true);
  });
});
