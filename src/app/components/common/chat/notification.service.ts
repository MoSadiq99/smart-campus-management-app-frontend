import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

export interface NotificationDto {
  notificationId: number;
  userId: number;
  message: string;
  type: string;
  sentTime: string;
  status: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private stompClient: Client;
  private notificationSubject = new Subject<NotificationDto>();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      const username = localStorage.getItem('username'); // Assume stored during login
      this.stompClient.subscribe(`/user/${username}/topic/notifications`, (message) => {
        const notification: NotificationDto = JSON.parse(message.body);
        this.notificationSubject.next(notification);
      });
    };

    this.stompClient.activate();
  }

  getNotifications(): Observable<NotificationDto> {
    return this.notificationSubject.asObservable();
  }
}
