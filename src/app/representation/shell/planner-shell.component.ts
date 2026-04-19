import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute } from '@angular/router';
import { ShapeSemanticType } from '../../domain/entities/property-model';
import { OnboardingHighlightService } from '../../service/application-services/onboarding-highlight.service';
import { OnboardingPreferencesService } from '../../service/application-services/onboarding-preferences.service';
import { PropertyStoreService } from '../../service/application-services/property-store.service';
import { DataControlsDialogComponent } from '../features/data-controls-dialog/data-controls-dialog.component';
import { EditorMapComponent } from '../features/editor-map/editor-map.component';
import { OnboardingDialogComponent } from '../features/onboarding-dialog/onboarding-dialog.component';

@Component({
  selector: 'app-planner-shell',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    ReactiveFormsModule,
    EditorMapComponent,
  ],
  template: `
    <mat-toolbar>
      <span>Home Floor Planner</span>
      <span class="spacer"></span>
      <button type="button" mat-button (click)="onOpenOnboarding()">Help</button>
      <button
        type="button"
        mat-stroked-button
        data-onboarding-target="data-and-privacy-button"
        [class.onboarding-highlight]="isOnboardingHighlight('data-and-privacy-button')"
        (click)="onOpenDataDialog()"
      >
        Data and privacy
      </button>
    </mat-toolbar>

    <div class="layout-grid">
      <aside
        class="drawer-column"
        aria-labelledby="drawer-heading"
        data-onboarding-target="drawer-region"
        [class.onboarding-highlight]="isOnboardingHighlight('drawer-region')"
      >
        <mat-card>
          <mat-card-header>
            <mat-card-title id="drawer-heading">Layout data drawer</mat-card-title>
            <mat-card-subtitle>Hierarchy, visibility, and create/delete actions</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (isOnboardingHighlight('drawer-region')) {
              <p class="onboarding-label">Onboarding focus: layout data drawer</p>
            }
            <p><strong>Active workbook:</strong> {{ store.activeWorkbookTitle() }}</p>
            <p><strong>Active property:</strong> {{ store.activePropertyTitle() }}</p>

            <div class="drawer-actions">
              <button type="button" mat-raised-button (click)="onAddBuildingRectangle()">
                Add building rectangle
              </button>
              <button type="button" mat-stroked-button (click)="onAddLayer()">Add layer</button>
              <button type="button" mat-stroked-button (click)="onAddRoomRectangle()">
                Add room rectangle
              </button>
              <button type="button" mat-stroked-button (click)="onAddHiddenFrame()">
                Add hidden frame
              </button>
              <button type="button" mat-stroked-button (click)="onAddWallLine()">
                Add wall line
              </button>
              <button type="button" mat-stroked-button (click)="onAddDoorLine()">
                Add door line
              </button>
              <button type="button" mat-stroked-button (click)="onAddOpeningLine()">
                Add opening line
              </button>
              <button type="button" mat-stroked-button (click)="onDeleteSelected()">
                Delete selected
              </button>
            </div>

            <div class="drawer-actions">
              <button type="button" mat-button (click)="onSetTypeVisibility('wall', false)">
                Hide walls
              </button>
              <button type="button" mat-button (click)="onSetTypeVisibility('wall', true)">
                Show walls
              </button>
              <button type="button" mat-button (click)="onSetTypeVisibility('door', false)">
                Hide doors
              </button>
              <button type="button" mat-button (click)="onSetTypeVisibility('door', true)">
                Show doors
              </button>
            </div>

            <ul role="tree" class="drawer-tree" aria-label="Property hierarchy">
              @for (node of visibleDrawerNodes(); track node.id) {
                <li
                  role="treeitem"
                  [attr.aria-level]="node.level"
                  [attr.aria-selected]="store.selectedNodeId() === node.id"
                  [attr.aria-expanded]="hasChildren(node.id) ? isExpanded(node.id) : null"
                >
                  <div
                    class="tree-row"
                    [style.padding-left.rem]="(node.level - 1) * 0.8"
                    [class.selected-row]="store.selectedNodeId() === node.id"
                  >
                    @if (hasChildren(node.id)) {
                      <button
                        type="button"
                        mat-button
                        [attr.aria-label]="
                          isExpanded(node.id) ? 'Collapse ' + node.name : 'Expand ' + node.name
                        "
                        (click)="onToggleExpanded(node.id)"
                      >
                        {{ isExpanded(node.id) ? 'Collapse' : 'Expand' }}
                      </button>
                    }

                    <button
                      type="button"
                      mat-button
                      (click)="onDrawerNodeSelected(node.id)"
                      [attr.aria-label]="'Select ' + node.name"
                    >
                      {{ node.name }}
                    </button>
                    <span class="row-meta">id: {{ node.id }}</span>
                    <span class="row-meta">type: {{ node.typeLabel }}</span>
                    @if (node.parentId) {
                      <span class="row-meta">parent: {{ node.parentId }}</span>
                    }
                    <span class="row-meta">geometry: {{ node.geometrySummary }}</span>
                    <span class="row-meta">style: {{ node.styleSummary }}</span>
                    <span class="row-meta">visibility: {{ node.visibilitySummary }}</span>
                    @if (node.canToggleVisibility) {
                      <button
                        type="button"
                        mat-stroked-button
                        [attr.aria-label]="node.visible ? 'Hide ' + node.name : 'Show ' + node.name"
                        (click)="onToggleNodeVisibility(node.id)"
                      >
                        {{ node.visible ? 'Hide' : 'Show' }}
                      </button>
                    }
                  </div>
                </li>
              }
            </ul>
            <p aria-live="polite">{{ statusMessage() }}</p>
          </mat-card-content>
        </mat-card>
      </aside>

      <main
        class="editor-column"
        aria-labelledby="editor-heading"
        data-onboarding-target="editor-region"
        [class.onboarding-highlight]="isOnboardingHighlight('editor-region')"
      >
        <mat-card>
          <mat-card-header>
            <mat-card-title id="editor-heading">Editor workspace</mat-card-title>
            <mat-card-subtitle>2D floor-map viewport and selection mirror</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (isOnboardingHighlight('editor-region')) {
              <p class="onboarding-label">Onboarding focus: editor workspace</p>
            }
            <p>Coordinate origin is fixed at (0,0) in the property bottom-left corner.</p>
            <p>
              Property size: {{ store.activePropertySummary().propertyWidthCm }} x
              {{ store.activePropertySummary().propertyHeightCm }} cm
            </p>
            <p>
              <strong>Current selection:</strong>
              {{ store.selectedNode()?.name ?? 'none' }}
            </p>

            <app-editor-map
              [property]="store.activeProperty()"
              [selectedNodeId]="store.selectedNodeId()"
              (nodeSelected)="onDrawerNodeSelected($event)"
            ></app-editor-map>
          </mat-card-content>
        </mat-card>
      </main>

      <section
        class="inspector-column"
        aria-labelledby="input-heading"
        data-onboarding-target="inspector-region"
        [class.onboarding-highlight]="isOnboardingHighlight('inspector-region')"
      >
        <mat-card>
          <mat-card-header>
            <mat-card-title id="input-heading">Editing input fields</mat-card-title>
            <mat-card-subtitle>Apply selected entity updates here</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (isOnboardingHighlight('inspector-region')) {
              <p class="onboarding-label">Onboarding focus: editing input fields</p>
            }
            @if (store.selectedNode()?.kind === 'property') {
              <div class="geometry-grid" [formGroup]="propertyFrameForm">
                <mat-form-field appearance="outline">
                  <mat-label>Property width (cm)</mat-label>
                  <input matInput type="number" formControlName="widthCm" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Property height (cm)</mat-label>
                  <input matInput type="number" formControlName="heightCm" />
                </mat-form-field>
              </div>
              <button type="button" mat-raised-button (click)="onApplyPropertyFrame()">
                Apply property frame
              </button>
            }

            @if (selectedShape(); as shape) {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Shape name</mat-label>
                <input matInput [formControl]="shapeNameControl" />
              </mat-form-field>
              <button type="button" mat-raised-button (click)="onApplyName()">Apply name</button>

              @if (shape.kind === 'rectangle') {
                <div class="geometry-grid" [formGroup]="rectangleForm">
                  <mat-form-field appearance="outline">
                    <mat-label>Anchor X (cm)</mat-label>
                    <input matInput type="number" formControlName="xCm" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Anchor Y (cm)</mat-label>
                    <input matInput type="number" formControlName="yCm" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Width (cm)</mat-label>
                    <input matInput type="number" formControlName="widthCm" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Height (cm)</mat-label>
                    <input matInput type="number" formControlName="heightCm" />
                  </mat-form-field>
                </div>
                <button type="button" mat-raised-button (click)="onApplyRectangleGeometry()">
                  Apply rectangle geometry
                </button>
              }

              @if (shape.kind === 'line') {
                <div class="geometry-grid" [formGroup]="lineForm">
                  <mat-form-field appearance="outline">
                    <mat-label>Start X (cm)</mat-label>
                    <input matInput type="number" formControlName="startXCm" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Start Y (cm)</mat-label>
                    <input matInput type="number" formControlName="startYCm" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>End X (cm)</mat-label>
                    <input matInput type="number" formControlName="endXCm" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>End Y (cm)</mat-label>
                    <input matInput type="number" formControlName="endYCm" />
                  </mat-form-field>
                </div>
                <button type="button" mat-raised-button (click)="onApplyLineGeometry()">
                  Apply line geometry
                </button>
              }

              <div class="geometry-grid" [formGroup]="styleForm">
                <mat-form-field appearance="outline">
                  <mat-label>Semantic type</mat-label>
                  <mat-select formControlName="semanticType">
                    @for (type of semanticTypeOptions(); track type) {
                      <mat-option [value]="type">{{ type }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Stroke color</mat-label>
                  <input matInput formControlName="strokeColor" />
                </mat-form-field>
                @if (shape.kind === 'rectangle') {
                  <mat-form-field appearance="outline">
                    <mat-label>Fill color</mat-label>
                    <input matInput formControlName="fillColor" />
                  </mat-form-field>
                }
                <mat-form-field appearance="outline">
                  <mat-label>Stroke thickness (cm)</mat-label>
                  <input matInput type="number" formControlName="strokeThicknessCm" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Z-index</mat-label>
                  <input matInput type="number" formControlName="zIndex" />
                </mat-form-field>
                @if (shape.kind === 'line') {
                  <mat-form-field appearance="outline">
                    <mat-label>Opening direction</mat-label>
                    <mat-select formControlName="openingDirection">
                      <mat-option [value]="null">none</mat-option>
                      <mat-option value="inward">inward</mat-option>
                      <mat-option value="outward">outward</mat-option>
                    </mat-select>
                  </mat-form-field>
                }
              </div>

              <mat-checkbox [formControl]="styleVisibleControl">Visible</mat-checkbox>
              <div>
                <button type="button" mat-raised-button (click)="onApplyStyle()">
                  Apply style
                </button>
              </div>
            } @else {
              <p>Select a shape in the drawer or editor map to edit geometry and style values.</p>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
  styleUrl: './planner-shell.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerShellComponent {
  readonly store = inject(PropertyStoreService);
  private readonly dialog = inject(MatDialog);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly onboardingHighlight = inject(OnboardingHighlightService);
  private readonly onboardingPreferences = inject(OnboardingPreferencesService);
  private readonly routeData = toSignal(this.activatedRoute.data, {
    initialValue: this.activatedRoute.snapshot.data,
  });
  private readonly routeParamMap = toSignal(this.activatedRoute.paramMap, {
    initialValue: this.activatedRoute.snapshot.paramMap,
  });
  private readonly lastHandledRouteKey = signal<string>('');

  readonly statusMessage = signal(
    'Ready. Use the drawer for navigation and the right panel for editing.',
  );

  readonly selectedShape = computed(() => this.store.selectedShapeDetails()?.shape ?? null);
  readonly onboardingHighlightTarget = this.onboardingHighlight.highlightTarget;

  readonly childIdsByParent = computed(() => {
    const mapping = new Map<string, string[]>();
    for (const node of this.store.drawerNodes()) {
      if (!node.parentId) {
        continue;
      }

      const existing = mapping.get(node.parentId) ?? [];
      existing.push(node.id);
      mapping.set(node.parentId, existing);
    }

    return mapping;
  });

  readonly expandedNodes = signal<Record<string, boolean>>({});

  readonly visibleDrawerNodes = computed(() => {
    const expanded = this.expandedNodes();
    const isAncestorExpanded = (nodeId: string | null): boolean => {
      if (!nodeId) {
        return true;
      }

      const parent = this.store.drawerNodes().find((item) => item.id === nodeId);
      if (!parent) {
        return true;
      }

      const parentExpanded = expanded[parent.id] ?? true;
      return parentExpanded && isAncestorExpanded(parent.parentId);
    };

    return this.store.drawerNodes().filter((node) => isAncestorExpanded(node.parentId));
  });

  readonly shapeNameControl = new FormControl<string>('', { nonNullable: true });

  readonly propertyFrameForm = new FormGroup({
    widthCm: new FormControl<number>(1000, { nonNullable: true }),
    heightCm: new FormControl<number>(1000, { nonNullable: true }),
  });

  readonly rectangleForm = new FormGroup({
    xCm: new FormControl<number>(0, { nonNullable: true }),
    yCm: new FormControl<number>(0, { nonNullable: true }),
    widthCm: new FormControl<number>(100, { nonNullable: true }),
    heightCm: new FormControl<number>(100, { nonNullable: true }),
  });

  readonly lineForm = new FormGroup({
    startXCm: new FormControl<number>(0, { nonNullable: true }),
    startYCm: new FormControl<number>(0, { nonNullable: true }),
    endXCm: new FormControl<number>(100, { nonNullable: true }),
    endYCm: new FormControl<number>(0, { nonNullable: true }),
  });

  readonly styleForm = new FormGroup({
    semanticType: new FormControl<ShapeSemanticType>('room', { nonNullable: true }),
    strokeColor: new FormControl<string>('#1d4ed8', { nonNullable: true }),
    fillColor: new FormControl<string>('#dbeafe', { nonNullable: true }),
    strokeThicknessCm: new FormControl<number>(2, { nonNullable: true }),
    zIndex: new FormControl<number>(1, { nonNullable: true }),
    openingDirection: new FormControl<'inward' | 'outward' | null>(null),
  });

  readonly styleVisibleControl = new FormControl<boolean>(true, { nonNullable: true });
  private readonly onboardingOfferShown = signal(false);

  readonly semanticTypeOptions = computed(() => {
    const shape = this.selectedShape();
    if (!shape) {
      return ['room', 'helper-frame', 'building'] as const;
    }

    return shape.kind === 'rectangle'
      ? (['room', 'helper-frame', 'building'] as const)
      : (['wall', 'door', 'opening'] as const);
  });

  constructor() {
    effect(() => {
      const summary = this.store.activePropertySummary();
      this.propertyFrameForm.setValue(
        {
          widthCm: summary.propertyWidthCm,
          heightCm: summary.propertyHeightCm,
        },
        { emitEvent: false },
      );

      const selected = this.selectedShape();
      if (!selected) {
        this.shapeNameControl.setValue('', { emitEvent: false });
        return;
      }

      this.shapeNameControl.setValue(selected.name, { emitEvent: false });

      if (selected.kind === 'rectangle') {
        this.rectangleForm.setValue(
          {
            xCm: selected.anchor.xCm,
            yCm: selected.anchor.yCm,
            widthCm: selected.widthCm,
            heightCm: selected.heightCm,
          },
          { emitEvent: false },
        );

        this.styleForm.setValue(
          {
            semanticType: selected.semanticType,
            strokeColor: selected.strokeColor,
            fillColor: selected.fillColor,
            strokeThicknessCm: selected.strokeThicknessCm,
            zIndex: selected.zIndex,
            openingDirection: null,
          },
          { emitEvent: false },
        );

        this.styleVisibleControl.setValue(selected.visible, { emitEvent: false });
        return;
      }

      this.lineForm.setValue(
        {
          startXCm: selected.start.xCm,
          startYCm: selected.start.yCm,
          endXCm: selected.end.xCm,
          endYCm: selected.end.yCm,
        },
        { emitEvent: false },
      );

      this.styleForm.setValue(
        {
          semanticType: selected.semanticType,
          strokeColor: selected.strokeColor,
          fillColor: '#ffffff',
          strokeThicknessCm: selected.strokeThicknessCm,
          zIndex: selected.zIndex,
          openingDirection: selected.openingDirection,
        },
        { emitEvent: false },
      );

      this.styleVisibleControl.setValue(selected.visible, { emitEvent: false });
    });

    effect(() => {
      const nodes = this.store.drawerNodes();
      const currentState = this.expandedNodes();
      const nextState: Record<string, boolean> = { ...currentState };
      let changed = false;

      for (const node of nodes) {
        if (nextState[node.id] === undefined) {
          nextState[node.id] = true;
          changed = true;
        }
      }

      if (changed) {
        this.expandedNodes.set(nextState);
      }
    });

    effect(() => {
      if (!this.onboardingPreferences.shouldOfferOnboarding() || this.onboardingOfferShown()) {
        return;
      }

      this.onboardingOfferShown.set(true);
      this.dialog.open(OnboardingDialogComponent, {
        width: '38rem',
        maxWidth: '95vw',
      });
    });

    effect(() => {
      const startupMode = this.routeData()['startupMode'] as
        | 'root'
        | 'new'
        | 'workbook'
        | undefined;
      const workbookPath = this.routeParamMap().get('workbookPath') ?? '';
      const mode = startupMode ?? 'root';
      const routeKey = `${mode}:${workbookPath}`;
      if (this.lastHandledRouteKey() === routeKey) {
        return;
      }

      this.lastHandledRouteKey.set(routeKey);

      if (mode === 'new') {
        this.statusMessage.set('Create a workbook name to start a new planning workspace.');
        this.onOpenDataDialog({ startNewWorkbookFlow: true });
        return;
      }

      if (mode === 'workbook') {
        const opened = workbookPath ? this.store.openWorkbookByPath(workbookPath) : false;
        if (opened) {
          this.statusMessage.set(
            `Opened workbook from route: ${this.store.activeWorkbookTitle()}.`,
          );
          return;
        }

        this.statusMessage.set('No workbook matched that route. Start by creating a new workbook.');
        this.onOpenDataDialog({
          startNewWorkbookFlow: true,
          suggestedName: this.humanizeWorkbookPath(workbookPath),
        });
        return;
      }

      this.store.openFirstStaticWorkbook();
      this.statusMessage.set(`Opened default workbook: ${this.store.activeWorkbookTitle()}.`);
    });
  }

  onOpenDataDialog(data?: {
    readonly startNewWorkbookFlow?: boolean;
    readonly suggestedName?: string;
  }): void {
    this.dialog.open(DataControlsDialogComponent, {
      width: '44rem',
      maxWidth: '96vw',
      data,
    });
  }

  onOpenOnboarding(): void {
    this.dialog.open(OnboardingDialogComponent, {
      width: '38rem',
      maxWidth: '95vw',
    });
  }

  isOnboardingHighlight(
    target: 'drawer-region' | 'editor-region' | 'inspector-region' | 'data-and-privacy-button',
  ): boolean {
    return this.onboardingHighlightTarget() === target;
  }

  hasChildren(nodeId: string): boolean {
    return (this.childIdsByParent().get(nodeId)?.length ?? 0) > 0;
  }

  isExpanded(nodeId: string): boolean {
    return this.expandedNodes()[nodeId] ?? true;
  }

  onToggleExpanded(nodeId: string): void {
    this.expandedNodes.update((current) => ({
      ...current,
      [nodeId]: !(current[nodeId] ?? true),
    }));
  }

  onDrawerNodeSelected(nodeId: string): void {
    this.store.selectNode(nodeId);
  }

  onToggleNodeVisibility(nodeId: string): void {
    const toggled = this.store.toggleNodeVisibility(nodeId);
    this.statusMessage.set(toggled ? 'Visibility updated.' : 'Visibility update not available.');
  }

  onSetTypeVisibility(type: ShapeSemanticType, visible: boolean): void {
    this.store.setSemanticTypeVisibility(type, visible);
    this.statusMessage.set(`Visibility for ${type} updated.`);
  }

  onAddBuildingRectangle(): void {
    const id = this.store.addBuildingRectangle();
    this.statusMessage.set(`Added building rectangle ${id}.`);
  }

  onAddLayer(): void {
    const id = this.store.addLayerUnderSelectedBuilding();
    this.statusMessage.set(id ? `Added layer ${id}.` : 'Select a building to add a layer.');
  }

  onAddRoomRectangle(): void {
    const id = this.store.addRectangleInSelectedContext({ asHelperFrame: false, hidden: false });
    this.statusMessage.set(
      id ? `Added rectangle ${id}.` : 'Select a layer or rectangle context first.',
    );
  }

  onAddHiddenFrame(): void {
    const id = this.store.addRectangleInSelectedContext({ asHelperFrame: true, hidden: true });
    this.statusMessage.set(
      id ? `Added hidden helper frame ${id}.` : 'Select a layer or rectangle context first.',
    );
  }

  onAddWallLine(): void {
    const id = this.store.addLineInSelectedRectangleContext({
      semanticType: 'wall',
      openingDirection: null,
    });
    this.statusMessage.set(
      id
        ? `Added wall line ${id}.`
        : 'Select a rectangle context first. Wall/door/opening lines require a rectangle parent.',
    );
  }

  onAddDoorLine(): void {
    const id = this.store.addLineInSelectedRectangleContext({
      semanticType: 'door',
      openingDirection: 'inward',
    });
    this.statusMessage.set(
      id
        ? `Added door line ${id}.`
        : 'Select a rectangle context first. Wall/door/opening lines require a rectangle parent.',
    );
  }

  onAddOpeningLine(): void {
    const id = this.store.addLineInSelectedRectangleContext({
      semanticType: 'opening',
      openingDirection: 'outward',
    });
    this.statusMessage.set(
      id
        ? `Added opening line ${id}.`
        : 'Select a rectangle context first. Wall/door/opening lines require a rectangle parent.',
    );
  }

  onDeleteSelected(): void {
    const deleted = this.store.deleteSelectedNode();
    this.statusMessage.set(deleted ? 'Selected node deleted.' : 'Property root cannot be deleted.');
  }

  onApplyPropertyFrame(): void {
    const values = this.propertyFrameForm.getRawValue();
    const updated = this.store.updatePropertyFrame(values.widthCm, values.heightCm);
    this.statusMessage.set(
      updated ? 'Property frame updated.' : 'Property frame values must be greater than zero.',
    );
  }

  onApplyName(): void {
    const updated = this.store.updateSelectedShapeName(this.shapeNameControl.value);
    this.statusMessage.set(
      updated ? 'Shape name updated.' : 'Select a shape and provide a valid name.',
    );
  }

  onApplyRectangleGeometry(): void {
    const values = this.rectangleForm.getRawValue();
    const updated = this.store.updateSelectedRectangleGeometry(values);
    this.statusMessage.set(
      updated
        ? 'Rectangle geometry updated.'
        : 'Rectangle update failed. Width and height must be greater than zero.',
    );
  }

  onApplyLineGeometry(): void {
    const values = this.lineForm.getRawValue();
    const updated = this.store.updateSelectedLineGeometry(values);
    this.statusMessage.set(
      updated ? 'Line geometry updated.' : 'Select a line shape to update line geometry.',
    );
  }

  onApplyStyle(): void {
    const values = this.styleForm.getRawValue();
    const updated = this.store.updateSelectedShapeStyle({
      semanticType: values.semanticType,
      strokeColor: values.strokeColor,
      fillColor: values.fillColor,
      strokeThicknessCm: values.strokeThicknessCm,
      zIndex: values.zIndex,
      visible: this.styleVisibleControl.value,
      openingDirection: values.openingDirection,
    });

    this.statusMessage.set(
      updated ? 'Style updated.' : 'Unable to apply style for current selection.',
    );
  }

  private humanizeWorkbookPath(workbookPath: string): string {
    if (!workbookPath) {
      return 'New workbook';
    }

    return workbookPath
      .split('-')
      .filter((segment) => segment.length > 0)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }
}
