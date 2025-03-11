import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseDto } from 'src/app/models/course-dto';
import { StudentDto } from 'src/app/models/student-dto';
import { CourseService } from 'src/app/services/course.service';
import { StudentService } from 'src/app/services/student.service';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enrollment.component.html',
  styleUrls: ['./enrollment.component.scss']
})
export class EnrollmentComponent implements OnInit {
  courses: CourseDto[] = [];
  students: StudentDto[] = [];
  selectedCourseId: number | null = null;
  enrolledStudentIds: number[] = [];
  availableStudents: StudentDto[] = [];
  selectedStudentList: StudentDto[] = [];

  constructor(
    private courseService: CourseService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadStudents();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe((courses) => {
      this.courses = courses;
    });
  }

  loadStudents(): void {
    this.studentService.getStudents().subscribe((students) => {
      this.students = students;
    });
  }

  onCourseSelect(courseId: number): void {
    this.selectedCourseId = courseId;
    this.courseService.getEnrolledStudents(courseId).subscribe((studentIds) => {
      this.enrolledStudentIds = studentIds;

      // Split students into available and selected lists
      this.selectedStudentList = this.students.filter((s) => studentIds.includes(s.userId));
      this.availableStudents = this.students.filter((s) => !studentIds.includes(s.userId));
    });
  }

  selectStudent(student: StudentDto): void {
    if (!this.selectedStudentList.includes(student)) {
      this.selectedStudentList.push(student);
      this.availableStudents = this.availableStudents.filter((s) => s.userId !== student.userId);
    }
  }

  removeStudent(student: StudentDto): void {
    this.availableStudents.push(student);
    this.selectedStudentList = this.selectedStudentList.filter((s) => s.userId !== student.userId);
  }

  getFullName(student: StudentDto): string {
    return `${student.firstName} ${student.lastName}`;
  }

  moveToSelected(): void {
    const selectedOptions = document.querySelectorAll('.available-students option:checked');
    selectedOptions.forEach((option) => {
      const student = this.students.find((s) => this.getFullName(s) === option.textContent);
      if (student) this.selectStudent(student);
    });
  }

  moveToAvailable(): void {
    const selectedOptions = document.querySelectorAll('.selected-students option:checked');
    selectedOptions.forEach((option) => {
      const student = this.students.find((s) => this.getFullName(s) === option.textContent);
      if (student) this.removeStudent(student);
    });
  }

  submitEnrollment(): void {
    if (this.selectedCourseId) {
      const studentIds = this.selectedStudentList.map((s) => s.userId);
      this.courseService.enrollStudents(this.selectedCourseId, studentIds).subscribe({
        next: () => {
          alert('Students enrolled successfully');
        },
        error: (error) => {
          console.error('Error enrolling students', error);
        }
      });
    }
  }
}
