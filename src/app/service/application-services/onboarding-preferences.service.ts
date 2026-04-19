import { Injectable, signal } from '@angular/core';

const ONBOARDING_STATE_KEY = 'home-floor-planner.onboarding-state';

export type OnboardingState = 'new' | 'skipped' | 'completed';

@Injectable({
  providedIn: 'root',
})
export class OnboardingPreferencesService {
  private readonly onboardingStateSignal = signal<OnboardingState>(this.restoreState());

  readonly onboardingState = this.onboardingStateSignal.asReadonly();

  readonly shouldOfferOnboarding = (): boolean => this.onboardingState() === 'new';

  markSkipped(): void {
    this.updateState('skipped');
  }

  markCompleted(): void {
    this.updateState('completed');
  }

  resetState(): void {
    this.updateState('new');
  }

  private updateState(nextState: OnboardingState): void {
    this.onboardingStateSignal.set(nextState);
    this.persistState(nextState);
  }

  private restoreState(): OnboardingState {
    if (typeof window === 'undefined') {
      return 'new';
    }

    const stored = localStorage.getItem(ONBOARDING_STATE_KEY);
    if (stored === 'skipped' || stored === 'completed') {
      return stored;
    }

    return 'new';
  }

  private persistState(state: OnboardingState): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(ONBOARDING_STATE_KEY, state);
  }
}
