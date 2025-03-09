import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Import NgbModule for Bootstrap modals
import { CourseComponent } from './pages/admin/dashboard/course/course.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SubjectComponent } from './pages/admin/dashboard/subject/subject.component';

@NgModule({
  imports: [CourseComponent, SubjectComponent, BrowserModule, NgbModule, CommonModule, FormsModule, ReactiveFormsModule],
  providers: []
})
export class AppModule {}
