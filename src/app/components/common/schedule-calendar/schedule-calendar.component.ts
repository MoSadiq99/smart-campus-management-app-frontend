/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CalendarModule,
  CalendarView,
  CalendarEvent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarWeekViewBeforeRenderEvent,
  CalendarDayViewBeforeRenderEvent,
  CalendarUtils,
  CalendarA11y,
} from 'angular-calendar';
import { Frequency, RRule, Weekday } from 'rrule';
import moment from 'moment-timezone';
import { ViewPeriod, EventColor } from 'calendar-utils';
import { colors } from 'src/app/theme/utils/colors';
import { HttpClient } from '@angular/common/http';
import { ScheduleCreateDto } from 'src/app/models/dto/ScheduleCreateDto';

interface RecurringEvent {
  title: string;
  color: EventColor;
  rrule?: {
    freq: Frequency;
    bymonth?: number;
    bymonthday?: number;
    byweekday?: Weekday[];
  };
}

moment.tz.setDefault('Utc');

@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './schedule-calendar.component.html',
  styleUrls: ['./schedule-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CalendarUtils,
    CalendarA11y,
  ],
})
export class ScheduleCalendarComponent {
  view: CalendarView = CalendarView.Month;
  viewDate = moment().toDate();
  calendarEvents: CalendarEvent[] = [];
  viewPeriod!: ViewPeriod;
  CalendarView = CalendarView;

  recurringEvents: RecurringEvent[] = [];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly http: HttpClient
  ) {
    this.fetchSchedules();
  }

  // Fetch schedules from the backend
  fetchSchedules(): void {
    const userId = 1; // Replace with actual user ID
    this.http.get(`/api/users/${userId}/schedules`).subscribe((schedules: any) => {
      this.calendarEvents = schedules.map((schedule: any) => ({
        title: schedule.title,
        start: new Date(schedule.time),
        color: colors['blue'],
      }));
      this.cdr.detectChanges();
    });
  }

  // Add a new schedule
  addSchedule(schedule: ScheduleCreateDto): void {
    this.http.post('/api/schedules', schedule).subscribe(() => {
      this.fetchSchedules(); // Refresh the calendar
    });
  }

  // Handle "Previous" button click
  previous(): void {
    this.viewDate = moment(this.viewDate).subtract(1, this.getViewUnit()).toDate();
  }

  // Handle "Today" button click
  today(): void {
    this.viewDate = moment().toDate();
  }

  // Handle "Next" button click
  next(): void {
    this.viewDate = moment(this.viewDate).add(1, this.getViewUnit()).toDate();
  }

  // Handle view change (Month, Week, Day)
  setView(view: CalendarView): void {
    this.view = view;
  }

  // Helper method to get the unit (day, week, month) based on the current view
  private getViewUnit(): moment.unitOfTime.DurationConstructor {
    switch (this.view) {
      case CalendarView.Day:
        return 'day';
      case CalendarView.Week:
        return 'week';
      case CalendarView.Month:
      default:
        return 'month';
    }
  }

  updateCalendarEvents(
    viewRender:
      | CalendarMonthViewBeforeRenderEvent
      | CalendarWeekViewBeforeRenderEvent
      | CalendarDayViewBeforeRenderEvent
  ): void {
    if (
      !this.viewPeriod ||
      !moment(this.viewPeriod.start).isSame(viewRender.period.start) ||
      !moment(this.viewPeriod.end).isSame(viewRender.period.end)
    ) {
      this.viewPeriod = viewRender.period;
      this.calendarEvents = [];

      this.recurringEvents.forEach((event) => {
        const rule: RRule = new RRule({
          ...event.rrule,
          dtstart: moment(viewRender.period.start).startOf('day').toDate(),
          until: moment(viewRender.period.end).endOf('day').toDate(),
        });

        const { title, color } = event;

        rule.all().forEach((date) => {
          this.calendarEvents.push({
            title,
            color,
            start: moment(date).toDate(),
          });
        });
      });
      this.cdr.detectChanges();
    }
  }
}
