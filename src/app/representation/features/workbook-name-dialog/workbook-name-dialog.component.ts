import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface WorkbookNameDialogData {
  readonly suggestedName?: string;
}

@Component({
  selector: 'app-workbook-name-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Create workbook</h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Workbook name</mat-label>
        <input
          matInput
          [formControl]="workbookNameControl"
          cdkFocusInitial
          autocomplete="off"
          aria-describedby="workbook-name-help"
        />
      </mat-form-field>
      <p id="workbook-name-help">Enter a name to create a new browser-local workbook.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button type="button" mat-button (click)="onCancelClicked()">Cancel</button>
      <button
        type="button"
        mat-raised-button
        [disabled]="workbookNameControl.invalid"
        (click)="onCreateClicked()"
      >
        Create workbook
      </button>
    </mat-dialog-actions>
  `,
  styleUrl: './workbook-name-dialog.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkbookNameDialogComponent {
  private readonly dialogData =
    inject<WorkbookNameDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};
  private readonly dialogRef = inject(MatDialogRef<WorkbookNameDialogComponent, string>);

  readonly workbookNameControl = new FormControl(this.dialogData.suggestedName?.trim() ?? '', {
    nonNullable: true,
    validators: [Validators.required],
  });

  onCancelClicked(): void {
    this.dialogRef.close();
  }

  onCreateClicked(): void {
    const workbookName = this.workbookNameControl.value.trim();
    if (!workbookName) {
      return;
    }

    this.dialogRef.close(workbookName);
  }
}
