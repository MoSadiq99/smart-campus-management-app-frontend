import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from '../auth/authentication.service';

export interface NotificationDto {
  id: number;
  userId: number;
  message: string;
  type: string;
  sentTime: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = environment.apiUrl;
  private stompClient: Client;
  private readonly notificationSubject = new Subject<NotificationDto>();

  constructor(private readonly http: HttpClient, private authService: AuthenticationService) {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    try {
      const socket = new SockJS('http://localhost:8080/ws');
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        connectHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      this.stompClient.onConnect = (frame) => {
        console.log('Notification WebSocket Connected:', frame);

        const userId = localStorage.getItem('userId');
        if (userId) {
          this.stompClient.subscribe(`/topic/users/${userId}/notifications`, (message) => {
            try {
              const notification = JSON.parse(message.body);
              this.notificationSubject.next(notification);
            } catch (error) {
              console.error('Error parsing notification:', error);
            }
          });
        }
      };

      this.stompClient.onStompError = (frame) => {
        console.error('Notification WebSocket Error:', frame.headers['message']);
      };

      this.stompClient.activate();
    } catch (error) {
      console.error('Error initializing notification WebSocket connection:', error);
    }
  }

  getNotifications(): Observable<NotificationDto> {
    return this.notificationSubject.asObservable();
  }

  getAllNotifications(): Observable<NotificationDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const userId = this.authService.getCurrentUserId();

    return this.http.get<NotificationDto[]>(
      `${this.apiUrl}/users/${userId}/notifications`,
      { headers }
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<void>(
      `${this.apiUrl}/notifications/${notificationId}/read`,
      {},
      { headers }
    );
  }
}
