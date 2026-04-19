import { Injectable, signal } from '@angular/core';

export type OnboardingHighlightTarget =
  | 'drawer-region'
  | 'editor-region'
  | 'inspector-region'
  | 'data-and-privacy-button';

@Injectable({
  providedIn: 'root',
})
export class OnboardingHighlightService {
  private readonly highlightTargetSignal = signal<OnboardingHighlightTarget | null>(null);

  readonly highlightTarget = this.highlightTargetSignal.asReadonly();

  setHighlightTarget(target: OnboardingHighlightTarget): void {
    this.highlightTargetSignal.set(target);
  }

  clearHighlightTarget(): void {
    this.highlightTargetSignal.set(null);
  }
}
