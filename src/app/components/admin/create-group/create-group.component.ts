import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupService, GroupCreateDto } from '../../common/chat/group.service';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

interface Course {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <div class="container">
      <mat-card class="create-group-card">
        <mat-card-header>
          <mat-card-title>Create a New Group</mat-card-title>
          <mat-card-subtitle>Fill in the details to create a group</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="groupForm" (ngSubmit)="onSubmit()">
            <!-- Group Name -->
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Group Name</mat-label>
              <input matInput formControlName="groupName" placeholder="e.g., CS101 Study Group" required>
              <mat-error *ngIf="groupForm.get('groupName')?.hasError('required')">
                Group name is required
              </mat-error>
              <mat-error *ngIf="groupForm.get('groupName')?.hasError('minlength')">
                Must be at least 3 characters
              </mat-error>
            </mat-form-field>

            <!-- Description -->
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" placeholder="e.g., A group for CS101 students to collaborate" rows="3"></textarea>
            </mat-form-field>

            <!-- Course Dropdown -->
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Select Course</mat-label>
              <mat-select formControlName="courseId" (selectionChange)="onCourseChange($event.value)" required>
                <mat-option *ngFor="let course of courses" [value]="course.id">
                  {{ course.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="groupForm.get('courseId')?.hasError('required')">
                Please select a course
              </mat-error>
            </mat-form-field>

            <!-- Initial Members -->
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Initial Members (Optional)</mat-label>
              <mat-select formControlName="initialMemberIds" multiple>
                <mat-option *ngFor="let user of users" [value]="user.id">
                  {{ user.username }} ({{ user.email }})
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Submit Button -->
            <mat-card-actions>
              <button mat-raised-button color="primary" type="submit" [disabled]="groupForm.invalid" class="full-width">
                Create Group
              </button>
            </mat-card-actions>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }
    .create-group-card {
      width: 100%;
      max-width: 600px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    mat-card-header {
      background-color: #3f51b5;
      color: white;
      padding: 16px;
    }
    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: center;
    }
    button {
      padding: 8px 16px;
    }
  `]
})
export class CreateGroupComponent implements OnInit {
  groupForm: FormGroup;
  courses: Course[] = [];
  users: User[] = [];

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService,
    private authService: AuthenticationService,
    private snackBar: MatSnackBar
  ) {
    this.groupForm = this.fb.group({
      groupName: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      courseId: ['', Validators.required],
      initialMemberIds: [[]]
    });
  }

  ngOnInit(): void {
    const currentUserId = this.authService.getCurrentUserId();
    if (currentUserId) {
      this.groupForm.patchValue({
        initialMemberIds: [currentUserId]
      });
    }

    // Fetch courses
    this.groupService.getCourses().subscribe({
      next: (courses) => this.courses = courses,
      error: () => this.snackBar.open('Failed to load courses', 'Close', { duration: 3000 })
    });
  }

  onCourseChange(courseId: number): void {
    // Fetch users enrolled in the selected course
    this.groupService.getUsersByCourse(courseId).subscribe({
      next: (users) => {
        this.users = users;
        const currentUserId = this.authService.getCurrentUserId();
        if (currentUserId && !this.users.some(u => u.id === currentUserId)) {
          this.users.push({ id: currentUserId, username: 'You', email: '' }); // Ensure current user is included
        }
      },
      error: () => this.snackBar.open('Failed to load users for this course', 'Close', { duration: 3000 })
    });
  }

  onSubmit(): void {
    if (this.groupForm.valid) {
      const groupData: GroupCreateDto = {
        ...this.groupForm.value,
        creatorId: this.authService.getCurrentUserId() || 0
      };
      this.groupService.createGroup(groupData).subscribe({
        next: () => {
          this.snackBar.open('Group created successfully!', 'Close', { duration: 3000 });
          this.groupForm.reset();
          this.users = []; // Reset users list
        },
        error: (err) => {
          this.snackBar.open('Error creating group: ' + (err.message || 'Unknown error'), 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
    }
  }
}