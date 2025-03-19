import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { CourseDetailComponent } from './pages/admin/dashboard/course/course-detail/course-detail.component';
import { CourseComponent } from './pages/admin/dashboard/course/course.component';
import { SubjectDetailComponent } from './pages/admin/dashboard/subject/subject-detail/subject-detail.component';
import { SubjectComponent } from './pages/admin/dashboard/subject/subject.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { LecturerComponent } from './theme/layout/lecturer/lecturer.component';
import { StudentComponent } from './theme/layout/student/student.component';
import { EnrollmentComponent } from './pages/admin/dashboard/enrollment/enrollment.component';
import { ResourceComponent } from './components/admin/resource/resource.component';
import { GroupChatComponent } from './components/common/chat/group-chat/group-chat.component';
import { GroupViewComponent } from './components/common/chat/group-view/group-view.component';
import { EventCalendarComponent } from './components/common/event-calendar/event-calendar.component';
import { ResourceCalendarComponent } from './components/common/resource-calendar/resource-calendar.component';
import { ScheduleComponent } from './pages/admin/schedule/schedule.component';
import { authGuard } from './services/guard/auth.guard';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { EventsListComponent } from './components/common/events-list/events-list.component';

const routes: Routes = [
  {
    path: '',
    component: GuestComponent,
    children: [
      { path: '', redirectTo: 'auth' },
      { path: 'auth', loadChildren: () => import('./pages/authentication/authentication.module').then((m) => m.AuthenticationModule) }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard] //! This is the guard- It will check if JWT token is valid or not (if not, it will redirect to login page)
      },
      { path: 'resource', component: ResourceComponent, canActivate: [authGuard] },
      { path: 'event-calendar', component: EventCalendarComponent, canActivate: [authGuard] },
      { path: 'events', component: EventsListComponent },
      { path: 'resource-calendar', component: ResourceCalendarComponent, canActivate: [authGuard] },
      { path: 'chat', component: GroupViewComponent, canActivate: [authGuard] },
      { path: 'group-chat/:id', component: GroupChatComponent, canActivate: [authGuard] },
      { path: 'create-group', component: GroupViewComponent, canActivate: [authGuard] },
      { path: 'schedule-calendar', component: ScheduleComponent, canActivate: [authGuard] },
      { path: 'course', component: CourseComponent, canActivate: [authGuard] },
      { path: 'course/:courseCode', component: CourseDetailComponent, canActivate: [authGuard] },
      { path: 'subject', component: SubjectComponent, canActivate: [authGuard] },
      { path: 'subject/:subjectId', component: SubjectDetailComponent, canActivate: [authGuard] },
      { path: 'enrollment', component: EnrollmentComponent, canActivate: [authGuard] }
    ]
  },
  {
    path: 'student',
    component: StudentComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'event-calendar', component: EventCalendarComponent, canActivate: [authGuard] },
      { path: 'resource-calendar', component: ResourceCalendarComponent, canActivate: [authGuard] },
      { path: 'schedule', component: ScheduleComponent, canActivate: [authGuard] },
      { path: 'chat', component: GroupViewComponent, canActivate: [authGuard] }
    ]
  },
  {
    path: 'lecturer',
    component: LecturerComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard' },
      { path: 'chat', component: GroupViewComponent, canActivate: [authGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), BrowserModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
