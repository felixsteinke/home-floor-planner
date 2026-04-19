import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OnboardingPreferencesService } from '../../../service/application-services/onboarding-preferences.service';
import { PropertyStoreService } from '../../../service/application-services/property-store.service';
import { WorkbookBrowserLocalDialogComponent } from '../workbook-browser-local-dialog/workbook-browser-local-dialog.component';
import { WorkbookNameDialogComponent } from '../workbook-name-dialog/workbook-name-dialog.component';

interface DataControlsDialogData {
  readonly startNewWorkbookFlow?: boolean;
  readonly suggestedName?: string;
}

@Component({
  selector: 'app-data-controls-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Data and privacy</h2>

    <mat-dialog-content>
      <p class="privacy-copy">
        Local-first: plan data stays in your browser unless you export it. This app does not use
        backend or cloud sync in the current version.
      </p>

      <p><strong>Active workbook:</strong> {{ store.activeWorkbookTitle() }}</p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Switch workbook</mat-label>
        <mat-select
          [value]="store.activeWorkbookId()"
          (selectionChange)="onWorkbookSelectionChange($event)"
        >
          @for (workbook of store.workbookSummaries(); track workbook.id) {
            <mat-option [value]="workbook.id">{{ workbook.title }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <div class="button-row">
        <button type="button" mat-raised-button (click)="onCreateWorkbookClicked()">
          Create workbook
        </button>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Load bundled built-in property</mat-label>
        <mat-select
          [value]="selectedBuiltInId()"
          (selectionChange)="onBuiltInSelectionChange($event)"
        >
          @for (property of store.builtInProperties; track property.id) {
            <mat-option [value]="property.id">{{ property.title }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <div class="button-row">
        <button type="button" mat-raised-button (click)="importInput.click()">Import JSON</button>
        <button type="button" mat-raised-button (click)="onExportClicked()">Export JSON</button>
        <button type="button" mat-stroked-button (click)="onResetClicked()">
          Reset active workbook
        </button>
        <button type="button" mat-stroked-button (click)="onResetGuidanceClicked()">
          Reset onboarding
        </button>
      </div>

      <input
        #importInput
        type="file"
        class="sr-only"
        accept="application/json"
        (change)="onImportFileSelected($event)"
      />

      <mat-divider></mat-divider>
      <p><strong>Buildings:</strong> {{ store.activePropertySummary().buildingCount }}</p>
      <p><strong>Layers:</strong> {{ store.activePropertySummary().layerCount }}</p>
      <p aria-live="polite">{{ statusMessage() }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button type="button" mat-button (click)="onCloseClicked()">Close</button>
    </mat-dialog-actions>
  `,
  styleUrl: './data-controls-dialog.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataControlsDialogComponent {
  readonly store = inject(PropertyStoreService);
  private readonly onboardingPreferences = inject(OnboardingPreferencesService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly dialogData =
    inject<DataControlsDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};
  private readonly dialogRef = inject(MatDialogRef<DataControlsDialogComponent>);
  private readonly routeStartupHandled = signal(false);

  readonly statusMessage = signal(
    'Switch workbook, create a new one, or import/export JSON from this dialog.',
  );

  readonly selectedBuiltInId = computed(() => {
    const source = this.store.activeSource();
    if (source.kind === 'built-in') {
      return source.builtInId;
    }

    return this.store.builtInProperties[0].id;
  });

  constructor() {
    effect(() => {
      if (!this.dialogData.startNewWorkbookFlow || this.routeStartupHandled()) {
        return;
      }

      this.routeStartupHandled.set(true);
      void this.onCreateWorkbookClicked(this.dialogData.suggestedName);
    });
  }

  onCloseClicked(): void {
    this.dialogRef.close();
  }

  onWorkbookSelectionChange(event: MatSelectChange): void {
    const switched = this.store.switchWorkbook(event.value as string);
    this.statusMessage.set(switched ? 'Active workbook switched.' : 'Workbook switch failed.');
  }

  async onCreateWorkbookClicked(suggestedName?: string): Promise<void> {
    const nameDialogRef = this.dialog.open(WorkbookNameDialogComponent, {
      width: '30rem',
      maxWidth: '94vw',
      data: {
        suggestedName: suggestedName?.trim(),
      },
    });

    const workbookName = await firstValueFrom(nameDialogRef.afterClosed());
    if (!workbookName) {
      return;
    }

    const createdWorkbook = this.store.createWorkbook(workbookName);
    if (!createdWorkbook) {
      this.statusMessage.set('Provide a workbook name before creating a new workbook.');
      return;
    }

    await firstValueFrom(
      this.dialog
        .open(WorkbookBrowserLocalDialogComponent, {
          width: '28rem',
          maxWidth: '92vw',
        })
        .afterClosed(),
    );

    await this.router.navigateByUrl(`/w/${createdWorkbook.workbookPath}`);
    this.statusMessage.set('New workbook created and activated.');
  }

  onBuiltInSelectionChange(event: MatSelectChange): void {
    const selectedId = event.value as string;
    const switched = this.store.selectBuiltInProperty(selectedId, true);

    this.statusMessage.set(
      switched
        ? 'Active property switched to bundled built-in sample.'
        : 'Property switch cancelled.',
    );
  }

  async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (!file) {
      return;
    }

    const jsonText = await file.text();
    const result = this.store.importPropertyJson(jsonText, true);
    this.statusMessage.set(result.message);
    input.value = '';
  }

  onExportClicked(): void {
    const json = this.store.exportActivePropertyJson();
    if (typeof window === 'undefined') {
      return;
    }

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const propertyId = this.store.activeProperty().metadata.propertyId;

    anchor.href = url;
    anchor.download = `${propertyId}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
    this.statusMessage.set('Export completed. JSON download started.');
  }

  onResetClicked(): void {
    const cleared = this.store.clearLocalActiveProperty(true);
    this.statusMessage.set(
      cleared ? 'Active workbook reset to bundled sample.' : 'Reset action cancelled.',
    );
  }

  onResetGuidanceClicked(): void {
    this.onboardingPreferences.resetState();
    this.statusMessage.set('Onboarding reset. Use Help to replay guidance.');
  }
}
