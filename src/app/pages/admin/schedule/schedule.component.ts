// resource-calendar.component.ts (optimized version)
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import {
  DayPilot,
  DayPilotCalendarComponent,
  DayPilotModule,
  DayPilotMonthComponent,
  DayPilotNavigatorComponent
} from '@daypilot/daypilot-lite-angular';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
// import { ReservationCreateDto } from 'src/app/models/dto/ReservationCreateDto';
import { FormsModule } from '@angular/forms';
import { ScheduleService } from 'src/app/services/schedule/schedule.service';
import { LectureCreateDto } from 'src/app/models/dto/LectureCreateDto';
import { CourseDto } from 'src/app/models/course-dto';
import { CourseService } from 'src/app/services/course.service';
import { SubjectDto } from 'src/app/models/subject-dto';
import { SubjectService } from 'src/app/services/subject.service';
import { LectureDto } from 'src/app/models/dto/LectureDto';
import { ResourceService } from 'src/app/components/admin/resource/resource.service';
import { ResourceDto } from 'src/app/models/dto/ResourceDto';
import { ReservationDto } from 'src/app/models/dto/ReservationDto';

interface AreaData {
  top: number;
  right: number;
  width: number;
  height: number;
  action: 'None' | 'ContextMenu' | 'Default' | 'ResizeEnd' | 'ResizeStart' | 'Move';
  padding: number;
  symbol: string;
  cssClass: string;
  toolTip: string;
  visibility: 'Hover' | 'Visible';
}

interface RecurrencePattern {
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  interval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

export interface ExtendedEventData extends DayPilot.EventData {
  resource: string; // Will store resourceId as string for filtering, resolved to name in rendering
  recurrence?: RecurrencePattern;
  toolTip?: string;
  lectureId?: number; // Optional: Keep backend resourceId for reference
  status?: string; // Optional: If you want to display status
}

interface EventRenderArgs {
  data: ExtendedEventData & {
    areas?: AreaData[];
    barColor?: string;
    backColor?: string;
  };
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [DayPilotModule, CommonModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements AfterViewInit {
  @ViewChild('day') day!: DayPilotCalendarComponent;
  @ViewChild('week') week!: DayPilotCalendarComponent;
  @ViewChild('month') month!: DayPilotMonthComponent;
  @ViewChild('navigator') nav!: DayPilotNavigatorComponent;

  lectures: LectureDto[] = [];
  lectureEvents: DayPilot.EventData[] = [];
  resources: ResourceDto[] = [];
  date = DayPilot.Date.today();
  courses: CourseDto[] = [];
  subjects: SubjectDto[] = [];
  reservationEvents: ExtendedEventData[] = [];
  activeView: 'day' | 'week' | 'month' = 'week';
  selectedCourse!: CourseDto;
  dayNames = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
  ];

  contextMenu = new DayPilot.Menu({
    items: [
      { text: 'Edit...', onClick: (args) => this.editEvent(args.source) },
      { text: 'Delete', onClick: (args) => this.deleteEvent(args.source) }
    ]
  });

  configNavigator: DayPilot.NavigatorConfig = {
    showMonths: 3,
    cellWidth: 25,
    cellHeight: 25,
    selectMode: 'Week',
    onVisibleRangeChanged: () => this.loadLecturesAndEvents()
  };

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly courseService: CourseService,
    private readonly subjectService: SubjectService,
    private readonly resourceService: ResourceService
  ) { }

  ngAfterViewInit(): void {
    this.loadLecturesAndEvents();
    this.loadCoursesAndSubjects();
  }

  loadLecturesAndEvents(): void {
    const from = this.nav.control.visibleStart();
    const to = this.nav.control.visibleEnd();

    forkJoin([this.scheduleService.getLectures(), this.scheduleService.getEvents(from, to)]).subscribe({
      next: ([lectures, events]) => {
        this.lectures = lectures;
        console.log('Raw events from backend:', events);

        // Map backend ReservationDto to ExtendedEventData
        this.lectureEvents = events.map((event) => {
          const lecture = this.lectures.find((lec) => lec.id === event.lectureId);
          return this.mapToEventData(event, lecture);
        });

        console.log('Mapped and filtered events:', this.lectureEvents);
        this.updateCalendars();
      },
      error: (error) => {
        console.error('Error fetching lectures and events:', error);
      }
    });
  }

