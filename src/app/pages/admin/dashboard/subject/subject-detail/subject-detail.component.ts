import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseDto } from 'src/app/models/course-dto';
import { CourseService } from 'src/app/services/course.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SubjectDto } from 'src/app/models/subject-dto';
import { SubjectService } from 'src/app/services/subject.service';
import { CommonModule } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-subject-detail',
  imports: [CommonModule, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './subject-detail.component.html',
  styleUrl: './subject-detail.component.scss'
})
export class SubjectDetailComponent implements OnInit {
  subjectId: string | '';
  subject: SubjectDto | null = null;
  subjectForm: FormGroup;
  courses: CourseDto[] = [];

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private subjectService: SubjectService,
    private fb: FormBuilder
  ) {
    this.subjectForm = this.fb.group({
      subjectId: [{ value: null, disabled: true }],
      subjectName: [''],
      subjectCode: [''],
      description: [''],
      courseIds: [[]]
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.route.paramMap.subscribe((params) => {
      this.subjectId = params.get('subjectId') || '';
      this.loadCourses();

      if (this.subjectId) {
        this.fetchSubjectDetails();
      }
    });
  }

  fetchSubjectDetails(): void {
    this.subjectService.getSubjectById(this.subjectId).subscribe({
      next: (response) => {
        this.subject = response;
        this.initializeForm();
      },
      error: (error) => {
        console.error('Error fetching subject details:', error);
      }
    });
  }

  initializeForm(): void {
    this.subjectForm = this.fb.group({
      subjectId: [{ value: this.subject?.subjectId || '', disabled: true }],
      subjectName: [this.subject?.subjectName || ''],
      subjectCode: [this.subject?.subjectId || ''],
      description: [this.subject?.description || ''],
      courseIds: [this.subject?.courseIds || []] // Preselect subjects
    });
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe((courses) => {
      this.courses = courses;
    });
  }

  onSubmit(): void {
    if (this.subjectForm.valid) {
      const updatedSubject = { ...this.subject, ...this.subjectForm.value };
      updatedSubject.subjectIds = this.subjectForm.get('subjectIds')?.value.map(Number); // Convert to numbers

      console.log('Updated Subject:', updatedSubject);

      this.subjectService.updateSubject(updatedSubject).subscribe({
        next: () => alert('Subject updated successfully'),
        error: (error) => console.error('Error updating subject:', error)
      });
    }
  }
}
