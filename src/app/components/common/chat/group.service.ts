import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';

// DTO Interfaces (same as provided, expanded with TaskDto and FileDto)
export interface GroupDto {
  groupId: number;
  groupName: string;
  creatorId: number;
  description: string;
  creationDate: string;
  memberIds: number[];
  messages: MessageDto[];
  // files?: FileDto[];  // Optional with '?'-Initially not present
}

export interface MessageDto {
  messageId: number;
  senderId: number;
  groupId: number;
  content: string;
  sentTime: string;
}

export interface GroupCreateDto {
  groupName: string;
  creatorId: number;
  description: string;
}

export interface MessageCreateDto {
  senderId: number;
  groupId: number;
  content: string;
}

export interface TaskCreateDto {
  title: string;
  description: string;
  assignedToId: number;
  dueDate: string;
}

export interface TaskDto {
  taskId: number;
  groupId: number;
  title: string;
  description: string;
  assignedToId: number;
  dueDate: string;
}

export interface FileDto {
  fileId: number;
  groupId: number;
  fileName: string;
  filePath: string;
  uploadTime: Date; // Replaced with DateTime-Initially a String
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly apiUrl = `${environment.apiUrl}/api`;
  private stompClient: Client;
  private readonly messageSubject = new Subject<MessageDto>();

  constructor(private readonly http: HttpClient) {
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
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker error: ' + frame.headers['message']);
    };

    this.stompClient.activate();
  }

  getAllGroups(): Observable<GroupDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<GroupDto[]>(`${this.apiUrl}/groups`, { headers });
  }

  createGroup(group: GroupCreateDto): Observable<GroupDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<GroupDto>(`${this.apiUrl}/groups`, group, { headers });
  }

  addGroupMember(groupId: number, userId: number): Observable<GroupDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<GroupDto>(`${this.apiUrl}/groups/${groupId}/members`, userId, { headers });
  }

  sendMessage(message: MessageCreateDto): Observable<MessageDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<MessageDto>(`${this.apiUrl}/groups/${message.groupId}/messages`, message, { headers });
  }

  getGroupMessages(groupId: number): Observable<MessageDto> {
    this.stompClient.subscribe(`/topic/groups/${groupId}/messages`, (message) => {
      const msg: MessageDto = JSON.parse(message.body);
      this.messageSubject.next(msg);
    });
    return this.messageSubject.asObservable();
  }

  createGroupTask(groupId: number, task: TaskCreateDto): Observable<TaskDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<TaskDto>(`${this.apiUrl}/groups/${groupId}/tasks`, task, { headers });
  }

  uploadGroupFile(groupId: number, file: File): Observable<FileDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FileDto>(`${this.apiUrl}/groups/${groupId}/files`, formData, { headers });
  }

  getGroupFiles(groupId: number): Observable<FileDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<FileDto[]>(`your-api-url/groups/${groupId}/files`, { headers });
  }
}
