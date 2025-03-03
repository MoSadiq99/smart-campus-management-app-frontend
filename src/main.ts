import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { CalendarDateFormatter, CalendarEventTitleFormatter, CalendarMomentDateFormatter, DateAdapter, MOMENT } from 'angular-calendar';
import moment from 'moment';
import { adapterFactory } from 'angular-calendar/date-adapters/moment'; // Import adapterFactory

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule),
    provideAnimations(),
    provideHttpClient(),
    {
      provide: DateAdapter,
      useFactory: () => adapterFactory(moment),
    },
    {
      provide: MOMENT,
      useValue: moment,
    },
    {
      provide: CalendarDateFormatter,
      useClass: CalendarMomentDateFormatter,
    },
    {
      provide: CalendarEventTitleFormatter,
      useClass: CalendarEventTitleFormatter, // Default event title formatter
    },
    // Optional: If you want native JS Date formatting instead of Moment
    // {
    //   provide: CalendarDateFormatter,
    //   useClass: CalendarNativeDateFormatter,
    // },
  ]
}).catch((err) => console.error(err));
