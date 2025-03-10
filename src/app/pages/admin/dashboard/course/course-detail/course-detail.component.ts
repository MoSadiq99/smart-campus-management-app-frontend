import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseDto } from 'src/app/models/course-dto';
import { CourseService } from '../course.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SubjectDto } from 'src/app/models/subject-dto';
import { SubjectService } from '../../subject/subject.service';
import { CommonModule } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-course-detail',
  imports: [CommonModule, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  courseCode: string = '';
  course: CourseDto | null = null;
  courseForm: FormGroup;
  subjects: SubjectDto[] = [];

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private subjectService: SubjectService,
    private fb: FormBuilder
  ) {
    this.courseForm = this.fb.group({
      courseId: [{ value: '', disabled: true }],
      courseName: [''],
      courseCode: [''],
      description: [''],
      startDate: [''],
      endDate: [''],
      credits: [''],
      cordinatorId: [''],
      subjectIds: [[]] // Multi-select subjects
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.route.paramMap.subscribe((params) => {
      this.courseCode = params.get('courseCode') || '';
      this.loadSubjects();

      if (this.courseCode) {
        this.fetchCourseDetails();
      }
    });
  }

  fetchCourseDetails(): void {
    this.courseService.getCourseByCode(this.courseCode).subscribe({
      next: (response) => {
        this.course = response;
        this.initializeForm();
      },
      error: (error) => {
        console.error('Error fetching course details:', error);
      }
    });
  }

  initializeForm(): void {
    this.courseForm = this.fb.group({
      courseId: [{ value: this.course?.courseId || '', disabled: true }],
      courseName: [this.course?.courseName || ''],
      courseCode: [this.course?.courseCode || ''],
      description: [this.course?.description || ''],
      startDate: [this.course?.startDate || ''],
      endDate: [this.course?.endDate || ''],
      credits: [this.course?.credits || ''],
      cordinatorId: [this.course?.cordinatorId || ''],
      subjectIds: [this.course?.subjectIds || []] // Preselect subjects
    });
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe((subjects) => {
      this.subjects = subjects;
    });
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      const updatedCourse = { ...this.course, ...this.courseForm.value };
      updatedCourse.subjectIds = this.courseForm.get('subjectIds')?.value.map(Number); // Convert to numbers

      console.log('Updated Course:', updatedCourse);

      this.courseService.updateCourse(updatedCourse).subscribe({
        next: () => alert('Course updated successfully'),
        error: (error) => console.error('Error updating course:', error)
      });
    }
  }
}
