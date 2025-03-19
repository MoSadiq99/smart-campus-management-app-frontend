import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../event-calendar/calendar.service';
import { EventDto } from 'src/app/models/event-dto';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { EventStatus } from 'src/app/models/event-enums';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit {
  events: EventDto[] = [];
  filteredEvents: EventDto[] = [];
  searchQuery: string = '';
  filterCategory: string = 'all';
  isLoading: boolean = true;

  private mockEvents: EventDto[] = [
    {
      eventId: 1,
      title: 'Annual Career Fair',
      startTime: new Date('2023-10-20T10:00:00'),
      endTime: new Date('2023-10-20T16:00:00'),
      location: 'Student Center',
      description: 'Connect with over 50 employers from various industries and explore job and internship opportunities.',
      capacity: 230,
      organizerId: 1,
      status: EventStatus.UPCOMING,
      attendeeIds: [],
      category: 'career'
    },
    {
      eventId: 2,
      title: 'AI & Machine Learning Workshop',
      startTime: new Date('2023-10-25T14:00:00'),
      endTime: new Date('2023-10-25T17:00:00'),
      location: 'Computer Science Building, Room 305',
      description: 'Learn the fundamentals of AI and machine learning with hands-on exercises and expert guidance.',
      capacity: 85,
      organizerId: 1,
      status: EventStatus.UPCOMING,
      attendeeIds: [],
      category: 'academic'
    },
  ];

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    console.log('ngOnInit started');
    this.isLoading = true;

    // Load mock data
    this.events = this.mockEvents;
    this.filteredEvents = this.events;
    console.log('Initial events:', this.events);
    this.isLoading = false; // Set to false after loading mock data

    // Commented out service call
    // const today = DayPilot.Date.today();
    // this.calendarService.getEvents(today, today.addDays(30)).subscribe({
    //   next: (events) => {
    //     console.log('Received events from service:', events);
    //     this.events = events.map(event => ({
    //       ...this.mapToEventDto(event),
    //       category: this.getCategoryFromEvent(event)
    //     }));
    //     this.filteredEvents = this.events;
    //     console.log('Mapped events:', this.events);
    //     console.log('Filtered events:', this.filteredEvents);
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error fetching events:', error);
    //     this.isLoading = false;
    //   }
    // });
  }

  onSearchChange(): void {
    this.filterEvents();
    console.log('After search filter:', this.filteredEvents);
  }

  onCategoryChange(): void {
    this.filterEvents();
    console.log('After category filter:', this.filteredEvents);
  }

  private filterEvents(): void {
    this.filteredEvents = this.events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesFilter = this.filterCategory === 'all' || event.category === this.filterCategory;
      return matchesSearch && matchesFilter;
    });
  }

  private mapToEventDto(event: DayPilot.EventData): EventDto {
    return {
      eventId: Number(event.id),
      title: event.text,
      startTime: event.start instanceof DayPilot.Date ? event.start.toDate() : new Date(event.start),
      endTime: event.end instanceof DayPilot.Date ? event.end.toDate() : new Date(event.end),
      location: event.tags?.location || '',
      description: event.tags?.description || '',
      capacity: event.tags?.capacity || 0,
      organizerId: event.tags?.organizerId || 0,
      status: (event.tags?.status as EventStatus) || EventStatus.UPCOMING,
      attendeeIds: event.tags?.attendeeIds || [],
      category: ''
    };
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTimeRange(start: Date, end: Date): string {
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  }

  getCategoryBadgeClass(category: string): string {
    switch(category) {
      case 'academic': return 'bg-primary';
      case 'social': return 'bg-success';
      case 'career': return 'bg-purple';
      case 'administrative': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  private getCategoryFromEvent(event: DayPilot.EventData): string {
    const title = event.text.toLowerCase();
    if (title.includes('career')) return 'career';
    if (title.includes('workshop') || title.includes('seminar')) return 'academic';
    if (title.includes('festival')) return 'social';
    return 'administrative';
  }
}
