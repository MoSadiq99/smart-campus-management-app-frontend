/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// group-view.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GroupService, GroupDto, MemberDto } from '../../../../services/group/group.service';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateGroupComponent } from 'src/app/components/admin/create-group/create-group.component';
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-group-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatListModule, MatTabsModule, MatProgressSpinnerModule, GroupChatComponent],
  template: `
    <mat-card class="group-container">
      <div class="header">
        <h2>Collaboration</h2>
        <p>Work together with your peers and instructor on projects and activities.</p>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading your groups...</p>
      </div>

      <mat-tab-group
        *ngIf="!isLoading"
        [(selectedIndex)]="selectedTabIndex"
        (selectedTabChange)="onTabChange($event)"
        animationDuration="300ms"
      >
        <mat-tab label="Groups">
          <div class="groups-section">
            <div class="section-header">
              <h3>Your Groups</h3>
              <button mat-raised-button color="primary" *ngIf="isAdminOrLecturer" (click)="openCreateGroupDialog()">+ Create Group</button>
            </div>

            <div *ngIf="groups.length === 0" class="no-groups-message">
              <p>You are not a member of any groups yet.</p>
              <button *ngIf="isAdminOrLecturer" mat-stroked-button color="primary" (click)="openCreateGroupDialog()">
                Create your first group
              </button>
            </div>

            <mat-list *ngIf="groups.length > 0">
              <mat-list-item
                *ngFor="let group of groups"
                (click)="selectGroup(group.groupId)"
                [class.active]="selectedGroup?.groupId === group.groupId"
              >
                <div class="group-item">
                  <div class="group-icon" [style.background-color]="getGroupColor(group.groupName)">
                    {{ group.groupName[0] | uppercase }}
                  </div>
                  <div class="group-info">
                    <h4>{{ group.groupName }}</h4>
                    <p>{{ group.members?.length || 0 }} members</p>
                  </div>
                  <div class="group-meta">
                    <span>{{ group.lastActivity || 'No recent activity' }}</span>
                    <span class="notification-badge" *ngIf="group.unreadCount && group.unreadCount > 0">
                      {{ group.unreadCount }}
                    </span>
                  </div>
                </div>
              </mat-list-item>
            </mat-list>

            <div *ngIf="selectedGroup" class="members-section">
              <h3>Group Members</h3>
              <mat-list>
                <mat-list-item *ngFor="let member of selectedGroup.members">
                  <div class="member-item">
                    <div class="member-avatar">{{ getMemberInitials(member) }}</div>
                    <div class="member-info">
                      {{ member.firstName }} {{ member.lastName }}
                      <span *ngIf="member.roleName === 'Team Lead'" class="team-lead-badge">Team Lead</span>
                    </div>
                  </div>
                </mat-list-item>
              </mat-list>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Chat" [disabled]="!selectedGroupId">
          <ng-container *ngIf="selectedGroupId">
            <app-group-chat [groupId]="selectedGroupId" [selectedTabIndex]="0"></app-group-chat>
          </ng-container>
        </mat-tab>

        <!-- <mat-tab label="Files" [disabled]="!selectedGroupId">
          <ng-container *ngIf="selectedGroupId">
            <app-group-chat [groupId]="selectedGroupId" [selectedTabIndex]="1"></app-group-chat>
          </ng-container>
        </mat-tab>

        <mat-tab label="Tasks" [disabled]="!selectedGroupId">
          <ng-container *ngIf="selectedGroupId">
            <app-group-chat [groupId]="selectedGroupId" [selectedTabIndex]="2"></app-group-chat>
          </ng-container>
        </mat-tab> -->
      </mat-tab-group>
    </mat-card>

    <ng-template #noGroupSelected>
      <div class="no-group-message">
        <p>Please select a group from the "Groups" tab to view content.</p>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .group-container {
        margin: 20px;
        padding: 20px;
        min-height: 600px;
      }

      .header {
        margin-bottom: 20px;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 10px;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
      }

      .loading-container p {
        margin-top: 20px;
        color: #666;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 10px 0;
      }

      .groups-section {
        padding: 20px;
      }

      .group-item {
        display: flex;
        align-items: center;
        width: 100%;
        cursor: pointer;
        padding: 10px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }

      .group-item:hover {
        background-color: #f5f5f5;
      }

      .group-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #1976d2;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        font-weight: bold;
      }

      .group-info {
        flex: 1;
      }

      .group-info h4 {
        margin: 0;
        font-size: 16px;
      }

      .group-info p {
        margin: 5px 0 0;
        font-size: 14px;
        color: #666;
      }

      .group-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: 12px;
        color: #666;
      }

      .notification-badge {
        background-color: #1976d2;
        color: white;
        border-radius: 50%;
        padding: 2px 6px;
        margin-top: 5px;
        font-size: 10px;
      }

      .members-section {
        margin-top: 20px;
        padding: 20px;
        border-top: 1px solid #e0e0e0;
      }

      .member-item {
        display: flex;
        align-items: center;
        width: 100%;
      }

      .member-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #9e9e9e;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        font-size: 12px;
      }

      .member-info {
        flex: 1;
      }

      .team-lead-badge {
        background-color: #e0e0e0;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 10px;
        font-size: 12px;
      }

      .active {
        background-color: #e3f2fd;
      }

      .no-group-message {
        padding: 40px 20px;
        text-align: center;
        color: #666;
      }

      .no-groups-message {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }

      .no-groups-message button {
        margin-top: 20px;
      }
    `
  ]
})
export class GroupViewComponent implements OnInit, OnDestroy {
  groups: (GroupDto & { lastActivity?: string; unreadCount?: number })[] = [];
  selectedGroup: GroupDto | null = null;
  selectedGroupId: number | null = null;
  selectedTabIndex: number = 0; // Start with "Groups" tab
  isAdminOrLecturer = false;
  isLoading = true;
  currentUserId = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private groupService: GroupService,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.checkUserRole();
    this.loadGroups();
  }

  loadGroups(): void {
    this.isLoading = true;

    const subscription = this.groupService.getAllGroups().subscribe({
      next: (groups) => {
        // Filter groups based on user role
        this.groups = groups
          .filter((group) => {
            // Admins and lecturers can see all groups
            if (this.isAdminOrLecturer) return true;
            // Others can only see groups they're members of
            return group.members?.some((member) => member.userId === this.currentUserId) || false;
          })
          .map((group) => ({
            ...group,
            lastActivity: this.calculateLastActivity(group),
            unreadCount: this.calculateUnreadCount(group)
          }));

        // Apply mock data for UI demonstration
        this.applyMockActivityData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading groups:', err);
        this.snackBar.open('Failed to load groups. Please try again.', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
        this.isLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  private applyMockActivityData(): void {
    // Mock data for last activity and unread count (replace with real data from backend)
    this.groups.forEach((group) => {
      // Just apply dummy data based on group name for demonstration
      if (group.groupName.includes('Project')) {
        group.lastActivity = '10 min ago';
        group.unreadCount = 3;
      } else if (group.groupName.includes('Council')) {
        group.lastActivity = '2 hours ago';
      } else if (group.groupName.includes('Research')) {
        group.lastActivity = 'Yesterday';
        group.unreadCount = 7;
      } else if (group.groupName.includes('Sustainability')) {
        group.lastActivity = '3 days ago';
        group.unreadCount = 1;
      } else {
        group.lastActivity = 'Recently';
      }
    });
  }

  checkUserRole(): void {
    const userRole = this.authService.getRole();
    this.isAdminOrLecturer = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_LECTURER';
  }

  selectGroup(groupId: number): void {
    this.groupService.getGroupById(groupId).subscribe({
      next: (group) => {
        this.selectedGroup = group;
        this.selectedGroupId = groupId;

        // Clear unread count when selecting a group
        const groupInList = this.groups.find((g) => g.groupId === groupId);
        if (groupInList) {
          groupInList.unreadCount = 0;
        }

        // Switch to "Chat" tab after selecting a group if we're on the Groups tab
        if (this.selectedTabIndex === 0) {
          this.selectedTabIndex = 1; // Chat tab
        }
      },
      error: (err) => {
        console.error(`Error loading group ${groupId}:`, err);
        this.snackBar.open('Failed to load group details. Please try again.', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  calculateLastActivity(group: GroupDto): string {
    if (!group.messages || group.messages.length === 0) {
      return 'No activity';
    }

    // Sort messages by time and get the most recent
    const latestMessage = [...group.messages].sort((a, b) => new Date(b.sentTime).getTime() - new Date(a.sentTime).getTime())[0];

    if (!latestMessage) return 'No activity';

    // Format the time difference
    const messageDate = new Date(latestMessage.sentTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return messageDate.toLocaleDateString();
  }

  calculateUnreadCount(group: GroupDto): number {
    // This would typically be provided by the backend
    // For now, return a random number for demonstration
    return Math.floor(Math.random() * 10) > 7 ? Math.floor(Math.random() * 8) + 1 : 0;
  }

  getGroupColor(groupName: string): string {
    // Generate a consistent color based on the group name
    const colors = ['#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#e64a19', '#0288d1', '#00796b', '#fbc02d'];
    const charCodeSum = groupName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  }

  openCreateGroupDialog(): void {
    const dialogRef = this.dialog.open(CreateGroupComponent, {
      width: '600px',
      data: {} // You can pass data here if needed
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadGroups(); // Refresh the group list after creation
      }
    });
  }

  onTabChange(event: any): void {
    if (this.selectedTabIndex !== 0 && !this.selectedGroupId) {
      // If no group is selected and user tries to access other tabs, redirect to "Groups" tab
      this.selectedTabIndex = 0;
    }
  }

  // Add the getMemberInitials method
  getMemberInitials(member: MemberDto): string {
    const firstInitial = member.firstName ? member.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = member.lastName ? member.lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }
}
