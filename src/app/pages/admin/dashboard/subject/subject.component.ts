import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupModalComponent } from 'src/app/components/common/popup-modal/popup-modal.component';
import { SubjectCreateForm } from 'src/app/models/input-forms';
import { Router } from '@angular/router';
import { SubjectDto } from 'src/app/models/subject-dto';
import { SubjectService } from 'src/app/services/subject.service';

@Component({
  selector: 'app-subject',
  standalone: true,
  templateUrl: './subject.component.html',
  styleUrls: ['./subject.component.scss'],
  imports: [CommonModule, PopupModalComponent]
})
export class SubjectComponent implements OnInit {
  subjects: SubjectDto[] = [];
  subjectForm = SubjectCreateForm;

  @ViewChild(PopupModalComponent) popupModal!: PopupModalComponent;

  constructor(
    public subjectService: SubjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  public loadSubjects() {
    this.subjectService.getSubjects().subscribe({
      next: (response) => {
        this.subjects = response;
        console.log(this.subjects);
      },
      error: (error) => {
        console.error('Error fetching events:', error);
      }
    });
  }

  createSubject() {
    if (this.popupModal) {
      this.popupModal.openModal();
    } else {
      console.error('PopupModalComponent is not initialized');
    }
  }

  goToSubject(subjectId: number) {
    this.router.navigate(['/admin/dashboard/subject', subjectId]);
  }
}
