import { Component, OnInit, ViewChild } from '@angular/core';
import { CourseDto } from '../../../../models/course-dto';  // Assuming you have a model for Course
import { CommonModule } from '@angular/common';
import { CourseService } from './course.service';
import { PopupModalComponent } from 'src/app/components/common/popup-modal/popup-modal.component';
import { CourseCreateForm } from 'src/app/models/input-forms';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss'],
  imports: [CommonModule, PopupModalComponent]
})

export class CourseComponent implements OnInit {
  courses: CourseDto[] = [];
  courseForm = CourseCreateForm;
  
  @ViewChild(PopupModalComponent) popupModal!: PopupModalComponent
  
  constructor(
    private courseService: CourseService,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    console.log("Calling getCourses")
    this.courseService.getCourses().subscribe({
      next: (response) => {
        this.courses = response;
        console.log(this.courses)
      },
      error: (error) => {
        console.error('Error fetching events:', error);
      }
    });
  }

  async createCourse() {
    console.log("Create Course");
    if (this.popupModal) {
      this.popupModal.openModal();
    } else {
      console.error("PopupModalComponent is not initialized");
    }
  }
  
}


