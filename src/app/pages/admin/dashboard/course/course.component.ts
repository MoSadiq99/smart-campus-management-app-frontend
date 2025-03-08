import { Component, NgModule, OnInit } from '@angular/core';
import { CourseDto } from '../../../../models/course-dto';  // Assuming you have a model for Course
import { CommonModule } from '@angular/common';
import { CourseService } from './course.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss'],
  imports: [CommonModule]
})

export class CourseComponent implements OnInit {
  courses: CourseDto[] = [];
  
  constructor(
    private service: CourseService
  ) {}

  ngOnInit(): void {
    this.loadCourses;
  }

  loadCourses(): void {
    this.service.getCourses().subscribe({
      next: (response) => {
        this.courses = response;
        console.log(this.courses)
      },
      error: (error) => {
        console.error('Error fetching events:', error);
      }
    });
  }

  createCourse(): void {
    // Implement create course logic
    console.log('Create a new course');
  }
  
}


