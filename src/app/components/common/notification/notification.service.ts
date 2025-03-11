import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/resources`;

  constructor(private readonly http: HttpClient, private readonly socket: Socket) { }

  getUserNotifications(userId: number): Observable<NotificationDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<NotificationDto[]>(`${this.apiUrl}/users/${userId}/notifications`, { headers });
  }

  getNewNotifications(userId: number): Observable<NotificationDto> {
    return this.socket.fromEvent<NotificationDto, string>(`/topic/notifications/${userId}`);
  }
}
