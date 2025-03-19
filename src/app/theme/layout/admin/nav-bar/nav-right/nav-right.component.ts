import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { NotificationService, NotificationDto } from 'src/app/services/notification/notification.service';
import { GroupService, MessageDto } from 'src/app/services/group/group.service';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent implements OnInit, OnDestroy {
  username: string = 'John Doe'; // Default value, will be updated
  notifications: NotificationDto[] = [];
  messages: MessageDto[] = []; // For group messages
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    private groupService: GroupService,
    private config: NgbDropdownConfig
  ) {
    this.config.placement = 'bottom-right';
  }

  ngOnInit(): void {
    // Fetch username from AuthenticationService
    this.username = this.authService.getUsername() || 'User';

    // Fetch initial notifications (historical)
    this.loadNotifications();

    // Subscribe to real-time notifications
    this.subscriptions.push(
      this.notificationService.getNotifications().subscribe((notification) => {
        this.notifications.unshift(notification); // Add new notifications to the top
      })
    );

    // Subscribe to group messages (assuming user is part of at least one group)
    this.loadGroupMessages();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Unsubscribe from group messages if applicable
    this.groupService.unsubscribeFromGroupMessages(1); // Replace with dynamic groupId
  }

  // Load historical notifications
  private loadNotifications(): void {
    this.subscriptions.push(
      this.notificationService.getAllNotifications().subscribe(
        (notifications) => {
          this.notifications = notifications.sort((a, b) =>
            new Date(b.sentTime).getTime() - new Date(a.sentTime).getTime()
          ); // Sort by sentTime, newest first
        },
        (error) => {
          console.error('Error fetching notifications:', error);
        }
      )
    );
  }

  // Load group messages (example for a specific group, adjust as needed)
  private loadGroupMessages(): void {
    const groupId = 1; // Replace with dynamic groupId from your app context
    this.subscriptions.push(
      this.groupService.getGroupMessages(groupId).subscribe(
        (message) => {
          this.messages.unshift(message); // Add new messages to the top
        },
        (error) => {
          console.error('Error fetching group messages:', error);
        }
      )
    );
  }

  // Mark notification as read
  markAsRead(notificationId: number): void {
    console.log('Marking notification as read:', notificationId);
    this.subscriptions.push(
      this.notificationService.markAsRead(notificationId).subscribe(
        () => {
          const notification = this.notifications.find(n => n.id === notificationId);
          if (notification) notification.read = true;
        },
        (error) => {
          console.error('Error marking notification as read:', error);
        }
      )
    );
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notifications = [];
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.reload();
  }


  markAsReadAll(): void {
    this.notifications
      .filter(n => !n.read)
      .forEach(n => this.markAsRead(n.id));
  }
}