  mapToEventData(event: ReservationDto, lecture?: LectureDto) {
    return {
      id: event.reservationId.toString(), // Convert Long to string for DayPilot
      start: event.startTime,
      end: event.endTime,
      text: event.title,
      lectureId: event?.lectureId, // Keep for reference
      status: event.status,
      barColor: '#6fa8dc', // Default color
      tags: {
        description: lecture?.description,
        recurrencePattern: lecture?.recurrencePattern,
        courseId: lecture?.courseId,
        lecturerId: lecture?.lecturerId,
        subjectId: lecture?.subjectId,
        resource: lecture?.resource
      }
    };
  }

  loadCoursesAndSubjects(): void {
    this.courseService.getCourses().subscribe((courses) => {
      this.courses = courses;
    });

    this.subjectService.getSubjects().subscribe((subjects) => {
      this.subjects = subjects;
    });

    this.resourceService.getAllResources().subscribe((resources) => {
      this.resources = resources;
    });
  }

  updateCalendars(): void {
    setTimeout(() => {
      const activeCalendar = this.getActiveCalendar();
      if (activeCalendar) {
        activeCalendar.update({ events: this.lectureEvents });
        console.log('Calendar updated with events:', this.lectureEvents);
      }
    }, 0);
  }

  viewDay(): void {
    this.activeView = 'day';
    this.configNavigator.selectMode = 'Day';
    this.configDay.startDate = this.date; // Ensure date sync
    this.updateCalendars();
  }

  viewWeek(): void {
    this.activeView = 'week';
    this.configNavigator.selectMode = 'Week';
    this.configWeek.startDate = this.date; // Ensure date sync
    this.updateCalendars();
  }

  viewMonth(): void {
    this.activeView = 'month';
    this.configNavigator.selectMode = 'Month';
    this.configMonth.startDate = this.date; // Ensure date sync
    this.updateCalendars();
  }

  // Ensure calendar configs are properly initialized
  configDay: DayPilot.CalendarConfig = {
    startDate: DayPilot.Date.today(),
    viewType: 'Day',
    durationBarVisible: true,
    businessBeginsHour: 9,
    businessEndsHour: 17,
    // cellHeight: 50,
    contextMenu: this.contextMenu,
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onBeforeEventRender: this.onBeforeEventRender.bind(this),
    timeFormat: 'Clock12Hours',
    showToolTip: true,
    // allowEventOverlap: false,
    timeRangeSelectedHandling: 'Enabled'
  };

  configWeek: DayPilot.CalendarConfig = {
    startDate: DayPilot.Date.today(),
    viewType: 'Week',
    durationBarVisible: true,
    contextMenu: this.contextMenu,
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onBeforeEventRender: this.onBeforeEventRender.bind(this),
    timeFormat: 'Clock12Hours',
    showToolTip: true,
    // allowEventOverlap: false,
    timeRangeSelectedHandling: 'Enabled'
  };

  configMonth: DayPilot.MonthConfig = {
    startDate: DayPilot.Date.today(),
    contextMenu: this.contextMenu,
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onBeforeEventRender: this.onBeforeEventRender.bind(this),
    timeRangeSelectedHandling: 'Enabled'
  };

