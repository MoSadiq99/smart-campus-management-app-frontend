import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { StudentComponent } from './theme/layout/student/student.component';
import { LecturerComponent } from './theme/layout/lecturer/lecturer.component';

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
        // loadComponent: () => import('./components/admin/dashboard/dashboard.component').then((c) => c.DashboardComponent)
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
