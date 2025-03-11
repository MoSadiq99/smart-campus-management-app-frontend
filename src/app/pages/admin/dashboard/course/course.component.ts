import { Component, OnInit, ViewChild } from '@angular/core';
import { CourseDto } from '../../../../models/course-dto'; // Assuming you have a model for Course
import { CommonModule } from '@angular/common';
import { CourseService } from 'src/app/services/course.service';
import { PopupModalComponent } from 'src/app/components/common/popup-modal/popup-modal.component';
import { CourseCreateForm } from 'src/app/models/input-forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course',
  standalone: true,
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss'],
  imports: [CommonModule, PopupModalComponent]
})
export class CourseComponent implements OnInit {
  courses: CourseDto[] = [];
  courseForm = CourseCreateForm;

  @ViewChild(PopupModalComponent) popupModal!: PopupModalComponent;

  constructor(
    public courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    console.log('Calling getCourses');
    this.courseService.getCourses().subscribe({
      next: (response) => {
        this.courses = response;
        console.log(this.courses);
      },
      error: (error) => {
        console.error('Error fetching events:', error);
      }
    });
  }

  async createCourse() {
    console.log('Create Course');
    if (this.popupModal) {
      this.popupModal.openModal();
    } else {
      console.error('PopupModalComponent is not initialized');
    }
  }

  goToCourse(courseCode: string) {
    console.log('Navigating to course:', courseCode);
    this.router.navigate(['/admin/dashboard/course', courseCode]);
  }
}
