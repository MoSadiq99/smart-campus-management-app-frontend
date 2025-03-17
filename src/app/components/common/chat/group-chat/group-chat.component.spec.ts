/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupChatComponent } from './group-chat.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupService } from '../group.service';
import { NotificationService } from '../notification.service';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { of } from 'rxjs';

describe('GroupChatComponent', () => {
  let component: GroupChatComponent;
  let fixture: ComponentFixture<GroupChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('GroupChatComponent', () => {
    let component: GroupChatComponent;
    let fixture: ComponentFixture<GroupChatComponent>;
    let groupServiceMock: any;
    let notificationServiceMock: any;
    let authServiceMock: any;

    beforeEach(async () => {
      groupServiceMock = {
        getGroupById: jasmine.createSpy('getGroupById').and.returnValue(of({
          groupName: 'Test Group',
          messages: [],
          files: [],
          tasks: [],
          members: []
        })),
        getGroupMessages: jasmine.createSpy('getGroupMessages').and.returnValue(of([])),
        sendMessage: jasmine.createSpy('sendMessage').and.returnValue(of({})),
        createGroupTask: jasmine.createSpy('createGroupTask').and.returnValue(of({})),
        deleteTask: jasmine.createSpy('deleteTask').and.returnValue(of({})),
        uploadGroupFile: jasmine.createSpy('uploadGroupFile').and.returnValue(of({})),
        addGroupMember: jasmine.createSpy('addGroupMember').and.returnValue(of({})),
        removeGroupMember: jasmine.createSpy('removeGroupMember').and.returnValue(of({})),
        getGroupMembers: jasmine.createSpy('getGroupMembers').and.returnValue(of([]))
      };

      notificationServiceMock = {
        getNotifications: jasmine.createSpy('getNotifications').and.returnValue(of({ message: 'Test Notification' }))
      };

      authServiceMock = {
        getCurrentUserId: jasmine.createSpy('getCurrentUserId').and.returnValue(1),
        getRole: jasmine.createSpy('getRole').and.returnValue('ROLE_ADMIN')
      };

      await TestBed.configureTestingModule({
        imports: [
          MatSnackBarModule,
          MatCardModule,
          MatTabsModule,
          MatProgressSpinnerModule,
          GroupChatComponent
        ],
        providers: [
          { provide: GroupService, useValue: groupServiceMock },
          { provide: NotificationService, useValue: notificationServiceMock },
          { provide: AuthenticationService, useValue: authServiceMock }
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(GroupChatComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize group data on init', () => {
      component.groupId = 1;
      component.ngOnInit();
      expect(groupServiceMock.getGroupById).toHaveBeenCalledWith(1);
      expect(groupServiceMock.getGroupMessages).toHaveBeenCalledWith(1);
    });

    it('should send a message', () => {
      component.newMessage.content = 'Test Message';
      component.sendMessage();
      expect(groupServiceMock.sendMessage).toHaveBeenCalled();
    });

    it('should create a task', () => {
      component.newTask.title = 'Test Task';
      component.createTask();
      expect(groupServiceMock.createGroupTask).toHaveBeenCalled();
    });

    it('should delete a task', () => {
      component.deleteTask(1);
      expect(groupServiceMock.deleteTask).toHaveBeenCalledWith(1);
    });

    it('should upload a file', () => {
      const event = { target: { files: [new File([''], 'test.txt')] } } as unknown as Event;
      component.uploadFile(event);
      expect(groupServiceMock.uploadGroupFile).toHaveBeenCalled();
    });

    it('should add a member', () => {
      component.newMemberId = 2;
      component.addMember();
      expect(groupServiceMock.addGroupMember).toHaveBeenCalledWith(component.groupId, 2);
    });

    it('should remove a member', () => {
      component.removeMember(2);
      expect(groupServiceMock.removeGroupMember).toHaveBeenCalledWith(component.groupId, 2);
    });
  });
});
