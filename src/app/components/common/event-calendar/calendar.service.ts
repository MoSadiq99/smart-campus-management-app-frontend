/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { HttpClient } from '@angular/common/http';
import { EventCreateDto } from 'src/app/models/event-create-dto';
import { environment } from 'src/environments/environment';
import { EventDto } from 'src/app/models/event-dto';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  static readonly colors = {
    green: '#6aa84f',
    yellow: '#f1c232',
    red: '#cc4125',
    gray: '#808080',
    blue: '#2e78d6'
  };

  events = [
    {
      id: 1,
      text: 'Event 1',
      start: DayPilot.Date.today().firstDayOfWeek().addHours(10),
      end: DayPilot.Date.today().firstDayOfWeek().addHours(13),
      participants: 2
    },
    {
      id: 2,
      text: 'Event 2',
      start: DayPilot.Date.today().firstDayOfWeek().addDays(1).addHours(12),
      end: DayPilot.Date.today().firstDayOfWeek().addDays(1).addHours(15),
      backColor: CalendarService.colors.green,
      participants: 1
    },
    {
      id: 3,
      text: 'Event 3',
      start: DayPilot.Date.today().firstDayOfWeek().addDays(2).addHours(13),
      end: DayPilot.Date.today().firstDayOfWeek().addDays(2).addHours(16),
      backColor: CalendarService.colors.yellow,
      participants: 3
    },
    {
      id: 4,
      text: 'Event 4',
      start: DayPilot.Date.today().firstDayOfWeek().addDays(3).addHours(11),
      end: DayPilot.Date.today().firstDayOfWeek().addDays(3).addHours(15),
      backColor: CalendarService.colors.red,
      participants: 4
    }
  ];

  constructor(private readonly http: HttpClient) {}

  getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<DayPilot.EventData[]> {
    return this.http
      .get<EventDto[]>(`${environment.apiUrl}/events?from=${from.toString()}&to=${to.toString()}`)
      .pipe(map((events: EventDto[]) => events.map((event) => this.mapToEventData(event))));
  }

  private mapToEventData(event: EventDto): DayPilot.EventData {
    return {
      id: event.eventId,
      text: event.title,
      start: new DayPilot.Date(event.startTime),
      end: new DayPilot.Date(event.endTime),
      backColor: CalendarService.colors.green,
      tags: {
        capacity: event.capacity,
        location: event.location,
        organizerId: event.organizerId,
        status: event.status
      }
    };
  }

  public createEvent(newEvent: EventCreateDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/events`, newEvent);
  }

  getColors(): any[] {
    const colors = [
      { name: 'Green', id: CalendarService.colors.green },
      { name: 'Yellow', id: CalendarService.colors.yellow },
      { name: 'Red', id: CalendarService.colors.red },
      { name: 'Gray', id: CalendarService.colors.gray },
      { name: 'Blue', id: CalendarService.colors.blue }
    ];
    return colors;
  }
}
