import { Routes } from '@angular/router';
import { PlannerShellComponent } from './representation/shell/planner-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: PlannerShellComponent,
    data: { startupMode: 'root' },
  },
  {
    path: 'new',
    component: PlannerShellComponent,
    data: { startupMode: 'new' },
  },
  {
    path: 'w/:workbookPath',
    component: PlannerShellComponent,
    data: { startupMode: 'workbook' },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
