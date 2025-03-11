import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { StudentComponent } from './theme/layout/student/student.component';
import { LecturerComponent } from './theme/layout/lecturer/lecturer.component';
import { CourseComponent } from './pages/admin/dashboard/course/course.component';
import { SubjectComponent } from './pages/admin/dashboard/subject/subject.component';
import { BrowserModule } from '@angular/platform-browser';
import { CourseDetailComponent } from './pages/admin/dashboard/course/course-detail/course-detail.component';
import { SubjectDetailComponent } from './pages/admin/dashboard/subject/subject-detail/subject-detail.component';

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
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/dashboard/admin-dash/admin-dash.component').then((m) => m.AdminDashComponent)
      },

      {
        path: 'resource',
        loadComponent: () => import('./components/admin/resource/resource.component').then((c) => c.ResourceComponent)
      },

      {
        path: 'event-calendar',
        loadComponent: () => import('./components/common/event-calendar/event-calendar.component').then((m) => m.EventCalendarComponent)
      },
      {
        path: 'resource-calendar',

        loadComponent: () =>
          import('./components/common/resource-calendar/resource-calendar.component').then((m) => m.ResourceCalendarComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./components/common/chat/group-chat.component').then((m) => m.GroupChatComponent)
      },
      {
        path: 'create-group',
        loadComponent: () => import('./components/admin/create-group/create-group.component').then((m) => m.CreateGroupComponent)
      },
      { path: 'course', component: CourseComponent },
      { path: 'course/:courseCode', component: CourseDetailComponent },
      { path: 'subject', component: SubjectComponent },
      { path: 'subject/:subjectId', component: SubjectDetailComponent },
      { path: 'user', component: SubjectComponent }

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
        path: 'dashboard'
        // loadComponent: () => import('./components/farmer/farmer-dashboard/farmer-dashboard.component').then((m) => m.FarmerDashboardComponent),
      },

      {
        path: 'event-calendar',
        loadComponent: () => import('./components/common/event-calendar/event-calendar.component').then((m) => m.EventCalendarComponent)
      },

      {
        path: 'resource-calendar',

        loadComponent: () =>
          import('./components/common/resource-calendar/resource-calendar.component').then((m) => m.ResourceCalendarComponent)
      },

      {
        path: 'schedule-calendar',
        loadComponent: () =>
          import('./components/common/schedule-calendar/schedule-calendar.component').then((m) => m.ScheduleCalendarComponent)
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
        path: 'dashboard'
        // loadComponent: () => import('./components/buyer/buyer-dashboard/buyer-dashboard.component').then((m) => m.BuyerDashboardComponent),
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes), BrowserModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
