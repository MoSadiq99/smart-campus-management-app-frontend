import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CalendarDateFormatter, CalendarEventTitleFormatter, CalendarMomentDateFormatter, DateAdapter, MOMENT } from 'angular-calendar';
import moment from 'moment';
import { adapterFactory } from 'angular-calendar/date-adapters/moment'; // Import adapterFactory

import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Angular Material imports
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { httpTokenInterceptor } from './app/services/interceptors/http-token.interceptor';

// WebSocket configuration from SockJS and STOMP

// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // Core Angular modules
    importProvidersFrom(BrowserModule, AppRoutingModule, FormsModule),
    provideAnimations(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([httpTokenInterceptor])),

    // Angular Material modules
    importProvidersFrom(MatListModule),
    importProvidersFrom(MatCardModule),
    importProvidersFrom(MatFormFieldModule),
    importProvidersFrom(MatInputModule),
    importProvidersFrom(MatButtonModule),

    // WebSocket support with ngx-socket-io
    // importProvidersFrom(SocketIoModule.forRoot(socketConfig)),

    // Angular Calendar and Datepilot providers
    {
      provide: DateAdapter,
      useFactory: () => adapterFactory(moment)
    },
    {
      provide: MOMENT,
      useValue: moment
    },
    {
      provide: CalendarDateFormatter,
      useClass: CalendarMomentDateFormatter
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
