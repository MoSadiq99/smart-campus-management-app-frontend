/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, filter, map } from 'rxjs/operators';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { UserService } from '../auth/user.service';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { UserDto } from 'src/app/models/dto/UserDto';

// DTO Interfaces remain the same...

// DTO Interfaces
export interface GroupDto {
  groupId: number;
  groupName: string;
  creatorId: number;
  description: string;
  creationDate: string;
  members: MemberDto[];
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
  senderName: string;
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

export interface MemberDto {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profileImage: string;
  roleName: string;
}

export interface GroupCreateDto {
  groupName: string;
  creatorId: number;
  description: string;
  courseId: number;
  initialMemberIds?: number[];
}

// Add Course and User interfaces
// interface Course {
//   id: number;
//   name: string;
// }


// interface User {
//   id: number;
//   username: string;
//   email: string;
// }

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly apiUrl = environment.apiUrl;
  private stompClient: Client;
  private readonly messageSubject = new Subject<MessageDto>();
  private readonly connected = new BehaviorSubject<boolean>(false);
  private readonly userCache = new Map<number, UserDto>();
  private activeSubscriptions = new Map<number, { id: string, subscription: any }>();

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

    const socket = new SockJS(`${this.apiUrl}/ws`);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => {
        if (environment.production === false) {
          console.log('STOMP Debug:', str);
        }
      }
    });

    this.stompClient.onConnect = (frame) => {
      console.log('WebSocket Connected');
      this.connected.next(true);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('WebSocket Error:', frame.headers['message']);
      this.connected.next(false);

      // Schedule reconnection after error
      setTimeout(() => this.reconnect(), 5000);
    };

    this.stompClient.onDisconnect = () => {
      console.log('WebSocket Disconnected');
      this.connected.next(false);
    };

    this.activateConnection();
  }

  private activateConnection(): void {
    try {
      this.stompClient.activate();
    } catch (error) {
      console.error('Error activating WebSocket connection:', error);
      setTimeout(() => this.reconnect(), 5000);
    }
  }

  private reconnect(): void {
    console.log('Attempting to reconnect WebSocket...');
    if (this.stompClient) {
      try {
        // Store active subscriptions to resubscribe after reconnection
        const currentSubscriptions = [...this.activeSubscriptions.entries()];

        // Deactivate current client
        this.stompClient.deactivate();

        // Initialize a new connection
        this.initializeWebSocketConnection();

        // Resubscribe to previous topics
        this.connected.subscribe(isConnected => {
          if (isConnected) {
            currentSubscriptions.forEach(([groupId, _]) => {
              this.subscribeToGroupMessages(groupId);
            });
          }
        });
      } catch (error) {
        console.error('Error during WebSocket reconnection:', error);
      }
    } else {
      this.initializeWebSocketConnection();
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Group management methods
  createGroup(group: GroupCreateDto): Observable<GroupDto> {
    console.log('Creating group:', group);
    return this.http.post<GroupDto>(`${this.apiUrl}/groups`, group, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error creating group:', error);
        throw error;
      })
    );
  }

  getAllGroups(): Observable<GroupDto[]> {
    return this.http.get<GroupDto[]>(`${this.apiUrl}/groups`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching groups:', error);
        return of([]);
      })
    );
  }

  getGroupById(groupId: number): Observable<GroupDto> {
    return this.http.get<GroupDto>(`${this.apiUrl}/groups/${groupId}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error(`Error fetching group ${groupId}:`, error);
        throw error;
      })
    );
  }

  // WebSocket message handling
  getGroupMessages(groupId: number): Observable<MessageDto> {
    // Subscribe to the specific group's messages
    this.subscribeToGroupMessages(groupId);

    // Return filtered message stream for this specific group
    return this.messageSubject.asObservable().pipe(
      filter(message => message.groupId === groupId)
    );
  }

  private subscribeToGroupMessages(groupId: number): void {
    // Check if we're already subscribed to this group
    if (this.activeSubscriptions.has(groupId)) {
      return;
    }

    // Wait for connection before subscribing
    this.connected.subscribe(isConnected => {
      if (isConnected && this.stompClient.connected && !this.activeSubscriptions.has(groupId)) {
        console.log(`Subscribing to messages for group ${groupId}`);

        const subscription = this.stompClient.subscribe(`/topic/groups/${groupId}/messages`, (message) => {
          try {
            const messageData = JSON.parse(message.body) as MessageDto;

            // Enrich message with sender info when possible
            this.getUserInfo(messageData.senderId).subscribe(user => {
              if (user) {
                messageData.senderName = `${user.firstName} ${user.lastName}`;
              } else {
                messageData.senderName = `User ${messageData.senderId}`;
              }
              this.messageSubject.next(messageData);
            });
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });

        // Store subscription reference
        this.activeSubscriptions.set(groupId, {
          id: subscription.id,
          subscription: subscription
        });
      }
    });
  }

  unsubscribeFromGroupMessages(groupId: number): void {
    const subscription = this.activeSubscriptions.get(groupId);
    if (subscription && this.stompClient.connected) {
      try {
        subscription.subscription.unsubscribe();
        this.activeSubscriptions.delete(groupId);
        console.log(`Unsubscribed from group ${groupId} messages`);
      } catch (error) {
        console.error(`Error unsubscribing from group ${groupId}:`, error);
      }
    }
  }

  // Message sending
  sendMessage(message: MessageCreateDto): Observable<MessageDto> {
    return this.http.post<MessageDto>(
      `${this.apiUrl}/groups/${message.groupId}/messages`,
      message,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error sending message:', error);
        throw error;
      })
    );
  }

  //! Task management
  createGroupTask(groupId: number, task: TaskCreateDto): Observable<TaskDto> {
    return this.http.post<TaskDto>(
      `${this.apiUrl}/groups/${groupId}/tasks`,
      task,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error creating task:', error);
        throw error;
      })
    );
  }

  getGroupTasks(groupId: number): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(
      `${this.apiUrl}/groups/${groupId}/tasks`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching tasks:', error);
        return of([]);
      })
    );
  }

  deleteTask(taskId: number): Observable<void> {
    console.log('Deleting task:', taskId);
    return this.http.delete<void>(
      `${this.apiUrl}/groups/tasks/${taskId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error(`Error deleting task ${taskId}:`, error);
        throw error;
      })
    );
  }

  //! File management
  uploadGroupFile(groupId: number, file: File): Observable<FileDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploaderId', this.authService.getCurrentUserId().toString());

    return this.http.post<FileDto>(
      `${this.apiUrl}/groups/${groupId}/files`,
      formData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error uploading file:', error);
        throw error;
      })
    );
  }

  getGroupFiles(groupId: number): Observable<FileDto[]> {
    return this.http.get<FileDto[]>(
      `${this.apiUrl}/groups/${groupId}/files`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching files:', error);
        return of([]);
      })
    );
  }

  // Member management
  addGroupMember(groupId: number, userId: number): Observable<GroupDto> {
    return this.http.post<GroupDto>(
      `${this.apiUrl}/groups/${groupId}/members`,
      userId,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error(`Error adding member ${userId} to group ${groupId}:`, error);
        throw error;
      })
    );
  }

  removeGroupMember(groupId: number, userId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/groups/${groupId}/members/${userId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error(`Error removing member ${userId} from group ${groupId}:`, error);
        throw error;
      })
    );
  }

  getGroupMembers(groupId: number): Observable<MemberDto[]> {
    return this.http.get<MemberDto[]>(
      `${this.apiUrl}/groups/${groupId}/members`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching members:', error);
        return of([]);
      })
    );
  }

  // User info caching
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
