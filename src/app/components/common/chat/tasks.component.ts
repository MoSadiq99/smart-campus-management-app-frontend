import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TaskCreateDto } from './group.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <form (ngSubmit)="createTask()" class="task-form">
      <mat-form-field appearance="fill">
        <mat-label>Title</mat-label>
        <input matInput [(ngModel)]="newTask.title" name="title" required>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Description</mat-label>
        <input matInput [(ngModel)]="newTask.description" name="description">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Assign To (User ID)</mat-label>
        <input matInput type="number" [(ngModel)]="newTask.assignedToId" name="assignedToId" required>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Due Date</mat-label>
        <input matInput type="date" [(ngModel)]="newTask.dueDate" name="dueDate" required>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Create Task</button>
    </form>
  `,
  styles: [`
    .task-form { display: flex; flex-direction: column; gap: 10px; }
  `]
})
export class TasksComponent {
  @Input() newTask: TaskCreateDto = { title: '', description: '', assignedToId: 0, dueDate: '' };
  @Output() createTaskEvent = new EventEmitter<void>();

  createTask(): void {
    this.createTaskEvent.emit();
  }
}
