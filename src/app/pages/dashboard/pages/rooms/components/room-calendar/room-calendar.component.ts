import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomCalendarService, RoomCalendarEvent } from '../../services/room-calendar.service';
import { RoomsService } from '../../services/rooms.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ClassDetailsModalComponent } from '../class-details-modal/class-details-modal.component';

@Component({
  selector: 'app-room-calendar',
  templateUrl: './room-calendar.component.html',
  styleUrls: ['./room-calendar.component.scss'],
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatDialogModule]
})
export class RoomCalendarComponent implements OnInit, OnDestroy {
  @Input() roomId: string = '';
  
  currentDate = new Date();
  events: RoomCalendarEvent[] = [];
  loading = false;
  roomName = '';
  roomDetails: any = null;
  equipment: any[] = [];
  
  // Calendar view state
  viewMode: 'month' | 'week' | 'day' = 'month';
  weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
  calendarDays: any[] = [];
  
  constructor(
    private roomCalendarService: RoomCalendarService,
    private roomsService: RoomsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (!this.roomId) {
      this.roomId = this.route.snapshot.paramMap.get('id') || '';
    }
    
    if (this.roomId) {
      this.loadRoomDetails();
      this.loadCalendarEvents();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadRoomDetails(): void {
    this.roomsService.getRoomDetails(this.roomId).subscribe({
      next: (data: any) => {
        this.roomDetails = data.room;
        this.equipment = data.equipment || [];
        this.roomName = data.room?.RoomName || 'Nieznana sala';
      },
      error: (err: any) => {
        console.error('Error loading room details:', err);
        // Fallback to basic room info
        this.roomsService.getRoomById(this.roomId).subscribe({
          next: (room: any) => {
            this.roomName = room.RoomName || 'Nieznana sala';
          }
        });
      }
    });
  }

  loadCalendarEvents(): void {
    this.loading = true;
    this.generateCalendarDays();
    const from = this.getDateRange().from;
    const to = this.getDateRange().to;

    this.roomCalendarService.getRoomCalendar(this.roomId, from, to).subscribe({
      next: (response: any) => {
        this.events = response.events;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading calendar events:', err);
        this.loading = false;
      }
    });
  }

  generateCalendarDays(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Adjust to start from Monday
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);
    
    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      this.calendarDays.push({
        date: date,
        dayNumber: date.getDate(),
        isOtherMonth: date.getMonth() !== month,
        isToday: date.getTime() === today.getTime()
      });
    }
  }

  getDateRange(): { from: string; to: string } {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 0);
    
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };
  }

  navigateMonth(direction: 'prev' | 'next'): void {
    if (direction === 'prev') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.loadCalendarEvents();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.loadCalendarEvents();
  }

  getMonthName(): string {
    return this.currentDate.toLocaleDateString('pl-PL', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  getEventsForDate(date: Date): RoomCalendarEvent[] {
    const filteredEvents = this.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
    console.log(`Room calendar events for ${date.toDateString()}:`, filteredEvents);
    return filteredEvents;
  }

  onEventClick(event: RoomCalendarEvent): void {
    if (event.type === 'fitness_class') {
      // Open class details modal
      this.openClassDetailsModal(event);
    } else if (event.type === 'room_reservation') {
      // Show reservation details
      console.log('Room reservation clicked:', event);
    }
  }

  openClassDetailsModal(event: RoomCalendarEvent): void {
    const dialogRef = this.dialog.open(ClassDetailsModalComponent, {
      width: '500px',
      disableClose: false, // Allow closing by clicking backdrop
      hasBackdrop: true,
      data: {
        classId: event.meta?.classId || event.id,
        title: event.title,
        startTime: event.start,
        endTime: event.end,
        capacity: event.meta?.capacity || 0,
        currentReservations: event.meta?.currentReservations,
        availableSpots: event.meta?.availableSpots,
        isFull: event.meta?.isFull,
        trainerName: event.trainerName,
        roomName: event.roomName
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh calendar events if booking was successful
        this.loadCalendarEvents();
      }
    });
  }

  onDateClick(date: Date): void {
    // Handle date click - maybe show available time slots
    console.log('Date clicked:', date);
  }

  getEventTooltip(event: RoomCalendarEvent): string {
    if (event.type === 'fitness_class') {
      return `${event.title}\nTrener: ${event.meta.trainerName}\nMiejsca: ${event.meta.availableSpots}/${event.meta.capacity}`;
    } else {
      return `${event.title}\nUżytkownik: ${event.meta.userName}`;
    }
  }
}
