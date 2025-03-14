import { Component, OnInit, OnDestroy } from '@angular/core';
import { GroupService, MessageDto, MessageCreateDto, TaskCreateDto, FileDto } from './group.service';
import { NotificationService, NotificationDto } from './notification.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ChatComponent } from './chat.component';
import { FilesComponent } from './files.component';
import { TasksComponent } from './tasks.component';
import { MembersComponent } from './members.component';
import { NotificationsComponent } from './notifications.component';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';

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
    NotificationsComponent
  ],
  template: `
    <mat-card class="chat-container">
      <mat-tab-group>
        <mat-tab label="Chat">
          <app-chat [messages]="messages" [newMessage]="newMessage" (sendMessageEvent)="sendMessage()"></app-chat>
        </mat-tab>
        <mat-tab label="Files">
          <app-files [files]="files" (uploadFileEvent)="uploadFile($event)"></app-files>
        </mat-tab>
        <mat-tab label="Tasks">
          <app-tasks [newTask]="newTask" [groupId]="groupId" (createTaskEvent)="createTask()"></app-tasks>
        </mat-tab>
        <mat-tab label="Members">
          <app-members [newMemberId]="newMemberId" (addMemberEvent)="addMember()"></app-members>
        </mat-tab>
      </mat-tab-group>
    </mat-card>
    <app-notifications [notifications]="notifications"></app-notifications>
  `,
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent implements OnInit, OnDestroy {
  groupId: number;
  messages: MessageDto[] = [];
  files: FileDto[] = [];
  newMessage: MessageCreateDto = { senderId: 1, groupId: 1, content: '' };
  newTask: TaskCreateDto = { title: '', description: '', assignedToId: null, assignedToGroupId: 0, dueDate: '' };
  newMemberId: number = 0;
  notifications: NotificationDto[] = [];
  private messageSubscription: Subscription;
  private notificationSubscription: Subscription;

  constructor(
    private readonly groupService: GroupService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private readonly authService: AuthenticationService,
    private snackBar: MatSnackBar
  ) {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    this.newMessage.groupId = this.groupId;
    this.newTask.assignedToGroupId = this.groupId; // Set groupId by default
  }

  ngOnInit(): void {
    this.loadGroupData();
    this.messageSubscription = this.groupService.getGroupMessages(this.groupId)
      .subscribe(message => this.messages.push(message));
    this.notificationSubscription = this.notificationService.getNotifications()
      .subscribe(notification => {
        this.notifications.push(notification);
        this.snackBar.open(notification.message, 'Close', { duration: 3000 });
      });
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
  }

  loadGroupData(): void {
    this.groupService.getGroupById(this.groupId).subscribe(group => {
      this.messages = group.messages || [];
      this.files = group.files || [];
    });
  }

  sendMessage(): void {
    if (this.newMessage.content.trim()) {
      this.newMessage.groupId = 1; // Set groupId for now
      this.newMessage.senderId = this.authService.getCurrentUserId();
      this.groupService.sendMessage(this.newMessage).subscribe({
        next: (message) => {
          console.log('Message received:', message);
          this.messages.push(message);
          this.newMessage.content = '';
        },
        error: (err) => console.error('Error sending message:', err)
      });
    }
  }

  addMember(): void {
    if (this.newMemberId > 0) {
      this.groupService.addGroupMember(this.groupId, this.newMemberId).subscribe({
        next: () => {
          this.newMemberId = 0;
          this.snackBar.open('Member added successfully', 'Close', { duration: 2000 });
        },
        error: (err) => console.error('Error adding member:', err)
      });
    }
  }

  createTask(): void {
    if (this.newTask.title.trim()) {
      this.groupService.createGroupTask(this.groupId, this.newTask).subscribe({
        next: () => {
          this.newTask = { title: '', description: '', assignedToId: null, assignedToGroupId: this.groupId, dueDate: '' };
          this.snackBar.open('Task created successfully', 'Close', { duration: 2000 });
        },
        error: (err) => console.error('Error creating task:', err)
      });
    }
  }

  uploadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.groupId = 1;
      this.groupService.uploadGroupFile(this.groupId, file).subscribe({
        next: (fileDto) => {
          this.files.push(fileDto);
          this.snackBar.open('File uploaded successfully', 'Close', { duration: 2000 });
          input.value = ''; // Reset input
        },
        error: (err) => {
          console.error('Error uploading file:', err);
          this.snackBar.open('Failed to upload file', 'Close', { duration: 5000 });
        }
      });
    }
  }
}
