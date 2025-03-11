import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskCreateDto, TaskDto, GroupService } from './group.service';
import { UserDto } from '../../../services/auth/user.service';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <div class="tasks-container">
      <mat-card class="new-task-card" *ngIf="isAdminOrLecture()">
        <mat-card-header>
          <mat-card-title>Create New Task</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="createTask()" class="task-form">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Task Title</mat-label>
              <input matInput [(ngModel)]="newTask.title" name="title" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="newTask.description" name="description" rows="3"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Assign To</mat-label>
              <mat-select [(ngModel)]="newTask.assignedToId" name="assignedToId">
                <mat-option [value]="null">All Group Members</mat-option>
                <mat-option *ngFor="let member of groupMembers" [value]="member.id">
                  {{ member.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Due Date</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="newTask.dueDate" name="dueDate" required>
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="submit-button" [disabled]="!isAdminOrLecture()">Create Task</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card class="tasks-list">
        <mat-card-header>
          <mat-card-title>Available Tasks</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="task-list-container">
            <div *ngFor="let task of tasks" class="task-item-wrapper">
              <div class="task-item" (click)="toggleTaskPreview(task.taskId)">
                <div class="task-content">
                  <div class="task-header">
                    <h3 class="task-title">{{ task.title || 'Untitled Task' }}</h3>
                    <button mat-icon-button color="warn" (click)="deleteTask(task.taskId, $event)" class="delete-button" *ngIf="isAdminOrLecture()">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  <p class="description" *ngIf="task.description">{{ task.description || 'No description provided' }}</p>
                  <div class="task-details" *ngIf="task.assignedToId || task.dueDate">
                    <span class="assigned-to">Assigned to: {{ task.assignedToId ? getMemberName(task.assignedToId) : 'All Members' }}</span>
                    <span class="due-date">Due: {{ task.dueDate ? (task.dueDate | date:'mediumDate') : 'Not set' }}</span>
                  </div>
                </div>
              </div>

              <!-- Task preview with proper scoping -->
              <div class="task-preview" *ngIf="selectedTaskId === task.taskId">
                <div class="preview-content">
                  <h4>Task Details</h4>
                  <p><strong>Title:</strong> {{ task.title || 'Untitled' }}</p>
                  <p><strong>Description:</strong> {{ task.description || 'No description' }}</p>
                  <p><strong>Assigned to:</strong> {{ task.assignedToId ? getMemberName(task.assignedToId) : 'All Members' }}</p>
                  <p><strong>Due Date:</strong> {{ task.dueDate ? (task.dueDate | date:'mediumDate') : 'Not set' }}</p>
                  <button mat-button (click)="toggleTaskPreview(task.taskId)">Close</button>
                </div>
              </div>
            </div>
            <div class="no-tasks" *ngIf="tasks.length === 0">No tasks available</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .tasks-container {
        max-width: 1200px;
        margin: 20px auto;
        padding: 20px;
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .new-task-card {
        flex: 1;
        min-width: 320px;
        max-width: 400px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .tasks-list {
        flex: 2;
        min-width: 320px;
        max-width: 700px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .task-form {
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 20px;
      }

      .form-field {
        width: 100%;
      }

      .submit-button {
        margin-top: 10px;
        padding: 8px 24px;
        border-radius: 4px;
      }

      .task-list-container {
        width: 100%;
      }

      .task-item-wrapper {
        margin: 10px 0;
        position: relative;
        width: 100%;
      }

      .task-item {
        padding: 15px;
        border-radius: 6px;
        background: #fafafa;
        transition: all 0.2s ease;
        border: 1px solid #eee;
        width: 100%;
        min-height: 100px;
        box-sizing: border-box;
        cursor: pointer;
      }

      .task-item:hover {
        background: #f5f5f5;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      }

      .task-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
        width: 100%;
      }

      .task-title {
        color: #1a73e8;
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        word-break: break-word;
        flex: 1;
      }

      .description {
        color: #555;
        margin: 10px 0;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
        padding: 5px 0;
      }

      .task-details {
        display: flex;
        justify-content: space-between;
        color: #777;
        font-size: 13px;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #eee;
        flex-wrap: wrap;
        width: 100%;
      }

      .assigned-to,
      .due-date {
        display: block;
        margin: 5px 0;
        word-break: break-word;
        max-width: 48%;
      }

      .delete-button {
        padding: 5px;
        min-width: 0;
        opacity: 0.7;
        transition: opacity 0.2s ease;
        margin-left: 10px;
      }

      .delete-button:hover {
        opacity: 1;
        color: #d32f2f;
      }

      .task-preview {
        margin-top: 10px;
        padding: 15px;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
        box-sizing: border-box;
        z-index: 100;
      }

      .preview-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
      }

      .preview-content p {
        margin: 5px 0;
        word-break: break-word;
        max-width: 100%;
      }

      .no-tasks {
        text-align: center;
        padding: 20px;
        color: #666;
        font-style: italic;
      }

      mat-card-header {
        padding: 16px 20px;
        border-bottom: 1px solid #eee;
      }

      mat-card-title {
        color: #333;
        font-weight: 500;
        font-size: 20px;
      }

      mat-card-content {
        padding: 16px 20px;
      }

      @media (max-width: 768px) {
        .tasks-container {
          flex-direction: column;
          padding: 10px;
        }

        .new-task-card,
        .tasks-list {
          max-width: 100%;
        }

        .task-preview {
          max-height: 300px;
        }
      }
    `
  ]
})
export class TasksComponent implements OnInit {
  @Input() newTask: TaskCreateDto = { title: '', description: '', assignedToId: null, assignedToGroupId: null, dueDate: null };
  @Input() groupId: number;
  @Output() createTaskEvent = new EventEmitter<void>();
  tasks: TaskDto[] = [];
  groupMembers: UserDto[] = [];
  selectedTaskId: number | null = null;
  currentUser: UserDto | null = null;

  constructor(
    private groupService: GroupService,
    private authService: AuthenticationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadGroupMembers();
    this.loadTasks();
    if (this.groupId) {
      this.newTask.assignedToGroupId = this.groupId;
    }
  }

  loadGroupMembers(): void {
    this.groupService.getGroupMembers(this.groupId).subscribe(
      members => this.groupMembers = members,
      err => console.error('Error loading group members:', err)
    );
  }

  loadTasks(): void {
    this.groupService.getGroupTasks(this.groupId).subscribe(
      tasks => {
        this.tasks = tasks;
      },
      err => console.error('Error loading tasks:', err)
    );
  }

  createTask(): void {
    if (!this.isAdminOrLecture()) {
      this.snackBar.open('Only ADMIN or LECTURE can create tasks', 'Close', { duration: 2000 });
      return;
    }
    if (this.newTask.title.trim()) {
      this.groupService.createGroupTask(this.groupId, this.newTask).subscribe({
        next: (task) => {
          this.tasks.push(task);
          this.snackBar.open('Task created successfully', 'Close', { duration: 2000 });
          this.resetTaskForm();
          this.createTaskEvent.emit();
        },
        error: (err) => {
          console.error('Error creating task:', err);
          this.snackBar.open('Failed to create task', 'Close', { duration: 2000 });
        }
      });
    } else {
      this.snackBar.open('Please fill out all required fields', 'Close', { duration: 2000 });
    }
  }

  deleteTask(taskId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isAdminOrLecture()) {
      this.snackBar.open('Only ADMIN or LECTURE can delete tasks', 'Close', { duration: 2000 });
      return;
    }
    this.groupService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(task => task.taskId !== taskId);
        if (this.selectedTaskId === taskId) this.selectedTaskId = null;
        this.snackBar.open('Task deleted successfully', 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        this.snackBar.open('Failed to delete task', 'Close', { duration: 2000 });
      }
    });
  }

  getMemberName(userId: number): string {
    const member = this.groupMembers.find(m => m.id === userId);
    return member?.name || 'Unknown';
  }

  resetTaskForm(): void {
    this.newTask = { title: '', description: '', assignedToId: null, assignedToGroupId: this.groupId, dueDate: null };
  }

  isAdminOrLecture(): boolean {
    return this.authService.isAdmin() || this.authService.isLecturer();
  }

  toggleTaskPreview(taskId: number): void {
    // Toggle selected task ID
    this.selectedTaskId = this.selectedTaskId === taskId ? null : taskId;
  }
}
