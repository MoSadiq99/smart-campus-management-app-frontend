import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { StudentComponent } from './theme/layout/student/student.component';
import { LecturerComponent } from './theme/layout/lecturer/lecturer.component';
import { AdminConsoleComponent } from './components/common/admin-console/admin-console.component';
import { CourseComponent } from './pages/admin/dashboard/course/course.component';
import { SubjectComponent } from './pages/admin/dashboard/subject/subject.component';
import { BrowserModule } from '@angular/platform-browser';

const routes: Routes = [

  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: '',
        redirectTo: 'auth'
      },
      {
        path: 'auth',
        loadChildren: () => import('./pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./components/common/event-calendar/event-calendar.component').then((m) => m.EventCalendarComponent)
      }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        children: [
          { path: 'course', component: CourseComponent },
          { path: 'subject', component: SubjectComponent }
        ]
      },

    ]
  },
  {
    path: 'student',
    component: StudentComponent,

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        // loadComponent: () => import('./components/farmer/farmer-dashboard/farmer-dashboard.component').then((m) => m.FarmerDashboardComponent),
      },

      {
        path: 'calendar',
        loadComponent: () => import('./components/common/event-calendar/event-calendar.component').then((m) => m.EventCalendarComponent)
      },

      {
        path: 'resource-calendar',

        loadComponent: () => import('./components/common/resource-calendar/resource-calendar.component').then((m) => m.ResourceCalendarComponent)
      },

      {
        path: 'schedule-calendar',
        loadComponent: () => import('./components/common/schedule-calendar/schedule-calendar.component').then((m) => m.ScheduleCalendarComponent)
      }

    ]
  },
  {
    path: 'lecturer',
    component: LecturerComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        // loadComponent: () => import('./components/buyer/buyer-dashboard/buyer-dashboard.component').then((m) => m.BuyerDashboardComponent),

      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), BrowserModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