  changeDate(date: DayPilot.Date): void {
    this.date = date;
    this.configDay.startDate = date;
    this.configWeek.startDate = date;
    this.configMonth.startDate = date;
    this.loadLecturesAndEvents();
  }
  async onTimeRangeSelected(args: DayPilot.CalendarTimeRangeSelectedArgs): Promise<void> {
    console.log('Time range selected:', args.start, args.end, args.resource);
    const dp = args.control;

    try {
      dp.clearSelection();

      const startStr = args.start.toString('yyyy-MM-ddTHH:mm:ss');
      const endStr = args.end.toString('yyyy-MM-ddTHH:mm:ss');

      const basicForm = await DayPilot.Modal.form(
        [
          { name: 'Title', id: 'title' },
          {
            name: 'Description',
            id: 'description',
            type: 'textarea'
          },
          {
            name: 'Start Time',
            id: 'start',
            type: 'datetime',
            dateFormat: 'yyyy-MM-dd'
          },
          {
            name: 'End Time',
            id: 'end',
            type: 'datetime',
            dateFormat: 'yyyy-MM-dd'
          },
          {
            name: 'Recurrence',
            id: 'recurrenceType',
            type: 'select',
            options: [
              { id: 'oneTime', name: 'One-Time Lecture' },
              { id: 'recurring', name: 'Recurring Lecture' }
            ]
          },
          {
            name: 'Course',
            id: 'course',
            type: 'select',
            options: this.courses.map((course) => ({ id: course.courseId, name: course.courseName }))
          },
          {
            name: 'Resource',
            id: 'resource',
            type: 'select',
            options: this.resources.map((resource) => ({ id: resource.resourceId, name: resource.resourceName }))
          }
        ],
        {
          title: 'New Lecture',
          start: startStr,
          end: endStr,
          recurrenceType: 'oneTime'
        }
      );

      if (basicForm.canceled) {
        console.log('Form cancelled');
        return;
      }

      let formResult = basicForm.result;

      const subjectForm = await DayPilot.Modal.form([
        {
          name: 'Subject',
          id: 'subject',
          type: 'select',
          options: this.subjects
            .filter((subject) => subject.subjectId === formResult.course)
            .map((subject) => ({ id: subject.subjectId, name: subject.subjectName }))
        }
      ]);

      if (subjectForm.canceled) {
        console.log('Subject selection form cancelled');
        return;
      }

      console.log('Resource: ', formResult.resource);

      formResult = { ...formResult, ...subjectForm.result };

      if (basicForm.result.recurrenceType === 'recurring') {
        const recurringForm = await DayPilot.Modal.form(
          [
            {
              name: 'Frequency',
              id: 'frequency',
              type: 'select',
              options: [
                { id: 'Daily', name: 'Daily' },
                { id: 'Weekly', name: 'Weekly' },
                { id: 'Monthly', name: 'Monthly' }
              ]
            },
            { name: 'Interval', id: 'interval', type: 'number' },
            {
              name: 'Days of Week',
              id: 'daysOfWeek',
              type: 'table',
              columns: [
                {
                  name: 'Day',
                  id: 'days',
                  options: this.dayNames.map((day) => ({ id: day.id, name: day.name }))
                }
              ]
            },
            {
              name: 'Recurrence End',
              id: 'recurrenceEnd',
              type: 'datetime',
              dateFormat: 'yyyy-MM-dd'
            }
          ],
          {
            frequency: 'Daily',
            interval: 1,
            daysOfWeek: [formResult.start.getDayOfWeek()],
            recurrenceEnd: args.start.addMonths(1).toString('yyyy-MM-ddTHH:mm:ss')
          }
        );

        if (recurringForm.canceled) {
          console.log('Recurring form cancelled');
          return;
        }

        formResult = { ...basicForm.result, ...subjectForm.result, ...recurringForm.result };
      }

      console.log(formResult);

      const formatDateTime = (dateStr: string): string => {
        const dpDate = new DayPilot.Date(dateStr);
        return dpDate.toString('yyyy-MM-ddTHH:mm:ss');
      };

      const lecture: LectureCreateDto = {
        title: formResult.title,
        lecturerId: 1, // TODO: Implement Select Lecturer
        description: formResult.description,
        resource: formResult.resource,
        startTime: formResult.start.toString('yyyy-MM-ddTHH:mm:ss'),
        endTime: formResult.end.toString('yyyy-MM-ddTHH:mm:ss'),
        recurrencePattern:
          formResult.recurrenceType === 'recurring'
            ? {
              frequency: formResult.frequency,
              recurrenceInterval: formResult.interval,
              endDate: formatDateTime(formResult.recurrenceEnd),
              daysOfWeek: formResult.frequency === 'Weekly' ? formResult.daysOfWeek.map((d) => d.days) : undefined
            }
            : undefined,
        courseId: formResult.course,
        subjectId: formResult.subject
      };
      console.log('Creating Lecture:', lecture);

      this.scheduleService.createLecture(lecture).subscribe({
        next: (response) => {
          console.log('Lecture created successfully:', response);
          const lecture = this.lectures.find((lec) => lec.id === response.lectureId);
          dp.events.add(this.mapToEventData(response, lecture));
          this.loadLecturesAndEvents();
        },
        error: (error) => {
          console.error('Error creating lecture:', error);
        }
      });
    } catch (error) {
      console.error('Error in reservation process:', error);
    }
  }

