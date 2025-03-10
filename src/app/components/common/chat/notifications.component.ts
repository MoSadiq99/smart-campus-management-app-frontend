import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { NotificationDto } from './notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatListModule],
  template: `
    <mat-list>
      <mat-list-item *ngFor="let notification of notifications">
        <span matListItemTitle>{{ notification.message }}</span>
        <span matListItemLine>{{ notification.sentTime | date:'short' }}</span>
      </mat-list-item>
    </mat-list>
  `,
  styles: [`
    mat-list { max-height: 200px; overflow-y: auto; }
  `]
})
export class NotificationsComponent {
  @Input() notifications: NotificationDto[] = [];
}
 