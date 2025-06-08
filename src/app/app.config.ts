import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {CalendarModule, DateAdapter} from "angular-calendar";
import {adapterFactory} from "angular-calendar/date-adapters/date-fns";
import { SchedulerModule } from 'angular-calendar-scheduler';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideAnimationsAsync(), 
    importProvidersFrom(
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory,
      }),
      SchedulerModule.forRoot({
        locale: "pl",
        headerDateFormat: "daysRange"
      }),
    ),
     provideHttpClient(
    // DI-based interceptors must be explicitly enabled.
    withInterceptorsFromDi(),
  ),
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ]
};