  async editEvent(event: DayPilot.Event): Promise<void> {
    try {
      // Ensure dates are in full ISO format
      const startStr = event.start().toString('yyyy-MM-ddTHH:mm:ss');
      const endStr = event.end().toString('yyyy-MM-ddTHH:mm:ss');

      const form = await DayPilot.Modal.form(
        [
          { name: 'Title', id: 'title' },
          {
            name: 'Start Time',
            id: 'start',
            type: 'datetime',
            dateFormat: 'yyyy-MM-dd'
          },
          {
            name: 'End Time',
            id: 'end',
            type: 'datetime',
            dateFormat: 'yyyy-MM-dd'
          }
        ],
        {
          title: event.text(),
          start: startStr,
          end: endStr
        }
      );

      if (form.canceled) {
        console.log('Edit cancelled');
        return;
      }

      const formatDateTime = (dateStr: string): string => {
        return new DayPilot.Date(dateStr).toString('yyyy-MM-ddTHH:mm:ss');
      };

      const updatedReservation: ReservationDto = {
        reservationId: event.data.id,
        title: form.result.title,
        resourceId: event.data.tags.resource,
        lectureId: event.data.tags.lectureId,
        eventId: event.data.tags.eventId,
        startTime: formatDateTime(form.result.start),
        endTime: formatDateTime(form.result.end)
      };

      console.log('Updated Reservation:', updatedReservation);

      this.scheduleService.updateReservation(event.id().toString(), updatedReservation).subscribe({
        next: () => {
          const calendar = this.getActiveCalendar();
          if (calendar) {
            calendar.events.update(new DayPilot.Event(this.mapToEventData(updatedReservation)));
          }
        },
        error: (err) => console.error('Error updating reservation:', err)
      });
    } catch (error) {
      console.error('Error in edit process:', error);
    }
  }

  deleteEvent(event: DayPilot.Event): void {
    this.scheduleService.deleteLecture(event.id().toString()).subscribe({
      next: () => {
        const calendar = this.getActiveCalendar();
        if (calendar) {
          calendar.events.remove(event);
        }
      },
      error: (err) => console.error('Error deleting reservation:', err)
    });
  }

  private getActiveCalendar(): DayPilot.Calendar | DayPilot.Month | null {
    switch (this.activeView) {
      case 'day':
        return this.day?.control || null;
      case 'week':
        return this.week?.control || null;
      case 'month':
        return this.month?.control || null;
      default:
        return null;
    }
  }

  onBeforeEventRender(args: EventRenderArgs): void {
    const areas: AreaData[] = [
      {
        top: 3,
        right: 3,
        width: 24,
        height: 24,
        action: 'ContextMenu',
        padding: 2,
        symbol: '/icons/daypilot.svg#threedots-h',
        cssClass: 'event-menu',
        toolTip: 'Menu',
        visibility: 'Hover'
      }
    ];
    args.data.areas = areas;

    if (args.data.barColor) {
      args.data.backColor = args.data.barColor + '33';
    }

    // const resourceName = this.resources.find((r) => String(r.resourceId) === args.data.resource)?.resourceName;
    // const recurrenceText = args.data.recurrence
    //   ? `Recurring: ${args.data.recurrence.frequency} every ${args.data.recurrence.interval} ${
    //       args.data.recurrence.frequency === 'Weekly'
    //         ? 'week(s) on ' + (args.data.recurrence.daysOfWeek?.map((d) => this.dayNames[d]).join(', ') || '')
    //         : args.data.recurrence.frequency === 'Daily'
    //           ? 'day(s)'
    //           : 'month(s)'
    //     } until ${args.data.recurrence.endDate}`
    //   : '';

    // args.data.html = `<div class="event-content">${args.data.text}<br><small>${resourceName}${args.data.recurrence ? ' (Recurring)' : ''}</small></div>`;
    // args.data.toolTip = `${args.data.text}\nResource: ${resourceName}\n${recurrenceText}`;
  }
}
