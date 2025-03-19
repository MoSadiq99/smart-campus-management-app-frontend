import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MessageCreateDto, MessageDto } from '../../../../services/group/group.service';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="chat-wrapper">
      <div class="message-list" #messageContainer>
        <mat-list>
          <div *ngFor="let message of messages" class="message-item"
              [ngClass]="{'own-message': message.senderId === currentUserId}">
            <mat-list-item>
              <span matListItemTitle>
                <strong>{{ message.senderName }}</strong>
                <span class="message-time">{{ message.sentTime | date:'short' }}</span>
              </span>
              <span matListItemLine class="message-content">{{ message.content }}</span>
            </mat-list-item>
          </div>
        </mat-list>
      </div>

      <mat-divider></mat-divider>

      <form (ngSubmit)="sendMessage()" class="message-form">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Type here..</mat-label>
          <input matInput [(ngModel)]="newMessage.content" name="content" required
                 placeholder="What's on your mind?" #messageInput>
          <button mat-icon-button matSuffix type="button" matTooltip="Add file"
                  (click)="onAttachmentClick()">
            <mat-icon>attach_file</mat-icon>
          </button>
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit"
                [disabled]="!newMessage.content.trim()">
          <mat-icon>send</mat-icon>
        </button>
      </form>
    </div>
  `,
  styles: [`
    .chat-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px;
    }

    .message-list {
      flex: 1;
      overflow-y: auto;
      max-height: 400px;
      margin-bottom: 16px;
    }

    .message-item {
      margin-bottom: 8px;
      border-radius: 8px;
      background-color: #f5f5f5;
      padding: 4px;
    }

    .own-message {
      background-color: #e3f2fd;
      margin-left: 20%;
    }

    .message-content {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .message-time {
      font-size: 12px;
      color: #757575;
      margin-left: 8px;
    }

    .message-form {
      display: flex;
      gap: 16px;
      align-items: center;
      padding-top: 8px;
    }

    .full-width {
      flex: 1;
    }
  `]
})
export class ChatComponent implements OnInit {
  @Input() messages: MessageDto[] = [];
  @Input() newMessage: MessageCreateDto = { senderId: 0, groupId: 0, content: '' };
  @Input() currentUserId: number = 0;
  @Output() sendMessageEvent = new EventEmitter<void>();
  @Output() attachFileEvent = new EventEmitter<void>();

  constructor(private readonly authService: AuthenticationService) {}

  ngOnInit(): void {
    if (!this.currentUserId) {
      this.currentUserId = this.authService.getCurrentUserId();
    }
  }

  sendMessage(): void {
    console.log('Sending message:', this.newMessage);

    if (this.newMessage.content.trim()) {
      this.sendMessageEvent.emit();
    }
  }

  onAttachmentClick(): void {
    this.attachFileEvent.emit();
  }
}
