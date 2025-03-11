import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MessageCreateDto, MessageDto } from './group.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatListModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <mat-list class="message-list">
      <mat-list-item *ngFor="let message of messages">
        <span matListItemTitle>User {{ message.senderId }}:</span>
        <span matListItemLine>{{ message.content }} ({{ message.sentTime | date:'short' }})</span>
      </mat-list-item>
    </mat-list>
    <mat-divider></mat-divider>
    <form (ngSubmit)="sendMessage()" class="message-form">
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Type a message</mat-label>
        <input matInput [(ngModel)]="newMessage.content" name="content" required>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Send</button>
    </form>
  `,
  styles: [`
    .message-list { max-height: 400px; overflow-y: auto; }
    .message-form { display: flex; gap: 10px; margin-top: 10px; }
    .full-width { flex: 1; }
  `]
})
export class ChatComponent {
  @Input() messages: MessageDto[] = [];
  @Input() newMessage: MessageCreateDto = { senderId: 0, groupId: 0, content: '' };
  @Output() sendMessageEvent = new EventEmitter<void>();

  sendMessage(): void {
    this.sendMessageEvent.emit();
  }
}
