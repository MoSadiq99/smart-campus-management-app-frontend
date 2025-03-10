import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { Observable } from 'rxjs';

interface EntityService {
  create(data: any): Observable<any>;
}

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
  @Input() entityType!: 'course' | 'subject';
  @Input() service!: EntityService;

  ngAfterViewInit() {
    if (this.popupModal) {
      this.modal = new bootstrap.Modal(this.popupModal.nativeElement);
    }
  }

  openModal() {
    console.log('Open Modal');
    if (this.modal) {
      this.modal.show();
    } else {
      console.error('Modal instance not initialized');
    }
  }

  submitForm() {
    this.service.create(this.formData).subscribe({
      next: (response) => {
        console.log('Event created:', response);
      },
      error: (error) => {
        console.error('Error creating event:', error);
      }
    });

    this.modal.hide();
  }

  isFormValid(): boolean {
    return this.formFields.every((field) => {
      const value = this.formData[field.id];
      if (field.required && !value) return false;
      if (field.minlength && value.length < field.minlength) return false;
      if (field.maxlength && value.length > field.maxlength) return false;
      return true;
    });
  }
}
