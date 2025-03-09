import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { CourseComponent } from 'src/app/pages/admin/dashboard/course/course.component';
import { CourseService } from 'src/app/pages/admin/dashboard/course/course.service';

@Component({
  selector: 'app-popup-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './popup-modal.component.html',
  styleUrl: './popup-modal.component.scss'
})
export class PopupModalComponent implements AfterViewInit {
  @ViewChild('popupModal') popupModal!: ElementRef;
  @Input() formFields: any[] = [];
  private modal!: bootstrap.Modal;
  formData: any = {};
  formValid: boolean = true;

  constructor(private courseService: CourseService, private courseComponent: CourseComponent) {}

  ngAfterViewInit() {
    if (this.popupModal) {
      this.modal = new bootstrap.Modal(this.popupModal.nativeElement);
    }
  }

  openModal() {
    console.log("Open Modal");
    if (this.modal) {
      this.modal.show();
    } else {
      console.error("Modal instance not initialized");
    }
  }

  submitForm() {
    console.log("Form Submitted:", this.formData);

    this.courseService.createCourse(this.formData).subscribe({
      next: (response) => {
        console.log('Event created:', response);
      },
      error: (error) => {
        console.error('Error creating event:', error);
      }
    });

    this.courseComponent.loadCourses()
    this.modal.hide();
  }

  isFormValid(): boolean {
    return this.formFields.every(field => {
      const value = this.formData[field.id];
      if (field.required && !value) return false;
      if (field.minlength && value.length < field.minlength) return false;
      if (field.maxlength && value.length > field.maxlength) return false;
      return true;
    });
  }
}
