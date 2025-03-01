/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ViewChild, Component } from '@angular/core';
import {
  DayPilot,
  DayPilotCalendarComponent,
  DayPilotModule,
  DayPilotMonthComponent,
  DayPilotNavigatorComponent
} from '@daypilot/daypilot-lite-angular';
import { CalendarService } from './calendar.service';
import { EventCreateDto } from 'src/app/models/event-create-dto';
import { EventStatus } from 'src/app/models/event-enums';
import { EventCreateForm, EventEditForm } from 'src/app/models/calender-forms';

@Component({
  selector: 'app-event-calendar',
  imports: [DayPilotModule],
  templateUrl: './event-calendar.component.html',
  styleUrl: './event-calendar.component.scss'
})
export class EventCalendarComponent implements AfterViewInit {
  @ViewChild('day') day!: DayPilotCalendarComponent;
  @ViewChild('week') week!: DayPilotCalendarComponent;
  @ViewChild('month') month!: DayPilotMonthComponent;
  @ViewChild('navigator') nav!: DayPilotNavigatorComponent;

  events: DayPilot.EventData[] = [];

  date = DayPilot.Date.today();

  contextMenu = new DayPilot.Menu({
    items: [
      {
        text: 'Delete',
        onClick: (args) => {
          const event = args.source;
          const dp = event.calendar;
          dp.events.remove(event);
        }
      },
      {
        text: 'Edit...',
        onClick: async (args) => {
          const event = args.source;
          const dp = event.calendar;

          const modal = await DayPilot.Modal.prompt('Edit event text:', event.data.text);
          dp.clearSelection();
          if (!modal.result) {
            return;
          }
          event.data.text = modal.result;
          dp.events.update(event);
        }
      },
      {
        text: '-'
      },
      {
        text: 'Red',
        onClick: (args) => {
          const event = args.source;
          const dp = event.calendar;
          event.data.backColor = CalendarService.colors.red;
          dp.events.update(event);
        }
      },
      {
        text: 'Green',
        onClick: (args) => {
          const event = args.source;
          const dp = event.calendar;
          event.data.backColor = CalendarService.colors.green;

          dp.events.update(event);
        }
      },
      {
        text: 'Blue',
        onClick: (args) => {
          const event = args.source;
          const dp = event.calendar;
          event.data.backColor = CalendarService.colors.blue;

          dp.events.update(event);
        }
      },
      {
        text: 'Yellow',
        onClick: (args) => {
          const event = args.source;
          const dp = event.calendar;
          event.data.backColor = CalendarService.colors.yellow;

          dp.events.update(event);
        }
      },

      {
        text: 'Gray',
        onClick: (args) => {
          const event = args.source;
          const dp = event.calendar;
          event.data.backColor = CalendarService.colors.gray;

          dp.events.update(event);
        }
      }
    ]
  });

  configNavigator: DayPilot.NavigatorConfig = {
    showMonths: 3,
    cellWidth: 25,
    cellHeight: 25,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onVisibleRangeChanged: (args) => {
      this.loadEvents();
    }
  };

  selectTomorrow() {
    this.date = DayPilot.Date.today().addDays(1);
  }

  changeDate(date: DayPilot.Date): void {
    this.configDay.startDate = date;
    this.configWeek.startDate = date;
    this.configMonth.startDate = date;
  }

  configDay: DayPilot.CalendarConfig = {
    durationBarVisible: false,
    contextMenu: this.contextMenu,
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onBeforeEventRender: this.onBeforeEventRender.bind(this),
    onEventClick: this.onEventClick.bind(this)
  };

  configWeek: DayPilot.CalendarConfig = {
    viewType: 'Week',
    durationBarVisible: false,
    contextMenu: this.contextMenu,
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onBeforeEventRender: this.onBeforeEventRender.bind(this),
    onEventClick: this.onEventClick.bind(this)
  };

  configMonth: DayPilot.MonthConfig = {
    contextMenu: this.contextMenu,
    eventBarVisible: false,
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onEventClick: this.onEventClick.bind(this)
  };

  constructor(
    private ds: CalendarService,
    private http: HttpClient
  ) {
    this.viewWeek();
  }

  ngAfterViewInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    const from = this.nav.control.visibleStart();
    const to = this.nav.control.visibleEnd();
    // this.ds.getEvents(from, to).subscribe((result) => {
    //   this.events = result;
    // });

    this.ds.getEvents(from, to).subscribe({
      next: (response) => {
        this.events = response;
      },
      error: (error) => {
        console.error('Error fetching events:', error);
      }
    });
  }

  viewDay(): void {
    this.configNavigator.selectMode = 'Day';
    this.configDay.visible = true;
    this.configWeek.visible = false;
    this.configMonth.visible = false;
  }

  viewWeek(): void {
    this.configNavigator.selectMode = 'Week';
    this.configDay.visible = false;
    this.configWeek.visible = true;
    this.configMonth.visible = false;
  }

  viewMonth(): void {
    this.configNavigator.selectMode = 'Month';
    this.configDay.visible = false;
    this.configWeek.visible = false;
    this.configMonth.visible = true;
  }

  onBeforeEventRender(args: any) {
    const dp = args.control;
    args.data.areas = [
      {
        top: 3,
        right: 3,
        width: 20,
        height: 20,
        symbol: '/icons/daypilot.svg#minichevron-down-2',
        fontColor: '#fff',
        toolTip: 'Show context menu',
        action: 'ContextMenu'
      },
      {
        top: 3,
        right: 25,
        width: 20,
        height: 20,
        symbol: '/icons/daypilot.svg#x-circle',
        fontColor: '#fff',
        action: 'None',
        toolTip: 'Delete event',
        onClick: async (args: any) => {
          dp.events.remove(args.source);
        }
      }
    ];

    args.data.areas.push({
      bottom: 5,
      left: 5,
      width: 36,
      height: 36,
      action: 'None',
      image: `https://picsum.photos/36/36?random=${args.data.id}`,
      style: 'border-radius: 50%; border: 2px solid #fff; overflow: hidden;'
    });
  }

  async onTimeRangeSelected(args: any) {
    const modal = await DayPilot.Modal.form(EventCreateForm);

    if (modal.canceled) {
      return;
    }

    const dp = args.control;
    dp.clearSelection();

    const newEvent: EventCreateDto = {
      organizerId: modal.result.organizerId,
      title: modal.result.name,
      description: modal.result.description,
      startTime: args.start,
      endTime: args.end,
      location: modal.result.location,
      capacity: modal.result.capacity,
      status: EventStatus.UPCOMING
    };

    this.ds.createEvent(newEvent).subscribe({
      next: (response) => {
        console.log('Event created:', response);
      },
      error: (error) => {
        console.error('Error creating event:', error);
      }
    });
  }

  async onEventClick(args: any) {
    const data = args.e.data;

    const formData = {
      name: data.text,
      start: data.start,
      end: data.end,
      organizerId: data.tags.organizerId,
      location: data.tags.location,
      capacity: data.tags.capacity,
      backColor: data.backColor
    };

    const modal = await DayPilot.Modal.form(EventEditForm, formData);

    if (modal.canceled) {
      return;
    }

    const dp = args.control;

    dp.events.update(modal.result);
  }
}
