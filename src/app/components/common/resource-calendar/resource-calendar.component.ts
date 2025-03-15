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
import { ResourceService } from './resource.service';
import { CommonModule } from '@angular/common';
import { ReservationCreateDto } from 'src/app/models/dto/ReservationCreateDto';
import { FormsModule } from '@angular/forms';
import { ResourceDto } from 'src/app/models/dto/ResourceDto';

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
  recurrenceInterval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

export interface ExtendedEventData extends DayPilot.EventData {
  resource: string; // Will store resourceId as string for filtering, resolved to name in rendering
  recurrence?: RecurrencePattern;
  toolTip?: string;
  resourceId?: number; // Optional: Keep backend resourceId for reference
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
  selector: 'app-resource-calendar',
  standalone: true,
  imports: [DayPilotModule, CommonModule, FormsModule],
  templateUrl: './resource-calendar.component.html',
  styleUrls: ['./resource-calendar.component.scss']
})
export class ResourceCalendarComponent implements AfterViewInit {
  @ViewChild('day') day!: DayPilotCalendarComponent;
  @ViewChild('week') week!: DayPilotCalendarComponent;
  @ViewChild('month') month!: DayPilotMonthComponent;
  @ViewChild('navigator') nav!: DayPilotNavigatorComponent;

  events: ExtendedEventData[] = [];
  date = DayPilot.Date.today();
  resources: ResourceDto[] = [];
  activeView: 'day' | 'week' | 'month' = 'week';
  selectedResource!: ResourceDto;
  dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
    onVisibleRangeChanged: () => this.loadResourcesAndEvents()
  };

  constructor(private readonly ds: ResourceService) {}

  ngAfterViewInit(): void {
    this.loadResourcesAndEvents();
  }

  loadResourcesAndEvents(): void {
    const from = this.nav.control.visibleStart();
    const to = this.nav.control.visibleEnd();

    forkJoin([this.ds.getAllResources(), this.ds.getEvents(from, to)]).subscribe({
      next: ([resources, events]) => {
        this.resources = resources;
        if (resources.length > 0 && !this.selectedResource) {
          this.selectedResource = resources[0];
        }
        console.log('Raw events from backend:', events);

        // Map backend ReservationDto to ExtendedEventData
        this.events = events
          .map((event) => {
            const resource = this.resources.find((r) => r.resourceId === event.resourceId);
            return {
              id: event.reservationId.toString(), // Convert Long to string for DayPilot
              start: event.startTime,
              end: event.endTime,
              text: event.title,
              // text: `Reservation #${event.reservationId}`, // Default text if none provided
              resource: resource?.resourceName || event.resourceId.toString(), // Use resourceName if available
              resourceId: event.resourceId, // Keep for reference
              // recurrence: event.recurrence,
              status: event.status,
              barColor: '#6fa8dc' // Default color
            };
          })
          .filter((event) => event.resource === this.selectedResource.resourceName);

        console.log('Mapped and filtered events:', this.events);
        this.updateCalendars();
      },
      error: (err) => console.error('Error loading data:', err)
    });
  }

  updateCalendars(): void {
    setTimeout(() => {
      const activeCalendar = this.getActiveCalendar();
      if (activeCalendar) {
        activeCalendar.update({ events: this.events });
        console.log('Calendar updated with events:', this.events);
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
    this.loadResourcesAndEvents();
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
            name: 'Reservation Type',
            id: 'reservationType',
            type: 'select',
            options: [
              { id: 'oneTime', name: 'One-Time Reservation' },
              { id: 'recurring', name: 'Recurring Reservation' }
            ]
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
          }
        ],
        {
          title: 'New Reservation',
          start: startStr,
          end: endStr,
          reservationType: 'oneTime'
        }
      );

      if (basicForm.canceled) {
        console.log('Form cancelled');
        return;
      }

      let formResult = basicForm.result;

      if (basicForm.result.reservationType === 'recurring') {
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
              type: 'select',
              options: this.dayNames.map((day, index) => ({ id: index, name: day }))
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
            daysOfWeek: args.start.getDayOfWeek(),
            recurrenceEnd: args.start.addDays(7).toString('yyyy-MM-ddTHH:mm:ss')
          }
        );

        if (recurringForm.canceled) {
          console.log('Recurring form cancelled');
          return;
        }

        formResult = { ...basicForm.result, ...recurringForm.result };
      }

      const formatDateTime = (dateStr: string): string => {
        const dpDate = new DayPilot.Date(dateStr);
        return dpDate.toString('yyyy-MM-ddTHH:mm:ss');
      };

      console.log('Selected Resource:', this.selectedResource);
      const reservation: ReservationCreateDto = {
        title: formResult.title,
        lectureId: null,
        resourceId: Number(this.selectedResource.resourceId), // Ensure it's a number
        startTime: formatDateTime(formResult.start),
        endTime: formatDateTime(formResult.end),
        recurrence:
          formResult.reservationType === 'recurring'
            ? {
                frequency: formResult.frequency,
                recurrenceInterval: formResult.interval,
                endDate: formatDateTime(formResult.recurrenceEnd),
                daysOfWeek: formResult.frequency === 'Weekly' ? [formResult.daysOfWeek] : undefined
              }
            : undefined
      };
      console.log('Creating reservation with recurrence:', reservation);

      this.ds.createReservation(reservation).subscribe({
        next: (response: any) => {
          const newEvent: ExtendedEventData = {
            start: reservation.startTime,
            end: reservation.endTime,
            id: response.body.reservationId || DayPilot.guid(), // Use response.body for full response
            text: formResult.title,
            resource: this.selectedResource.resourceName,
            barColor: '#6fa8dc',
            recurrence: reservation.recurrence
          };
          dp.events.add(new DayPilot.Event(newEvent));
          this.loadResourcesAndEvents(); // Refresh to show all instances
        },
        error: (err) => console.error('Error creating reservation:', err)
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
            dateFormat: 'yyyy-MM-ddTHH:mm:ss'
          },
          {
            name: 'End Time',
            id: 'end',
            type: 'datetime',
            dateFormat: 'yyyy-MM-ddTHH:mm:ss'
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

      const updatedEvent: ExtendedEventData = {
        ...event.data,
        text: form.result.title,
        resource: event.resource(),
        start: formatDateTime(form.result.start),
        end: formatDateTime(form.result.end),
        // Preserve recurrence if it exists
        recurrence: event.data.recurrence
      };

      this.ds.updateReservation(event.id().toString(), updatedEvent).subscribe({
        next: () => {
          const calendar = this.getActiveCalendar();
          if (calendar) {
            calendar.events.update(new DayPilot.Event(updatedEvent));
          }
        },
        error: (err) => console.error('Error updating reservation:', err)
      });
    } catch (error) {
      console.error('Error in edit process:', error);
    }
  }

  deleteEvent(event: DayPilot.Event): void {
    this.ds.deleteReservation(event.id().toString()).subscribe({
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

    const resourceName = this.resources.find((r) => String(r.resourceId) === args.data.resource)?.resourceName;
    const recurrenceText = args.data.recurrence
      ? `Recurring: ${args.data.recurrence.frequency} every ${args.data.recurrence.recurrenceInterval} ${
          args.data.recurrence.frequency === 'Weekly'
            ? 'week(s) on ' + (args.data.recurrence.daysOfWeek?.map((d) => this.dayNames[d]).join(', ') || '')
            : args.data.recurrence.frequency === 'Daily'
              ? 'day(s)'
              : 'month(s)'
        } until ${args.data.recurrence.endDate}`
      : '';

    args.data.html = `<div class="event-content">${args.data.text}<br><small>${resourceName}${args.data.recurrence ? ' (Recurring)' : ''}</small></div>`;
    args.data.toolTip = `${args.data.text}\nResource: ${resourceName}\n${recurrenceText}`;
  }
}
