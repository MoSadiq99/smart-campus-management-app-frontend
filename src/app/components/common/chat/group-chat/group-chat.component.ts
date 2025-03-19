/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GroupService, MessageDto, MessageCreateDto, TaskCreateDto, FileDto, TaskDto, MemberDto } from '../../../../services/group/group.service';
import { NotificationService, NotificationDto } from '../../../../services/notification/notification.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ChatComponent } from '../chat/chat.component';
import { FilesComponent } from '../file/files.component';
import { TasksComponent } from '../task/tasks.component';
import { MembersComponent } from '../member/members.component';
import { NotificationsComponent } from '../../nofications/notifications.component';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { MatSpinner } from '@angular/material/progress-spinner';
import { UserDto } from 'src/app/models/dto/UserDto';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    ChatComponent,
    FilesComponent,
    TasksComponent,
    MembersComponent,
    NotificationsComponent,
    MatSpinner
  ],
  template: `
    <div *ngIf="isLoading" class="loading-container">
      <mat-spinner diameter="40"></mat-spinner>
      <p>Loading group data...</p>
    </div>

    <mat-card *ngIf="!isLoading" class="chat-container">
      <mat-card-header>
        <mat-card-title>{{ groupName }}</mat-card-title>
        <mat-card-subtitle *ngIf="members.length">{{ members.length }} members</mat-card-subtitle>
      </mat-card-header>

      <mat-tab-group animationDuration="300ms" [selectedIndex]="selectedTabIndex" (selectedTabChange)="onTabChange($event)">
        <mat-tab label="Chat">
          <app-chat
            [messages]="messages"
            [newMessage]="newMessage"
            [currentUserId]="currentUserId"
            (sendMessageEvent)="sendMessage()"
            (attachFileEvent)="onAttachmentClick()"
          ></app-chat>
        </mat-tab>
        <mat-tab label="Files">
          <!-- <app-files [files]="files" [isUploading]="isUploading" (uploadFileEvent)="uploadFile($event)"></app-files> -->
          <app-files [files]="files" [isUploading]="isUploading" [groupId]="groupId" (uploadFileEvent)="uploadFile($event)"></app-files>
        </mat-tab>
        <!-- <mat-tab label="Tasks">
        <app-tasks [tasks]="tasks" [newTask]="newTask" [groupId]="groupId" [members]="members" (createTaskEvent)="createTask()" (deleteTaskEvent)="deleteTask($event)"></app-tasks>
      </mat-tab> -->
        <mat-tab label="Tasks">
          <app-tasks
            [tasks]="tasks"
            [newTask]="newTask"
            [groupId]="groupId"
            [members]="members"
            (createTaskEvent)="createTask()"
            (deleteTaskEvent)="onDeleteTask($event)"
          ></app-tasks>
        </mat-tab>
        <mat-tab label="Members">
          <app-members
            [newMemberId]="newMemberId"
            [currentUserId]="currentUserId"
            [isAdmin]="isAdmin"
            (addMemberEvent)="addMember()"
            (removeMemberEvent)="removeMember($event)"
            [members]="members"
          ></app-members>
        </mat-tab>
      </mat-tab-group>
    </mat-card>

    <app-notifications [notifications]="notifications"></app-notifications>
  `,
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedTabIndex: number = 0;
  @Input() groupId!: number;

  messages: MessageDto[] = [];
  files: FileDto[] = [];
  tasks: TaskDto[] = [];
  members: MemberDto[] = [];

  groupName: string = '';
  isLoading: boolean = true;
  isUploading: boolean = false;
  isAdmin: boolean = false;
  currentUserId: number = 0;

  newMessage: MessageCreateDto = {
    senderId: 0,
    groupId: 0,
    content: ''
  };

  newTask: TaskCreateDto = {
    title: '',
    description: '',
    assignedToId: null,
    assignedToGroupId: 0,
    dueDate: ''
  };

  newMemberId: number = 0;
  notifications: NotificationDto[] = [];

  private subscriptions: Subscription[] = [];
  private messageSubscription?: Subscription;

  constructor(
    private readonly groupService: GroupService,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthenticationService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.isAdmin = this.authService.getRole() === 'ROLE_ADMIN' || this.authService.getRole() === 'ROLE_LECTURER';

    // Subscribe to notifications
    const notificationSub = this.notificationService.getNotifications().subscribe({
      next: (notification) => {
        this.notifications.push(notification);
        this.snackBar.open(notification.message, 'Close', { duration: 3000 });
      },
      error: (err) => console.error('Notification subscription error:', err)
    });

    this.subscriptions.push(notificationSub);

    // Load group data if groupId is available
    if (this.groupId) {
      this.initializeGroup(this.groupId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle group change
    if (changes['groupId'] && !changes['groupId'].firstChange) {
      const newGroupId = changes['groupId'].currentValue;
      if (newGroupId) {
        this.cleanupCurrentGroup();
        this.initializeGroup(newGroupId);
      }
    }
  }

  private initializeGroup(groupId: number): void {
    this.isLoading = true;
    this.messages = [];
    this.files = [];
    this.tasks = [];
    this.members = [];

    // Initialize message and task objects
    this.newMessage = {
      senderId: this.currentUserId,
      groupId: groupId,
      content: ''
    };

    this.newTask = {
      title: '',
      description: '',
      assignedToId: null,
      assignedToGroupId: groupId,
      dueDate: ''
    };

    // Load group data
    this.loadGroupData(groupId);

    // Subscribe to real-time messages
    this.subscribeToGroupMessages(groupId);
  }

  private cleanupCurrentGroup(): void {
    // Unsubscribe from current message subscription
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = undefined;
    }
  }

  private loadGroupData(groupId: number): void {
    this.groupService.getGroupById(groupId).subscribe({
      next: (group) => {
        this.groupName = group.groupName;
        this.messages = group.messages || [];
        this.files = group.files || [];
        this.tasks = group.tasks || [];
        this.members = group.members || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(`Error loading group ${groupId}:`, err);
        this.snackBar.open('Failed to load group data. Please try again.', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
        this.isLoading = false;
      }
    });
  }

  private subscribeToGroupMessages(groupId: number): void {
    this.messageSubscription = this.groupService.getGroupMessages(groupId).subscribe({
      next: (message) => {
        // Add message to messages array if it belongs to this group
        if (message.groupId === this.groupId) {
          this.messages.push(message);
        }
      },
      error: (err) => console.error('Message subscription error:', err)
    });
  }

  onTabChange(event: any): void {
    // You can implement specific logic when tab changes
    // For example, mark messages as read when chat tab is selected
  }

  sendMessage(): void {
    if (this.newMessage.content.trim()) {
      this.groupService.sendMessage(this.newMessage).subscribe({
        next: () => {
          // Message will be received through the WebSocket subscription
          this.newMessage.content = '';
        },
        error: (err) => {
          console.error('Error sending message:', err);
          this.snackBar.open('Failed to send message. Please try again.', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  // addMember(): void {
  //   if (this.newMemberId > 0) {
  //     this.groupService.addGroupMember(this.groupId, this.newMemberId).subscribe({
  //       next: () => {
  //         // Reload members list
  //         this.loadGroupMembers();
  //         this.newMemberId = 0;
  //         this.snackBar.open('Member added successfully', 'Close', { duration: 2000 });
  //       },
  //       error: (err) => {
  //         console.error('Error adding member:', err);
  //         this.snackBar.open('Failed to add member. Please try again.', 'Close', {
  //           duration: 3000,
  //           panelClass: 'error-snackbar'
  //         });
  //       }
  //     });
  //   }
  // }

  // removeMember(userId: number): void {
  //   this.groupService.removeGroupMember(this.groupId, userId).subscribe({
  //     next: () => {
  //       this.members = this.members.filter(member => member.userId !== userId);
  //       this.snackBar.open('Member removed successfully', 'Close', { duration: 2000 });
  //     },
  //     error: (err) => {
  //       console.error('Error removing member:', err);
  //       this.snackBar.open('Failed to remove member. Please try again.', 'Close', {
  //         duration: 3000,
  //         panelClass: 'error-snackbar'
  //       });
  //     }
  //   });
  // }

  createTask(): void {
    if (this.newTask.title.trim()) {
      this.groupService.createGroupTask(this.groupId, this.newTask).subscribe({
        next: (task) => {
          // Add new task to the task list
          this.tasks.push(task);
          // Reset task form
          this.newTask = {
            title: '',
            description: '',
            assignedToId: null,
            assignedToGroupId: this.groupId,
            dueDate: ''
          };
          this.snackBar.open('Task created successfully', 'Close', { duration: 2000 });
        },
        error: (err) => {
          console.error('Error creating task:', err);
          this.snackBar.open('Failed to create task. Please try again.', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  deleteTask(taskId: number): void {
    this.groupService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((task) => task.taskId !== taskId);
        this.snackBar.open('Task deleted successfully', 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        this.snackBar.open('Failed to delete task. Please try again.', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  uploadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.isUploading = true;

      this.groupService.uploadGroupFile(this.groupId, file).subscribe({
        next: (fileDto) => {
          this.files.push(fileDto);
          this.isUploading = false;
          this.snackBar.open('File uploaded successfully', 'Close', { duration: 2000 });
          input.value = ''; // Reset input
        },
        error: (err) => {
          console.error('Error uploading file:', err);
          this.isUploading = false;
          this.snackBar.open('Failed to upload file. Please try again.', 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  // private loadGroupMembers(): void {
  //   this.groupService.getGroupMembers(this.groupId).subscribe({
  //     next: (members) => {
  //       this.members = members as unknown as MemberDto[];
  //     },
  //     error: (err) => console.error('Error loading members:', err)
  //   });
  // }

  ngOnDestroy(): void {
    // Cleanup subscriptions
    this.cleanupCurrentGroup();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadGroupMembers(): void {
    this.groupService.getGroupMembers(this.groupId).subscribe({
      next: (members) => {
        this.members = members as unknown as MemberDto[];
      },
      error: (err) => console.error('Error loading members:', err)
    });
  }

  addMember(): void {
    if (this.newMemberId > 0) {
      this.groupService.addGroupMember(this.groupId, this.newMemberId).subscribe({
        next: () => {
          this.loadGroupMembers(); // Reload members after adding
          this.newMemberId = 0;
          this.snackBar.open('Member added successfully', 'Close', { duration: 2000 });
        },
        error: (err) => {
          console.error('Error adding member:', err);
          this.snackBar.open('Failed to add member. Please try again.', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  removeMember(userId: number): void {
    this.groupService.removeGroupMember(this.groupId, userId).subscribe({
      next: () => {
        this.loadGroupMembers(); // Reload members after removing
        this.snackBar.open('Member removed successfully', 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error removing member:', err);
        this.snackBar.open('Failed to remove member. Please try again.', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  onDeleteTask(taskId: number): void {
    this.tasks = this.tasks.filter((task) => task.taskId !== taskId);
  }

  onAttachmentClick(): void {
    // Implement file attachment logic (e.g., trigger file input or open dialog)
    console.log('Attachment clicked for group:', this.groupId);
    // You can add a file input or dialog here to handle file uploads
  }
}
