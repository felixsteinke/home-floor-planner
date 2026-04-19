import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  OnboardingHighlightService,
  OnboardingHighlightTarget,
} from '../../../service/application-services/onboarding-highlight.service';
import { OnboardingPreferencesService } from '../../../service/application-services/onboarding-preferences.service';

interface OnboardingStep {
  readonly title: string;
  readonly body: string;
  readonly highlightTarget: OnboardingHighlightTarget;
  readonly highlightLabel: string;
  readonly fallbackMessage: string;
}

@Component({
  selector: 'app-onboarding-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Welcome to Home Floor Planner</h2>

    <mat-dialog-content>
      <p class="step-count">Step {{ activeStepIndex() + 1 }} of {{ steps.length }}</p>
      <h3>{{ activeStep().title }}</h3>
      <p aria-live="polite">{{ activeStep().body }}</p>
      <p><strong>Highlight target:</strong> {{ activeStep().highlightLabel }}</p>
      @if (!isHighlightTargetAvailable()) {
        <p class="fallback-message" role="status">{{ activeStep().fallbackMessage }}</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button type="button" mat-button (click)="onSkipClicked()">Skip</button>
      @if (activeStepIndex() > 0) {
        <button type="button" mat-button (click)="onBackClicked()">Back</button>
      }
      @if (!isLastStep()) {
        <button type="button" mat-raised-button (click)="onNextClicked()">Next</button>
      } @else {
        <button type="button" mat-raised-button (click)="onFinishClicked()">Finish</button>
      }
    </mat-dialog-actions>
  `,
  styleUrl: './onboarding-dialog.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingDialogComponent {
  private readonly onboardingPreferences = inject(OnboardingPreferencesService);
  private readonly onboardingHighlight = inject(OnboardingHighlightService);
  private readonly dialogRef = inject(MatDialogRef<OnboardingDialogComponent>);

  readonly steps: readonly OnboardingStep[] = [
    {
      title: 'Application layout',
      body: 'Use the left drawer for hierarchy navigation, the center map for 2D floor visualization, and the right panel for dedicated value editing.',
      highlightTarget: 'drawer-region',
      highlightLabel: 'Layout data drawer region',
      fallbackMessage:
        'The highlighted drawer region is unavailable in the current state. Continue to the next step.',
    },
    {
      title: 'Property switching',
      body: 'Open Data and privacy to switch between bundled samples or import JSON. Replacing the active property updates drawer, map, and input context together.',
      highlightTarget: 'data-and-privacy-button',
      highlightLabel: 'Data and privacy toolbar button',
      fallbackMessage:
        'The data and privacy action is currently unavailable. You can continue and reopen guidance later.',
    },
    {
      title: 'Editing model',
      body: 'Drawer and map are for selection/display. Use the right-side inputs to update geometry, labels, and style values with centimeter-based coordinates.',
      highlightTarget: 'inspector-region',
      highlightLabel: 'Editing input fields region',
      fallbackMessage:
        'The editing input region is unavailable right now. Continue and review the section when it appears.',
    },
    {
      title: 'Local-first data',
      body: 'Data is stored locally in your browser. Use export to move data between devices and clear local data when needed.',
      highlightTarget: 'data-and-privacy-button',
      highlightLabel: 'Data and privacy toolbar button',
      fallbackMessage:
        'Data controls are unavailable in the current state. Continue and reopen guidance when controls are visible.',
    },
  ];

  readonly activeStepIndex = signal(0);
  readonly activeStep = computed(() => this.steps[this.activeStepIndex()]);
  readonly isLastStep = computed(() => this.activeStepIndex() === this.steps.length - 1);
  readonly isHighlightTargetAvailable = computed(() => {
    if (typeof document === 'undefined') {
      return true;
    }

    return (
      document.querySelector(`[data-onboarding-target="${this.activeStep().highlightTarget}"]`) !==
      null
    );
  });

  constructor() {
    effect((cleanup) => {
      this.onboardingHighlight.setHighlightTarget(this.activeStep().highlightTarget);
      cleanup(() => this.onboardingHighlight.clearHighlightTarget());
    });
  }

  onSkipClicked(): void {
    this.onboardingHighlight.clearHighlightTarget();
    this.onboardingPreferences.markSkipped();
    this.dialogRef.close();
  }

  onBackClicked(): void {
    this.activeStepIndex.update((value) => Math.max(0, value - 1));
  }

  onNextClicked(): void {
    this.activeStepIndex.update((value) => Math.min(this.steps.length - 1, value + 1));
  }

  onFinishClicked(): void {
    this.onboardingHighlight.clearHighlightTarget();
    this.onboardingPreferences.markCompleted();
    this.dialogRef.close();
  }
}
