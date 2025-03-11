import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <form (ngSubmit)="addMember()" class="member-form">
      <mat-form-field appearance="fill">
        <mat-label>User ID</mat-label>
        <input matInput type="number" [(ngModel)]="newMemberId" name="newMemberId" required>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Add Member</button>
    </form>
  `,
  styles: [`
    .member-form { display: flex; gap: 10px; }
  `]
})
export class MembersComponent {
  @Input() newMemberId: number = 0;
  @Output() addMemberEvent = new EventEmitter<void>();

  addMember(): void {
    this.addMemberEvent.emit();
  }
}
