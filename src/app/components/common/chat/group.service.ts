import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { catchError,  tap } from 'rxjs/operators';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { UserService } from '../../../services/auth/user.service';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';

// DTO Interfaces
export interface GroupDto {
  groupId: number;
  groupName: string;
  creatorId: number;
  description: string;
  creationDate: string;
  memberIds: number[];
  messages: MessageDto[];
  files?: FileDto[];
  tasks?: TaskDto[];
}

export interface MessageDto {
  messageId: number;
  senderId: number;
  groupId: number;
  content: string;
  sentTime: string;
  senderName?: string;
}

export interface MessageCreateDto {
  senderId: number;
  groupId: number;
  content: string;
}

export interface TaskCreateDto {
  title: string;
  description: string;
  dueDate: Date | string;
  assignedToId?: number | null; // Needed: If assign to a single member
  assignedToGroupId: number;   // Always required: Group context
}

export interface TaskDto {
  taskId?: number;
  groupId: number;
  title: string;
  description: string;
  assignedToId?: number | null; // Optional: Null means assigned to all members
  dueDate: string;
  status?: string;
}

export interface FileDto {
  fileId: number;
  groupId: number;
  fileName: string;
  filePath: string;
  uploadTime: Date | string;
  uploaderId: number;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: { roleName: string };
}


export interface GroupDto {
  groupId: number;
  groupName: string;
  creatorId: number;
  description: string;
  creationDate: string;
  memberIds: number[];
  messages: MessageDto[];
  files?: FileDto[];
  tasks?: TaskDto[];
}

export interface GroupCreateDto {
  groupName: string;
  creatorId: number;
  description: string;
  courseId: number;
  initialMemberIds?: number[];
}

export interface MessageDto {
  messageId: number;
  senderId: number;
  groupId: number;
  content: string;
  sentTime: string;
  senderName?: string;
}

// Add Course and User interfaces
interface Course {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly apiUrl = environment.apiUrl;
  private stompClient: Client;
  private readonly messageSubject = new Subject<MessageDto>();
  private connected = new BehaviorSubject<boolean>(false);
  private userCache = new Map<number, UserDto>();

  constructor(
    private readonly http: HttpClient,
    private readonly userService: UserService,
    private readonly authService: AuthenticationService
  ) {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: { Authorization: `Bearer ${token}` }
    });

    this.stompClient.onConnect = (frame) => {
      console.log('WebSocket Connected:', frame);
      this.connected.next(true);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('WebSocket Error:', frame.headers['message']);
      this.connected.next(false);
    };

    this.stompClient.activate();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  createGroup(group: GroupCreateDto): Observable<GroupDto> {
    return this.http.post<GroupDto>(`${this.apiUrl}/groups`, group, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error creating group:', error);
        throw error;
      })
    );
  }

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching courses:', error);
        return of([]);
      })
    );
  }

  getUsersByCourse(courseId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/courses/${courseId}/users`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error(`Error fetching users for course ${courseId}:`, error);
        return of([]);
      })
    );
  }

  getAllGroups(): Observable<GroupDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<GroupDto[]>(`${this.apiUrl}groups`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching groups:', error);
        return of([]);
      })
    );
  }

  getGroupById(groupId: number): Observable<GroupDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<GroupDto>(`${this.apiUrl}/groups/${groupId}`, { headers }).pipe(
      catchError(error => {
        console.error(`Error fetching group ${groupId}:`, error);
        throw error;
      })
    );
  }

  addGroupMember(groupId: number, userId: number): Observable<GroupDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<GroupDto>(`${this.apiUrl}/groups/${groupId}/members`, userId, { headers }).pipe(
      catchError(error => {
        console.error(`Error adding member ${userId} to group ${groupId}:`, error);
        throw error;
      })
    );
  }

  sendMessage(message: MessageCreateDto): Observable<MessageDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<MessageDto>(
      `${this.apiUrl}/groups/${message.groupId}/messages`,
      message,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error sending message:', error);
        throw error;
      })
    );
  }

  getGroupMessages(groupId: number): Observable<MessageDto> {
    this.connected.subscribe(isConnected => {
      if (isConnected && this.stompClient.connected) {
        console.log(`Subscribing to messages for group ${groupId}`);
        this.stompClient.subscribe(`/topic/groups/${groupId}/messages`, (message) => {
          try {
            const messageData = JSON.parse(message.body);
            this.getUserInfo(messageData.senderId).subscribe(user => {
              messageData.senderName = user?.name || `User ${messageData.senderId}`;
              this.messageSubject.next(messageData);
            });
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
      }
    });
    return this.messageSubject.asObservable();
  }

  createGroupTask(groupId: number, task: TaskCreateDto): Observable<TaskDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const testGroupId = 1;
    task.assignedToGroupId = testGroupId;

    console.log('Creating task:', task);
    console.log('Group ID:', groupId);
    return this.http.post<TaskDto>(`${this.apiUrl}/groups/${testGroupId}/tasks`, task, { headers }).pipe(
      catchError(error => {
        console.error('Error creating task:', error);
        throw error;
      })
    );
  }

  getGroupTasks(groupId: number): Observable<TaskDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<TaskDto[]>(`${this.apiUrl}/groups/${groupId}/tasks`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching tasks:', error);
        return of([]);
      })
    );
  }

  deleteTask(taskId: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`, { headers }).pipe(
      catchError(error => {
        console.error(`Error deleting task ${taskId}:`, error);
        throw error;
      })
    );
  }

  uploadGroupFile(groupId: number, file: File): Observable<FileDto> {
    const headers = this.getHeaders();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploaderId', this.authService.getCurrentUserId().toString());
    console.log('Uploading file:', file);
    console.log('Uploader ID:', this.authService.getCurrentUserId());


    return this.http.post<FileDto>(
      `${this.apiUrl}/groups/${groupId}/files`,
      formData,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error uploading file:', error);
        throw error;
      })
    );
  }

  getGroupFiles(groupId: number): Observable<FileDto[]> {
    const headers = this.getHeaders();
    return this.http.get<FileDto[]>(`${this.apiUrl}/groups/${groupId}/files`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching files:', error);
        throw error;
      })
    );
  }

  getGroupMembers(groupId: number): Observable<UserDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<UserDto[]>(`${this.apiUrl}/groups/${groupId}/members`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching members:', error);
        return of([]);
      })
    );
  }

  getUserInfo(userId: number): Observable<UserDto | null> {
    if (this.userCache.has(userId)) {
      return of(this.userCache.get(userId) || null);
    }
    return this.userService.getUserById(userId).pipe(
      tap(user => user && this.userCache.set(userId, user)),
      catchError(error => {
        console.error(`Error fetching user ${userId}:`, error);
        return of(null);
      })
    );
  }
}
