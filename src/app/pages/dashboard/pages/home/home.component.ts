import { Component, OnInit } from '@angular/core';
import { map, Observable, tap, combineLatest, shareReplay, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FitnessClassesService } from '../fitness-classes/services/fitness-classes.service';
import { ReservationsService } from '../reservations/services/reservations.service';
import { CustomCalendarComponent, CalendarEvent } from '../../../../shared/components/custom-calendar/custom-calendar.component';
import { UserService, User } from '../../../../shared/services/user.service';
import { RoomsService } from '../rooms/services/rooms.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    CustomCalendarComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  viewDate: Date = new Date();
  currentUser$: Observable<User | null>;
  showActionModal = false;
  showRoomReservationModal = false;
  showClassSignupModal = false;
  showBecomeTrainerModal = false;
  showClassOrganizationModal = false;
  
  // Room reservation form data
  roomReservationData = {
    roomId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: ''
  };
  
  // Class organization form data
  classOrganizationData = {
    roomId: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: 10,
    description: ''
  };
  
  // Admin metrics
  totalUsers$!: Observable<number>;
  totalReservations$!: Observable<number>;
  totalClasses$!: Observable<number>;
  totalRooms$!: Observable<number>;
  
  // Trainer data
  myClasses$!: Observable<CalendarEvent[]>;
  trainerEvents$!: Observable<CalendarEvent[]>;
  
  // Receptionist data
  pendingReservations$!: Observable<CalendarEvent[]>;
  
  // Rooms data for forms
  rooms$!: Observable<any[]>;
  
  // Available classes for signup
  availableClasses$!: Observable<any[]>;

  // Get events from reservations service and format them for our custom calendar
  formattedEvents$: Observable<CalendarEvent[]> = this.reservationsService.schedulerItems$.pipe(
    map(events => events.map((event: any) => {
      console.log('🔍 Raw event from backend:', event);
      return {
        id: event.id || Math.random().toString(),
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end || event.start),
        type: this.determineEventType(event),
        roomName: event.meta?.roomName || event.roomName,
        trainerName: event.meta?.trainerName || event.trainerName,
        userName: event.meta?.userName || event.userName,
        status: event.meta?.status || event.status || 'active',
        meta: event.meta // Preserve the entire meta object
      };
    })),
    tap(events => console.log('Formatted events:', events))
  );

  closestEvent$: Observable<CalendarEvent | null> = this.formattedEvents$.pipe(
  map(events => {
    const now = new Date();
    const futureEvents = events.filter(event => new Date(event.start) > now);

    if (futureEvents.length === 0) {
      return null; 
    }

    return futureEvents.reduce((closest, event) => {
      return new Date(event.start) < new Date(closest.start) ? event : closest;
    });
  }),
    tap(value => console.log('Closest event:', value))
);

  pastEventsCount$: Observable<number> = this.formattedEvents$.pipe(
  map(events => {
    const now = new Date();
    return events
        .filter(event => new Date(event.end) < now)
      .length;
  }),
    tap(count => console.log('Liczba odbytych zajęć:', count))
);

  constructor(
    private reservationsService: ReservationsService,
    private fitnessClassesService: FitnessClassesService,
    private userService: UserService,
    private roomsService: RoomsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.currentUser$ = this.userService.currentUser$;
    
    // Initialize empty metrics - will be loaded conditionally in ngOnInit
    this.totalUsers$ = of(0);
    this.totalReservations$ = of(0); 
    this.totalClasses$ = of(0);
    this.totalRooms$ = of(0);
    
    // Initialize trainer data - show only the next upcoming class organized by trainer
    this.myClasses$ = this.formattedEvents$.pipe(
      map(events => {
        const now = new Date();
        const trainerClasses = events.filter(event => 
          event.type === 'trainer_class' && 
          new Date(event.start) > now
        );
        
        // Sort by start time and take only the first (closest) one
        return trainerClasses
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
          .slice(0, 1);
      })
    );
    
    // Initialize trainer events (all events for trainer - classes and room reservations)
    this.trainerEvents$ = this.formattedEvents$.pipe(
      map(events => events.filter(event => 
        event.type === 'trainer_class' || 
        event.type === 'fitness_class' || 
        event.type === 'room_reservation'
      ))
    );
    
    // Initialize receptionist data
    this.pendingReservations$ = this.formattedEvents$.pipe(
      map(events => events.filter(event => event.status === 'pending'))
    );
    
    // Initialize rooms data
    this.rooms$ = this.roomsService.items$;
    this.roomsService.getRooms().subscribe();
    
    // Initialize available classes for signup (only future classes)
    // Use calendar data instead of classes data to get user reservation info
    this.availableClasses$ = this.formattedEvents$.pipe(
      map(events => {
        // Get only fitness class events that are in the future
        const futureClasses = events.filter(event => {
          if (event.type !== 'fitness_class') return false;
          const classStartTime = new Date(event.start);
          const now = new Date();
          return classStartTime > now; // Only show classes that haven't started yet
        });
        
        // Convert calendar events to class format for the modal
        return futureClasses.map(event => ({
          ClassID: event.meta?.classId,
          Title: event.title,
          StartTime: event.start,
          EndTime: event.end,
          RoomID: ((event as any).roomName || (event.meta as any)?.roomName || 'Sala 1').replace('Sala ', ''),
          Capacity: event.meta?.capacity || 10,
          trainer: { Username: event.meta?.trainerName || 'Trener' },
          currentReservations: event.meta?.currentReservations || 0,
          availableSpots: event.meta?.availableSpots || 0,
          isFull: event.meta?.isFull || false,
          userReservation: event.meta?.userReservation || null
        }));
      })
    );
  }

  ngOnInit(): void {
    this.reservationsService.getCalendarEvents().subscribe();
    this.userService.getCurrentUser().subscribe();
    
    // Load system metrics only for admin/receptionist
    this.currentUser$.subscribe(user => {
      if (user && (user.Role.toLowerCase() === 'admin' || user.Role.toLowerCase() === 'receptionist')) {
        console.log('Loading system metrics for', user.Role);
        
        // Load metrics for admin/receptionist
        const systemMetrics$ = this.userService.getSystemMetrics().pipe(
          tap(metrics => console.log('System metrics received:', metrics)),
          shareReplay(1)
        );
        
        this.totalUsers$ = systemMetrics$.pipe(
          map(metrics => metrics.totalUsers || 0)
        );
        this.totalReservations$ = systemMetrics$.pipe(
          map(metrics => metrics.totalReservations || 0)
        );
        this.totalClasses$ = systemMetrics$.pipe(
          map(metrics => metrics.totalClasses || 0)
        );
        this.totalRooms$ = systemMetrics$.pipe(
          map(metrics => metrics.totalRooms || 0)
        );
        
        // Subscribe to actually trigger the API call
        systemMetrics$.subscribe();
      } else if (user) {
        console.log('Skipping system metrics for', user.Role, '- not admin/receptionist');
      }
    });
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'admin': 'Administrator',
      'receptionist': 'Recepcjonista',
      'trener': 'Trener',
      'regular': 'Użytkownik'
    };
    return roleNames[role.toLowerCase()] || role;
  }

  getRoleIcon(role: string): string {
    const roleIcons: { [key: string]: string } = {
      'admin': '👑',
      'receptionist': '🏢',
      'trener': '💪',
      'regular': '👤'
    };
    return roleIcons[role.toLowerCase()] || '👤';
  }

  getRoleDescription(role: string): string {
    const roleDescriptions: { [key: string]: string } = {
      'admin': 'Pełny dostęp do systemu',
      'receptionist': 'Zarządzanie rezerwacjami',
      'trener': 'Prowadzenie zajęć',
      'regular': 'Użytkownik systemu'
    };
    return roleDescriptions[role.toLowerCase()] || 'Użytkownik systemu';
  }

  // Navigation methods
  navigateToUserManagement(): void {
    this.router.navigate(['/dashboard/users']);
  }

  navigateToRoomManagement(): void {
    this.router.navigate(['/dashboard/rooms']);
  }


  navigateToFitnessClasses(): void {
    this.router.navigate(['/dashboard/fitness-classes']);
  }

  navigateToReservations(): void {
    this.router.navigate(['/dashboard/reservations']);
  }

  navigateToRooms(): void {
    this.router.navigate(['/dashboard/rooms']);
  }

  // Modal methods
  openActionModal(): void {
    this.showActionModal = true;
    document.body.classList.add('modal-open');
  }

  closeActionModal(): void {
    this.showActionModal = false;
    document.body.classList.remove('modal-open');
  }

  // Action methods
  reserveRoom(): void {
    this.closeActionModal();
    this.showRoomReservationModal = true;
    document.body.classList.add('modal-open');
  }

  signUpForClass(): void {
    this.closeActionModal();
    // Redirect to rooms page where user can choose room and see calendar
    this.router.navigate(['/dashboard/rooms']);
  }

  organizeClass(): void {
    this.showClassOrganizationModal = true;
    document.body.classList.add('modal-open');
  }

  // Room reservation methods
  closeRoomReservationModal(): void {
    this.showRoomReservationModal = false;
    this.resetRoomReservationForm();
    document.body.classList.remove('modal-open');
  }

  resetRoomReservationForm(): void {
    this.roomReservationData = {
      roomId: '',
      date: '',
      startTime: '',
      endTime: '',
      purpose: ''
    };
  }

  submitRoomReservation(): void {
    if (!this.roomReservationData.roomId || !this.roomReservationData.date || 
        !this.roomReservationData.startTime || !this.roomReservationData.endTime) {
      this.snackBar.open('Proszę wypełnić wszystkie wymagane pola', 'Zamknij', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Combine date and time for start and end times
    const startDateTime = new Date(`${this.roomReservationData.date}T${this.roomReservationData.startTime}`);
    const endDateTime = new Date(`${this.roomReservationData.date}T${this.roomReservationData.endTime}`);

    const reservationData = {
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      title: this.roomReservationData.purpose || 'Rezerwacja sali'
    };

    console.log('Creating room reservation:', {
      roomId: this.roomReservationData.roomId,
      data: reservationData
    });

    // Make API call to create room reservation
    this.roomsService.createRoomReservation(this.roomReservationData.roomId, reservationData).subscribe({
      next: (response) => {
        console.log('✅ Room reservation created successfully:', response);
        this.snackBar.open('🎉 Rezerwacja sali została utworzona pomyślnie!', 'Zamknij', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.closeRoomReservationModal();
        // Refresh calendar data
        this.reservationsService.getCalendarEvents().subscribe();
      },
      error: (error) => {
        console.error('❌ Error creating room reservation:', error);
        const errorMessage = error.error?.message || error.message || 'Wystąpił błąd podczas tworzenia rezerwacji';
        this.snackBar.open(`❌ ${errorMessage}`, 'Zamknij', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Class organization methods
  closeClassOrganizationModal(): void {
    this.showClassOrganizationModal = false;
    this.resetClassOrganizationForm();
    document.body.classList.remove('modal-open');
  }

  resetClassOrganizationForm(): void {
    this.classOrganizationData = {
      roomId: '',
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      capacity: 10,
      description: ''
    };
  }

  submitClassOrganization(): void {
    if (!this.classOrganizationData.roomId || !this.classOrganizationData.title || 
        !this.classOrganizationData.date || !this.classOrganizationData.startTime || 
        !this.classOrganizationData.endTime) {
      this.snackBar.open('Proszę wypełnić wszystkie wymagane pola', 'Zamknij', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Combine date and time for start and end times
    const startDateTime = new Date(`${this.classOrganizationData.date}T${this.classOrganizationData.startTime}`);
    const endDateTime = new Date(`${this.classOrganizationData.date}T${this.classOrganizationData.endTime}`);

    const classData = {
      roomId: parseInt(this.classOrganizationData.roomId),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      title: this.classOrganizationData.title,
      capacity: parseInt(this.classOrganizationData.capacity.toString()),
      description: this.classOrganizationData.description || ''
    };

    console.log('Creating fitness class:', classData);

    // Make API call to create fitness class
    this.fitnessClassesService.createFitnessClass(classData).subscribe({
      next: (response) => {
        console.log('✅ Fitness class created successfully:', response);
        this.snackBar.open('🎉 Zajęcia zostały utworzone pomyślnie!', 'Zamknij', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.closeClassOrganizationModal();
        // Refresh calendar data
        this.reservationsService.getCalendarEvents().subscribe();
      },
      error: (error) => {
        console.error('❌ Error creating fitness class:', error);
        const errorMessage = error.error?.message || error.message || 'Wystąpił błąd podczas tworzenia zajęć';
        this.snackBar.open(`❌ ${errorMessage}`, 'Zamknij', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Class signup methods
  closeClassSignupModal(): void {
    this.showClassSignupModal = false;
    document.body.classList.remove('modal-open');
  }

  // Become trainer modal methods
  openBecomeTrainerModal(): void {
    this.showBecomeTrainerModal = true;
    document.body.classList.add('modal-open');
  }

  closeBecomeTrainerModal(): void {
    this.showBecomeTrainerModal = false;
    document.body.classList.remove('modal-open');
  }

  bookClass(classId: number): void {
    this.currentUser$.subscribe(user => {
      if (!user) {
        this.snackBar.open('Musisz być zalogowany, aby zapisać się na zajęcia', 'Zamknij', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Find the class to check if it's still available for booking
      this.availableClasses$.subscribe(classes => {
        const classToBook = classes.find(c => c.ClassID === classId);
        if (!classToBook) {
          this.snackBar.open('Te zajęcia nie są już dostępne do zapisania się', 'Zamknij', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
          return;
        }

        const classStartTime = new Date(classToBook.StartTime);
        const now = new Date();
        
        if (classStartTime <= now) {
          this.snackBar.open('Nie można zapisać się na zajęcia, które już się rozpoczęły', 'Zamknij', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
          return;
        }

        console.log('Booking class:', { classId, userId: user.UserID });

        this.fitnessClassesService.bookClass(classId, user.UserID).subscribe({
          next: (response) => {
            console.log('✅ Class booking successful:', response);
            this.snackBar.open('🎉 Pomyślnie zapisano na zajęcia!', 'Zamknij', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
            // Refresh calendar data
            this.reservationsService.getCalendarEvents().subscribe();
          },
          error: (error) => {
            console.error('❌ Error booking class:', error);
            const errorMessage = error.error?.message || error.message || 'Wystąpił błąd podczas zapisywania na zajęcia';
            this.snackBar.open(`❌ ${errorMessage}`, 'Zamknij', {
              duration: 6000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }).unsubscribe();
    }).unsubscribe();
  }

  navigateToRoomReservation(): void {
    this.router.navigate(['/dashboard/rooms']);
  }

  // Helper functions for class signup modal
  formatClassDate(startTime: string): string {
    const date = new Date(startTime);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const classDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Check if class is in the past
    if (date <= now) {
      return `❌ Zajęcia już się odbyły - ${date.toLocaleDateString('pl-PL', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    
    if (classDate.getTime() === today.getTime()) {
      return `🟢 Dzisiaj, ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (classDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
      return `🟡 Jutro, ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `📅 ${date.toLocaleDateString('pl-PL', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
  }

  getAvailableSpots(classItem: any): number {
    // This would need to be calculated based on current reservations
    // For now, return a placeholder
    return classItem.Capacity - (classItem.currentReservations || 0);
  }

  isClassFull(classItem: any): boolean {
    return this.getAvailableSpots(classItem) <= 0;
  }

  isUserAlreadyRegistered(classItem: any): boolean {
    // Check if current user is already registered for this class
    // Now we have userReservation data from calendar events
    return !!(classItem.userReservation && classItem.userReservation.id);
  }

  // Reservation management functions
  getStatusText(status: string): string {
    switch (status) {
      case 'confirmed': return '✅ Potwierdzona';
      case 'active': return '✅ Aktywna';
      case 'pending': return '⏳ Oczekująca';
      case 'cancelled': return '❌ Anulowana';
      default: return status;
    }
  }

  cancelReservation(reservation: any): void {
    if (reservation.type === 'room_reservation') {
      this.reservationsService.deleteRoomReservation(reservation.meta?.reservationId).subscribe({
        next: (response) => {
          this.snackBar.open('✅ Rezerwacja sali została anulowana', 'Zamknij', { duration: 3000, panelClass: ['success-snackbar'] });
          this.reservationsService.getCalendarEvents().subscribe();
        },
        error: (error) => {
          this.snackBar.open('❌ Błąd podczas anulowania rezerwacji sali', 'Zamknij', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    } else if (reservation.type === 'fitness_class') {
      const updateData = { Status: 'cancelled' };
      this.reservationsService.editReservation(reservation.meta?.reservationId, updateData).subscribe({
        next: (response) => {
          this.snackBar.open('✅ Rezerwacja zajęć została anulowana', 'Zamknij', { duration: 3000, panelClass: ['success-snackbar'] });
          this.reservationsService.getCalendarEvents().subscribe();
        },
        error: (error) => {
          this.snackBar.open('❌ Błąd podczas anulowania rezerwacji zajęć', 'Zamknij', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }

  approveReservation(reservation: any): void {
    console.log('Approving reservation:', reservation);
    
    const updateData = {
      Status: 'confirmed'
    };

    this.reservationsService.editReservation(reservation.meta?.reservationId, updateData).subscribe({
      next: (response) => {
        console.log('✅ Reservation approved:', response);
        this.snackBar.open('✅ Rezerwacja została zatwierdzona!', 'Zamknij', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Refresh data
        this.reservationsService.getCalendarEvents().subscribe();
      },
      error: (error) => {
        console.error('❌ Error approving reservation:', error);
        this.snackBar.open('❌ Błąd podczas zatwierdzania rezerwacji', 'Zamknij', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  rejectReservation(reservation: any): void {
    console.log('Rejecting reservation:', reservation);
    
    const updateData = {
      Status: 'cancelled'
    };

    this.reservationsService.editReservation(reservation.meta?.reservationId, updateData).subscribe({
      next: (response) => {
        console.log('✅ Reservation rejected:', response);
        this.snackBar.open('❌ Rezerwacja została odrzucona', 'Zamknij', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        // Refresh data
        this.reservationsService.getCalendarEvents().subscribe();
      },
      error: (error) => {
        console.error('❌ Error rejecting reservation:', error);
        this.snackBar.open('❌ Błąd podczas odrzucania rezerwacji', 'Zamknij', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }


  navigateToClassReservation(): void {
    this.router.navigate(['/dashboard/fitness-classes']);
  }

  private determineEventType(event: any): 'fitness_class' | 'room_reservation' | 'trainer_class' {
    // Determine event type based on event properties
    if (event.type === 'trainer_class') {
      return 'trainer_class';
    }
    if (event.type === 'room_reservation' || event.title?.toLowerCase().includes('sala')) {
      return 'room_reservation';
    }
    return 'fitness_class';
  }

  onEventClick(event: CalendarEvent): void {
    console.log('Event clicked', event);
    // Handle event click - could open a dialog with event details
  }

  onDateClick(date: Date): void {
    console.log('Date clicked', date);
    // Handle date click - could open a dialog to create new reservation
  }

  onMonthChange(newDate: Date): void {
    console.log('Month changed to:', newDate);
    // Refresh calendar events for the new month
    this.reservationsService.getCalendarEvents().subscribe();
  }

  onReservationDeleted(): void {
    console.log('Reservation deleted, refreshing calendar...');
    // Force immediate refresh
    this.reservationsService.getCalendarEvents().subscribe();
    
    // Also refresh after a short delay to ensure backend has processed
    setTimeout(() => {
      this.reservationsService.getCalendarEvents().subscribe();
    }, 200);
    
    // One more refresh to be sure
    setTimeout(() => {
      this.reservationsService.getCalendarEvents().subscribe();
    }, 500);
    
    // Final refresh
    setTimeout(() => {
      this.reservationsService.getCalendarEvents().subscribe();
    }, 1000);
  }

  onEventDeleted(event: any): void {
    console.log('Event deleted from calendar, refreshing...');
    // Refresh calendar data
    this.reservationsService.getCalendarEvents().subscribe();
    
    // Show success message
    this.snackBar.open('✅ Rezerwacja została anulowana', 'Zamknij', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}
