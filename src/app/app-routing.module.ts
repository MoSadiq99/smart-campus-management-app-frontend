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

import { EnrollmentComponent } from './pages/admin/dashboard/enrollment/enrollment.component';
// import { ScheduleComponent } from './pages/admin/schedule/schedule.component';

import { authGuard } from './services/guard/auth.guard';
import { GroupViewComponent } from './components/common/chat/group-view/group-view.component';
import { GroupChatComponent } from './components/common/chat/group-chat/group-chat.component';
import { ScheduleComponent } from './pages/admin/schedule/schedule.component';

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
      }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/dashboard/admin-dash/admin-dash.component').then((m) => m.AdminDashComponent),
        canActivate: [authGuard] //! This is the guard- It will check if JWT token is valid or not (if not, it will redirect to login page)
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
      { path: 'chat', component: GroupViewComponent },
      { path: 'group-chat/:id', component: GroupChatComponent },

      {
        path: 'create-group',
        loadComponent: () => import('./components/admin/create-group/create-group.component').then((m) => m.CreateGroupComponent)
      },
      {
        path: 'schedule-calendar', component: ScheduleComponent
      },
      { path: 'course', component: CourseComponent },
      { path: 'course/:courseCode', component: CourseDetailComponent },
      { path: 'subject', component: SubjectComponent },
      { path: 'subject/:subjectId', component: SubjectDetailComponent },
      // { path: 'user', component: SubjectComponent },
      { path: 'enrollment', component: EnrollmentComponent }
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

      // {
      //   path: 'schedule-calendar',
      //   loadComponent: () =>
      //     import('./components/common/schedule-calendar/schedule-calendar.component').then((m) => m.ScheduleCalendarComponent)
      // },
      {
        path: 'schedule',
        loadComponent: () => import('./pages/admin/schedule/schedule.component').then((m) => m.ScheduleComponent)
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), BrowserModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
