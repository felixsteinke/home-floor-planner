import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PropertyModel } from '../../../domain/entities/property-model';
import { projectPropertyToLayout } from '../../../domain/use-cases/layout-projection';

@Component({
  selector: 'app-editor-map',
  imports: [MatButtonModule],
  template: `
    <div class="map-toolbar">
      <button type="button" mat-stroked-button (click)="toggleCoordinates()">
        {{ showCoordinates() ? 'Hide coordinates' : 'Show coordinates' }}
      </button>
    </div>

    <svg
      data-testid="editor-map-svg"
      role="img"
      [attr.aria-label]="'2D floor map for ' + property().metadata.displayName"
      [attr.viewBox]="'0 0 ' + projection().widthCm + ' ' + projection().heightCm"
      class="map-svg"
    >
      <rect
        x="0"
        y="0"
        [attr.width]="projection().widthCm"
        [attr.height]="projection().heightCm"
        class="map-background"
      />

      <g [attr.transform]="'translate(0 ' + projection().heightCm + ') scale(1 -1)'">
        @if (showCoordinates()) {
          <line x1="0" y1="0" [attr.x2]="projection().widthCm" y2="0" class="axis-line" />
          <line x1="0" y1="0" x2="0" [attr.y2]="projection().heightCm" class="axis-line" />
        }

        @for (shape of projection().shapes; track shape.id) {
          @if (shape.kind === 'rectangle') {
            <rect
              [attr.x]="shape.xCm"
              [attr.y]="shape.yCm"
              [attr.width]="shape.widthCm"
              [attr.height]="shape.heightCm"
              [attr.fill]="shape.fillColor"
              [attr.stroke]="shape.strokeColor"
              [attr.stroke-width]="shape.strokeThicknessCm"
              [attr.aria-label]="shape.name"
              [class.map-shape-selected]="selectedNodeId() === shape.id"
              class="map-shape"
              (click)="nodeSelected.emit(shape.id)"
            />
          }

          @if (shape.kind === 'line') {
            <line
              [attr.x1]="shape.startXCm"
              [attr.y1]="shape.startYCm"
              [attr.x2]="shape.endXCm"
              [attr.y2]="shape.endYCm"
              [attr.stroke]="shape.strokeColor"
              [attr.stroke-width]="shape.strokeThicknessCm"
              [attr.aria-label]="shape.name"
              [class.map-shape-selected]="selectedNodeId() === shape.id"
              class="map-shape"
              (click)="nodeSelected.emit(shape.id)"
            />
          }
        }
      </g>
    </svg>
  `,
  styleUrl: './editor-map.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorMapComponent {
  readonly property = input.required<PropertyModel>();
  readonly selectedNodeId = input<string | null>(null);
  readonly nodeSelected = output<string>();
  readonly showCoordinates = signal(true);

  readonly projection = computed(() => projectPropertyToLayout(this.property()));

  toggleCoordinates(): void {
    this.showCoordinates.update((value) => !value);
  }
}
