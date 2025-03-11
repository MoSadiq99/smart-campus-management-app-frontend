import { Component, OnInit } from '@angular/core';
import { NotificationService, NotificationDto } from '../notification.service';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-notification-inbox',
    imports: [MatListModule, FormsModule, CommonModule],
    templateUrl: './notification-inbox.component.html',
    styleUrls: ['./notification-inbox.component.css']
})
export class NotificationInboxComponent implements OnInit {
    notifications: NotificationDto[] = [];
    userId: number = 1; // Replace with authenticated user ID from JWT

    constructor(private readonly notificationService: NotificationService) {}

    ngOnInit(): void {
        this.notificationService.getUserNotifications(this.userId)
            .subscribe(notifications => this.notifications = notifications);

        this.notificationService.getNewNotifications(this.userId)
            .subscribe(notification => this.notifications.push(notification));
    }
}
