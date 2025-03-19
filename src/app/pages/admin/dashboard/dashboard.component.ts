/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { UserService } from 'src/app/services/auth/user.service';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, BrowserModule],
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  currentUser: any;
  role: string;

  constructor(private authService: AuthenticationService, userService: UserService) {
    this.currentUser = userService.getCurrentUser();
    this.role = this.currentUser?.role || 'student';
  }

  upcomingEvents = [
    { id: 1, title: 'Midterm Exams', date: '2023-10-15', type: 'academic' },
    { id: 2, title: 'Career Fair', date: '2023-10-18', type: 'event' },
    { id: 3, title: 'Project Submission', date: '2023-10-20', type: 'deadline' }
  ];

  announcements = [
    { id: 1, title: 'Campus Wi-Fi Maintenance', date: '2023-10-10', priority: 'medium' },
    { id: 2, title: 'New Library Hours', date: '2023-10-09', priority: 'low' },
    { id: 3, title: 'COVID-19 Protocol Update', date: '2023-10-08', priority: 'high' }
  ];

  adminStats = [
    { title: 'Active Users', value: '1,245', color: 'bg-primary' },
    { title: 'Events This Week', value: '18', color: 'bg-success' },
    { title: 'Resource Utilization', value: '78%', color: 'bg-purple' },
    { title: 'Pending Requests', value: '24', color: 'bg-warning' }
  ];

  lecturerStats = [
    { title: 'Classes Today', value: '3', color: 'bg-primary' },
    { title: 'Students', value: '87', color: 'bg-success' },
    { title: 'Assignments Due', value: '5', color: 'bg-warning' },
    { title: 'Room Bookings', value: '2', color: 'bg-purple' }
  ];

  studentStats = [
    { title: 'Classes Today', value: '4', color: 'bg-primary' },
    { title: 'Assignments Due', value: '3', color: 'bg-warning' },
    { title: 'Events This Week', value: '6', color: 'bg-success' },
    { title: 'Unread Messages', value: '8', color: 'bg-danger' }
  ];

  get stats() {
    return this.role === 'admin' ? this.adminStats :
           this.role === 'lecturer' ? this.lecturerStats :
           this.studentStats;
  }
}
