import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MemberDto } from '../../../../services/group/group.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <form (ngSubmit)="addMember()" class="member-form">
      <mat-form-field appearance="fill">
        <mat-label>User ID</mat-label>
        <input matInput type="number" [(ngModel)]="newMemberId" name="newMemberId" required>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Add Member</button>
    </form>

    <div class="members-list">
      <div *ngFor="let member of members" class="member-item">
        <span>{{ member.firstName }} {{ member.lastName }}</span>
        <button mat-icon-button color="warn" (click)="removeMember(member.userId)">
          <mat-icon>remove</mat-icon>
        </button>
      </div>
    </div>

  `,
  styles: [`
    .member-form { display: flex; gap: 10px; }
  `]
})
export class MembersComponent {
  @Input() newMemberId: number = 0;
  @Input() members: MemberDto[] = [];
  @Input() isAdmin: boolean = false;
  @Input() currentUserId: number = 0;
  @Output()  removeMemberEvent = new EventEmitter<number>();
  @Output() addMemberEvent = new EventEmitter<void>();

  addMember(): void {
    this.addMemberEvent.emit();
  }

  removeMember(userId: number): void {
    this.removeMemberEvent.emit(userId);
  }
}
