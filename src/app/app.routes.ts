import { Routes } from '@angular/router';
import { AppRouting } from './utils/app-routing.enum';
import { StartComponent } from './pages/start/start.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { dashboardRoutes } from './pages/dashboard/dashboard.routes';

export const routes: Routes = [
    {
        path: AppRouting.start,
        data: { breadcrumb: 'Strona powitalna' },
        component: StartComponent
      },

      {
        path: AppRouting.dashboard,
        data: { breadcrumb: 'Panel glowny' },
        component: DashboardComponent,
        children: dashboardRoutes
      },
      {
        path: AppRouting.login,
        data: { breadcrumb: 'Logowanie' },
        component: LoginComponent
      },
      {
        path: AppRouting.register,
        data: { breadcrumb: 'Rejestracja' },
        component: RegisterComponent
      },
];

