import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-workbook-browser-local-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Workbook created</h2>

    <mat-dialog-content>
      <p>
        This workbook is only accessible in the current browser profile unless you export and import
        JSON manually.
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button type="button" mat-raised-button mat-dialog-close>Got it</button>
    </mat-dialog-actions>
  `,
  styleUrl: './workbook-browser-local-dialog.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkbookBrowserLocalDialogComponent {}
