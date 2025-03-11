/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupService } from '../../common/chat/group.service';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-group',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit {
  groupForm: FormGroup;
  courses: any[] = [];
  users: any[] = [];

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
    this.groupForm.patchValue({
      initialMemberIds: [this.authService.getCurrentUserId()]
    });

    // Fetch courses for dropdown (uncomment when service is available)
    // this.courseService.getCourses().subscribe({
    //   next: (courses) => this.courses = courses,
    //   error: () => this.snackBar.open('Failed to load courses', 'Close', { duration: 3000 })
    // });

    // Fetch users for initial members (uncomment when service is available)
    // this.userService.getUsers().subscribe({
    //   next: (users) => this.users = users.filter(u => u.role === 'STUDENT'),
    //   error: () => this.snackBar.open('Failed to load users', 'Close', { duration: 3000 })
    // });
  }

  onSubmit(): void {
    if (this.groupForm.valid) {
      this.groupService.createGroup(this.groupForm.value).subscribe({
        next: () => {
          this.snackBar.open('Group created successfully!', 'Close', { duration: 3000 });
          this.groupForm.reset();
        },
        error: (err) => {
          this.snackBar.open('Error creating group: ' + err.message, 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
    }
  }
}