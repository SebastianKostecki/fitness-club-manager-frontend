import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// Removed Material Dialog imports - using simple HTML modal instead
import { ReservationsService } from '../../../pages/dashboard/pages/reservations/services/reservations.service';
// Removed ReservationsModalComponent import - using simple HTML modal instead

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'fitness_class' | 'room_reservation' | 'trainer_class';
  roomName?: string;
  trainerName?: string;
  userName?: string;
  status: string;
  meta?: {
    reservationId?: number;
    classId?: number;
    userName?: string;
    userEmail?: string;
    trainerName?: string;
    capacity?: number;
    availableSpots?: number;
    currentReservations?: number;
    isFull?: boolean;
    userReservation?: {
      id: number;
      status: string;
    } | null;
  };
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-custom-calendar',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './custom-calendar.component.html',
  styleUrls: ['./custom-calendar.component.scss']
})
export class CustomCalendarComponent implements OnInit, OnChanges {
  @Input() events: CalendarEvent[] = [];
  @Input() viewDate: Date = new Date();
  @Output() eventClick = new EventEmitter<CalendarEvent>();
  @Output() dateClick = new EventEmitter<Date>();
  @Output() monthChange = new EventEmitter<Date>();
  @Output() eventDeleted = new EventEmitter<CalendarEvent>();
  @Output() reservationDeleted = new EventEmitter<void>();

  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
  monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  constructor(
    private reservationsService: ReservationsService
  ) {}

  ngOnInit() {
    this.currentMonth = new Date(this.viewDate);
    this.generateCalendar();
    console.log('CustomCalendar initialized with events:', this.events);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['viewDate'] || changes['events']) {
      this.generateCalendar();
    }
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // First day of the calendar (including previous month days)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Last day of the calendar (including next month days)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    this.calendarDays = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayEvents = this.getEventsForDate(currentDate);
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = this.isToday(currentDate);
      
      this.calendarDays.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday,
        events: dayEvents
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    const filteredEvents = this.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
    console.log(`Events for ${date.toDateString()}:`, filteredEvents);
    return filteredEvents;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  previousMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
    this.monthChange.emit(new Date(this.currentMonth));
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
    this.monthChange.emit(new Date(this.currentMonth));
  }

  goToToday() {
    this.currentMonth = new Date();
    this.generateCalendar();
    this.monthChange.emit(new Date(this.currentMonth));
  }

  onEventClick(event: CalendarEvent) {
    console.log('Event clicked:', event);
    // Open modal with all events for this day
    const eventDate = new Date(event.start);
    const dayEvents = this.getEventsForDate(eventDate);
    this.openReservationsModal(eventDate, dayEvents);
    this.eventClick.emit(event);
  }

  canDeleteEvent(event: CalendarEvent): boolean {
    // Can delete if it's a user's reservation and not in the past
    const now = new Date();
    const eventStart = new Date(event.start);
    
    // Don't allow deletion of past events
    if (eventStart <= now) {
      return false;
    }
    
    // Can delete if it's a user's reservation (has reservationId in meta)
    return !!(event.meta?.reservationId);
  }

  onDeleteEvent(event: CalendarEvent): void {
    console.log('Deleting event:', event);
    
    if (event.type === 'room_reservation') {
      // Delete room reservation
      if (event.meta?.reservationId) {
        this.reservationsService.deleteRoomReservation(event.meta.reservationId.toString()).subscribe({
          next: (response) => {
            console.log('✅ Room reservation deleted:', response);
            // Emit event to parent to refresh calendar
            this.eventDeleted.emit(event);
          },
          error: (error) => {
            console.error('❌ Error deleting room reservation:', error);
          }
        });
      }
    } else if (event.type === 'trainer_class') {
      // Delete trainer class (cancel the class)
      if (event.meta?.classId) {
        // For trainer classes, we might want to cancel the class instead of deleting
        // This would require a different API endpoint
        console.log('Trainer class cancellation not implemented yet');
        // TODO: Implement trainer class cancellation
      }
    } else if (event.type === 'fitness_class') {
      // Cancel class reservation
      if (event.meta?.reservationId) {
        const updateData = { Status: 'cancelled' };
        this.reservationsService.editReservation(event.meta.reservationId, updateData).subscribe({
          next: (response) => {
            console.log('✅ Class reservation cancelled:', response);
            // Emit event to parent to refresh calendar
            this.eventDeleted.emit(event);
          },
          error: (error) => {
            console.error('❌ Error cancelling class reservation:', error);
          }
        });
      }
    }
  }

  onDateClick(date: Date) {
    console.log('Date clicked:', date);
    const dayEvents = this.getEventsForDate(date);
    console.log('Day events:', dayEvents);
    if (dayEvents.length > 0) {
      console.log('Opening modal with events:', dayEvents);
      this.openReservationsModal(date, dayEvents);
    } else {
      console.log('No events, emitting dateClick');
      this.dateClick.emit(date);
    }
  }

  getEventClass(event: CalendarEvent): string {
    return `event-${event.type}`;
  }

  getEventStyle(event: CalendarEvent): any {
    if (event.type === 'fitness_class') {
      return {
        'background': 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        'color': 'white',
        'border': '1px solid rgba(255, 255, 255, 0.2)',
        'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.4)'
      };
    } else if (event.type === 'trainer_class') {
      return {
        'background': 'linear-gradient(135deg, #7c3aed, #a855f7)',
        'color': 'white',
        'border': '1px solid rgba(255, 255, 255, 0.2)',
        'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.4)'
      };
    } else if (event.type === 'room_reservation') {
      return {
        'background': 'linear-gradient(135deg, #166534, #22c55e)',
        'color': 'white',
        'border': '1px solid rgba(255, 255, 255, 0.2)',
        'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.4)'
      };
    }
    return {};
  }

  getMonthYearString(): string {
    return `${this.monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }

  openReservationsModal(date: Date, events: CalendarEvent[]) {
    console.log('openReservationsModal called with:', { date, events });
    
    // Debug each event to see its structure
    events.forEach((event, index) => {
      console.log(`Event ${index}:`, {
        id: event.id,
        type: event.type,
        title: event.title,
        meta: event.meta,
        userReservation: event.meta?.userReservation,
        hasUserReservation: !!event.meta?.userReservation?.id,
        isRoomReservation: event.type === 'room_reservation'
      });
    });
    
    // Create simple HTML modal
    const modal = document.createElement('div');
    modal.className = 'simple-modal-overlay';
    modal.innerHTML = `
      <div class="simple-modal">
        <div class="simple-modal-header">
          <h3>📅 Rezerwacje na ${date.toLocaleDateString('pl-PL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h3>
          <button class="close-btn" onclick="this.closest('.simple-modal-overlay').remove()">×</button>
        </div>
        <div class="simple-modal-content">
          ${events.map(event => `
            <div class="reservation-item">
              <div class="reservation-info">
                <div class="reservation-title">${event.title}</div>
                <div class="reservation-details">
                  <span class="time">${event.start.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                  ${event.roomName ? `<span class="room">• ${event.roomName}</span>` : ''}
                  ${event.trainerName ? `<span class="trainer">• ${event.trainerName}</span>` : ''}
                </div>
              </div>
              ${(() => {
                // Show delete button if:
                // 1. It's a room reservation (user can always delete their room reservations)
                // 2. It's a fitness class and user has a reservation (either userReservation.id or reservationId exists)
                const shouldShowDelete = event.type === 'room_reservation' || 
                                       event.meta?.userReservation?.id || 
                                       (event.type === 'fitness_class' && event.meta?.reservationId);
                console.log(`Delete button for ${event.title}:`, {
                  type: event.type,
                  hasUserReservation: !!event.meta?.userReservation?.id,
                  hasReservationId: !!event.meta?.reservationId,
                  reservationId: event.meta?.reservationId,
                  userReservation: event.meta?.userReservation,
                  fullMeta: event.meta,
                  shouldShow: shouldShowDelete
                });
                return shouldShowDelete ? `<button class="delete-btn" data-id="${event.id.replace('room-', '').replace('class-', '')}" data-type="${event.type}" data-reservation-id="${event.meta?.userReservation?.id || event.meta?.reservationId || ''}" title="Usuń rezerwację">🗑️</button>` : '';
              })()}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Add styles
      const style = document.createElement('style');
      style.setAttribute('data-modal-style', 'reservations');
      style.textContent = `
      .simple-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .simple-modal {
        background: white;
        border-radius: 16px;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
        max-width: 600px;
        width: 95%;
        max-height: 85vh;
        overflow: hidden;
      }
      
      .simple-modal-header {
        background: linear-gradient(135deg, #8e2de2, #4a00e0);
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .simple-modal-header h3 {
        margin: 0;
        font-size: 18px;
      }
      
      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      }
      
      .close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .simple-modal-content {
        padding: 24px;
        max-height: 70vh;
        overflow-y: auto;
      }
      
      .reservation-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
        border-bottom: 1px solid #eee;
        transition: background 0.2s ease;
      }
      
      .reservation-item:hover {
        background: rgba(142, 45, 226, 0.05);
        border-radius: 8px;
        margin: 0 -12px;
        padding: 20px 12px;
      }
      
      .reservation-item:last-child {
        border-bottom: none;
      }
      
      .reservation-title {
        font-weight: 600;
        font-size: 18px;
        color: #333;
        margin-bottom: 6px;
      }
      
      .reservation-details {
        color: #666;
        font-size: 15px;
        line-height: 1.4;
      }
      
      .time {
        font-weight: 500;
        color: #1976d2;
      }
      
      .room, .trainer {
        margin-left: 8px;
      }
      
      .delete-btn {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 10px 14px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
      }
      
      .delete-btn:hover {
        background: linear-gradient(135deg, #ee5a52, #e74c3c);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Test if function is available
    console.log('🗑️ Testing if deleteReservationDirect is available:', typeof (window as any).deleteReservationDirect);
    
    // Add event listeners to delete buttons
    const deleteButtons = modal.querySelectorAll('.delete-btn');
    console.log('🗑️ Found delete buttons:', deleteButtons.length);
    
    deleteButtons.forEach((btn, index) => {
      console.log(`🗑️ Adding event listener to button ${index}:`, btn);
      btn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const id = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');
        const reservationId = btn.getAttribute('data-reservation-id');
        
        console.log('🗑️ Delete button clicked with:', { id, type, reservationId, button: btn });
        
        if (!id || !type) {
          console.error('Missing id or type for deletion');
          return;
        }
        
        // Show confirmation modal
        console.log('🗑️ Calling showDeleteConfirmation...');
        this.showDeleteConfirmation(id, type, 'Rezerwacja', modal, style, date, reservationId || undefined);
      });
    });
    
    // Add direct delete function to window
    (window as any).deleteReservationDirect = async (id: string, type: string, reservationId?: string) => {
      console.log('🗑️ deleteReservationDirect called with:', { id, type, reservationId });
      
      // Show loading message
      this.showSuccessMessage('🗑️ Usuwanie rezerwacji...');
      
        // Delete in background
        try {
          if (type === 'room_reservation') {
            console.log('🗑️ Deleting room reservation with ID:', id);
            await this.reservationsService.deleteRoomReservation(id).toPromise();
          } else {
            // For fitness classes, use reservationId if available, otherwise use id
            const actualReservationId = reservationId || id;
            console.log('🗑️ Deleting class reservation with ID:', actualReservationId);
            await this.reservationsService.deleteClassReservation(actualReservationId).toPromise();
          }
          console.log('✅ Reservation deleted successfully in background');
          
          // Update the events array to remove the deleted reservation
          const deletedEventId = type === 'room_reservation' ? `room-${id}` : `class-${id}`;
          const originalEvents = [...this.events];
          this.events = originalEvents.filter(event => event.id !== deletedEventId);
          
          // Regenerate calendar with updated events
          this.generateCalendar();
          
          // Close modal after successful deletion
          const allModals = document.querySelectorAll('.confirm-modal-overlay, .reservations-modal-overlay');
          allModals.forEach(m => m.remove());
          const allStyles = document.querySelectorAll('style[data-modal-style]');
          allStyles.forEach(s => s.remove());
          
          // Show success message
          this.showSuccessMessage('✅ Rezerwacja została usunięta pomyślnie!');
          
          // Force calendar refresh without page reload
          this.reservationDeleted.emit();
          
          // Also refresh after a short delay
          setTimeout(() => {
            this.reservationDeleted.emit();
          }, 200);
          
        } catch (error) {
          console.error('Error deleting reservation:', error);
          this.showErrorMessage('❌ Błąd podczas usuwania rezerwacji');
        }
    };
    
    // Add delete function to window (for backward compatibility)
    (window as any).deleteReservation = async (id: string, type: string, reservationId?: string) => {
      // Create beautiful confirmation dialog
      const confirmModal = document.createElement('div');
      confirmModal.className = 'confirm-modal-overlay';
      confirmModal.innerHTML = `
        <div class="confirm-modal">
          <div class="confirm-icon">!</div>
          <h3>Usuń rezerwację</h3>
          <p>Czy na pewno chcesz usunąć tę rezerwację?</p>
          <p class="confirm-warning">Ta akcja nie może zostać cofnięta.</p>
          <div class="confirm-buttons">
            <button class="cancel-btn" onclick="this.closest('.confirm-modal-overlay').remove()">Anuluj</button>
            <button class="delete-confirm-btn" data-id="${id}" data-type="${type}" data-reservation-id="${reservationId || ''}">Tak, usuń</button>
          </div>
        </div>
      `;
      
      // Add confirmation styles
      const confirmStyle = document.createElement('style');
      confirmStyle.setAttribute('data-modal-style', 'confirm');
      confirmStyle.textContent = `
        .confirm-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1001;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .confirm-modal {
          background: linear-gradient(135deg, #faf7ff 0%, #f3f0ff 100%);
          border-radius: 24px;
          box-shadow: 0 32px 64px rgba(142, 45, 226, 0.15);
          border: 2px solid rgba(142, 45, 226, 0.2);
          max-width: 420px;
          width: 90%;
          padding: 36px;
          text-align: center;
          animation: modalSlideIn 0.3s ease-out;
          position: relative;
          overflow: hidden;
        }
        
        .confirm-modal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #8e2de2, #4a00e0, #8e2de2);
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .confirm-icon {
          font-size: 48px;
          margin-bottom: 16px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8e2de2, #4a00e0);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(142, 45, 226, 0.3);
        }
        
        .confirm-modal h3 {
          margin: 0 0 12px 0;
          color: #4a00e0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .confirm-modal p {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 16px;
          line-height: 1.5;
        }
        
        .confirm-warning {
          color: #8e2de2 !important;
          font-weight: 500;
          font-size: 14px;
          background: rgba(142, 45, 226, 0.1);
          padding: 8px 12px;
          border-radius: 8px;
          margin: 12px 0;
          border: 1px solid rgba(142, 45, 226, 0.2);
        }
        
        .confirm-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          justify-content: center;
        }
        
        .cancel-btn, .delete-confirm-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
        }
        
        .cancel-btn {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          color: #6c757d;
          border: 1px solid rgba(142, 45, 226, 0.2);
        }
        
        .cancel-btn:hover {
          background: linear-gradient(135deg, #e9ecef, #dee2e6);
          transform: translateY(-1px);
          border-color: rgba(142, 45, 226, 0.3);
        }
        
        .delete-confirm-btn {
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
        
        .delete-confirm-btn:hover {
          background: linear-gradient(135deg, #ee5a52, #e74c3c);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
        }
        
        .delete-confirm-btn:disabled {
          background: linear-gradient(135deg, #ccc, #999);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `;
      
      document.head.appendChild(confirmStyle);
      document.body.appendChild(confirmModal);
      
      // Add event listener directly to the delete button
      const deleteBtn = confirmModal.querySelector('.delete-confirm-btn') as HTMLButtonElement;
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          const id = deleteBtn.getAttribute('data-id');
          const type = deleteBtn.getAttribute('data-type');
          const reservationId = deleteBtn.getAttribute('data-reservation-id');
          
          console.log('🗑️ Delete button clicked with:', { id, type, reservationId });
          
          if (!id || !type) {
            console.error('Missing id or type for deletion');
            return;
          }
          
          // Show loading state
          deleteBtn.textContent = 'Usuwanie...';
          deleteBtn.disabled = true;
          
          // Remove modals immediately for better UX
          console.log('🗑️ Removing modals...');
          try {
            confirmModal.remove();
            confirmStyle.remove();
            modal.remove();
            style.remove();
            console.log('✅ Modals removed successfully');
          } catch (error) {
            console.error('Error removing modals:', error);
            // Alternative removal method
            const allModals = document.querySelectorAll('.confirm-modal-overlay, .reservations-modal-overlay');
            allModals.forEach(m => m.remove());
            const allStyles = document.querySelectorAll('style[data-modal-style]');
            allStyles.forEach(s => s.remove());
            console.log('✅ Modals removed with alternative method');
          }
          
          // Delete in background and refresh calendar
          try {
            if (type === 'room_reservation') {
              console.log('🗑️ Deleting room reservation with ID:', id);
              await this.reservationsService.deleteRoomReservation(id).toPromise();
            } else {
              // For fitness classes, use reservationId if available, otherwise use id
              const actualReservationId = reservationId || id;
              console.log('🗑️ Deleting class reservation with ID:', actualReservationId);
              await this.reservationsService.deleteClassReservation(actualReservationId).toPromise();
            }
            console.log('✅ Reservation deleted successfully in background');
            
            // Show success message only after successful deletion
            this.showSuccessMessage('✅ Rezerwacja została usunięta pomyślnie!');
            
            // Update the events array to remove the deleted reservation
            const deletedEventId = type === 'room_reservation' ? `room-${id}` : `class-${id}`;
            const originalEvents = [...this.events];
            this.events = originalEvents.filter(event => event.id !== deletedEventId);
            
            // Regenerate calendar with updated events
            this.generateCalendar();
            
            // Remove modals after successful deletion
            try {
              confirmModal.remove();
              confirmStyle.remove();
              modal.remove();
              style.remove();
              console.log('✅ Modals removed successfully');
            } catch (error) {
              console.error('Error removing modals:', error);
              // Alternative removal method
              const allModals = document.querySelectorAll('.confirm-modal-overlay, .reservations-modal-overlay');
              allModals.forEach(m => m.remove());
              const allStyles = document.querySelectorAll('style[data-modal-style]');
              allStyles.forEach(s => s.remove());
              console.log('✅ Modals removed with alternative method');
            }
            
            // Force calendar refresh
            this.reservationDeleted.emit();
            
            // Also trigger change detection manually
            setTimeout(() => {
              this.reservationDeleted.emit();
            }, 100);
            
          } catch (error) {
            console.error('Error deleting reservation:', error);
            this.showErrorMessage('❌ Błąd podczas usuwania rezerwacji');
          }
        });
        
        console.log('🗑️ Event listener added to delete button');
      }
    };
  }

  private showDeleteConfirmation(id: string, type: string, title: string, parentModal: HTMLElement, parentStyle: HTMLElement, date: Date, reservationId?: string) {
    console.log('🗑️ showDeleteConfirmation called with:', { id, type, title, parentModal, parentStyle, reservationId });
    
    // Create confirmation modal
    const confirmModal = document.createElement('div');
    confirmModal.className = 'confirm-modal-overlay';
    confirmModal.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-icon">!</div>
        <h3>Usuń rezerwację</h3>
        <p>Czy na pewno chcesz usunąć tę rezerwację?</p>
        <p class="confirm-warning">Ta akcja nie może zostać cofnięta.</p>
        <div class="confirm-buttons">
          <button class="cancel-btn" onclick="this.closest('.confirm-modal-overlay').remove()">Anuluj</button>
          <button class="delete-confirm-btn" data-id="${id}" data-type="${type}" data-reservation-id="${reservationId || ''}">Tak, usuń</button>
        </div>
      </div>
    `;
    
    // Add confirmation styles
    const confirmStyle = document.createElement('style');
    confirmStyle.setAttribute('data-modal-style', 'confirm');
    confirmStyle.textContent = `
      .confirm-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1001;
        animation: modalSlideIn 0.3s ease-out;
      }
      
      .confirm-modal {
        background: linear-gradient(135deg, #ffffff, #f8f9fa);
        border-radius: 20px;
        padding: 32px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(142, 45, 226, 0.1);
        max-width: 400px;
        width: 90%;
        position: relative;
        overflow: hidden;
      }
      
      .confirm-modal::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #8e2de2, #4a00e0, #8e2de2);
        background-size: 200% 100%;
        animation: shimmer 2s ease-in-out infinite;
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.8) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      .confirm-icon {
        font-size: 48px;
        margin-bottom: 16px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8e2de2, #4a00e0);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px auto;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(142, 45, 226, 0.3);
      }
      
      .confirm-modal h3 {
        margin: 0 0 12px 0;
        color: #4a00e0;
        font-size: 24px;
        font-weight: 600;
      }
      
      .confirm-modal p {
        margin: 0 0 8px 0;
        color: #666;
        font-size: 16px;
        line-height: 1.5;
      }
      
      .confirm-warning {
        color: #8e2de2 !important;
        font-weight: 500;
        font-size: 14px;
        background: rgba(142, 45, 226, 0.1);
        padding: 8px 12px;
        border-radius: 8px;
        margin: 12px 0;
        border: 1px solid rgba(142, 45, 226, 0.2);
      }
      
      .confirm-buttons {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        justify-content: center;
      }
      
      .cancel-btn, .delete-confirm-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 100px;
      }
      
      .cancel-btn {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        color: #6c757d;
        border: 1px solid rgba(142, 45, 226, 0.2);
      }
      
      .cancel-btn:hover {
        background: linear-gradient(135deg, #e9ecef, #dee2e6);
        transform: translateY(-1px);
        border-color: rgba(142, 45, 226, 0.3);
      }
      
      .delete-confirm-btn {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
      }
      
      .delete-confirm-btn:hover {
        background: linear-gradient(135deg, #ee5a52, #e74c3c);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
      }
      
      .delete-confirm-btn:disabled {
        background: linear-gradient(135deg, #ccc, #999);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    `;
    
    document.head.appendChild(confirmStyle);
    document.body.appendChild(confirmModal);
    
    // Add event listener directly to the delete button
    const deleteBtn = confirmModal.querySelector('.delete-confirm-btn') as HTMLButtonElement;
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        const id = deleteBtn.getAttribute('data-id');
        const type = deleteBtn.getAttribute('data-type');
        const reservationId = deleteBtn.getAttribute('data-reservation-id');
        
        console.log('🗑️ Delete button clicked with:', { id, type, reservationId });
        
        if (!id || !type) {
          console.error('Missing id or type for deletion');
          return;
        }
        
        // Show loading state
        deleteBtn.textContent = 'Usuwanie...';
        deleteBtn.disabled = true;
        
        // Delete in background first
        try {
          if (type === 'room_reservation') {
            console.log('🗑️ Deleting room reservation with ID:', id);
            await this.reservationsService.deleteRoomReservation(id).toPromise();
          } else {
            // For fitness classes, use reservationId if available, otherwise use id
            const actualReservationId = reservationId || id;
            console.log('🗑️ Deleting class reservation with ID:', actualReservationId);
            await this.reservationsService.deleteClassReservation(actualReservationId).toPromise();
          }
          console.log('✅ Reservation deleted successfully in background');
          
          // Update the events array to remove the deleted reservation
          const deletedEventId = type === 'room_reservation' ? `room-${id}` : `class-${id}`;
          const originalEvents = [...this.events];
          this.events = originalEvents.filter(event => event.id !== deletedEventId);
          
          // Regenerate calendar with updated events
          this.generateCalendar();
          
          // Remove only confirmation modal, keep main modal open
          console.log('🗑️ Removing confirmation modal...');
          try {
            confirmModal.remove();
            confirmStyle.remove();
            console.log('✅ Confirmation modal removed successfully');
          } catch (error) {
            console.error('Error removing confirmation modal:', error);
          }
          
          // Show success message
          this.showSuccessMessage('✅ Rezerwacja została usunięta pomyślnie!');
          
          // Refresh the main modal with updated events
          this.refreshModalContent(parentModal, date);
          
          // Force calendar refresh immediately
          this.reservationDeleted.emit();
          
          // Also trigger change detection manually
          setTimeout(() => {
            this.reservationDeleted.emit();
          }, 100);
          
        } catch (error) {
          console.error('Error deleting reservation:', error);
          this.showErrorMessage('❌ Błąd podczas usuwania rezerwacji');
        }
      });
      
      console.log('🗑️ Event listener added to delete button');
    }
  }

  private showSuccessMessage(message: string) {
    this.showToast(message, 'success');
  }

  private showErrorMessage(message: string) {
    this.showToast(message, 'error');
  }

  private refreshModalContent(modal: HTMLElement, date: Date) {
    console.log('🔄 Refreshing modal content for date:', date);
    
    // Get updated events for this date
    const dayEvents = this.getEventsForDate(date);
    console.log('🔄 Updated events for modal:', dayEvents);
    
    // Update the modal content
    const modalContent = modal.querySelector('.simple-modal-content');
    if (modalContent) {
      modalContent.innerHTML = dayEvents.map(event => `
        <div class="reservation-item">
          <div class="reservation-info">
            <div class="reservation-title">${event.title}</div>
            <div class="reservation-details">
              <span class="time">${event.start.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
              ${event.roomName ? `<span class="room">• ${event.roomName}</span>` : ''}
              ${event.trainerName ? `<span class="trainer">• ${event.trainerName}</span>` : ''}
            </div>
          </div>
          <button class="delete-btn" data-id="${event.id.replace('room-', '').replace('class-', '')}" data-type="${event.type}" title="Usuń rezerwację">🗑️</button>
        </div>
      `).join('');
      
      // Re-add event listeners to the new delete buttons
      const deleteButtons = modalContent.querySelectorAll('.delete-btn');
      console.log('🔄 Re-adding event listeners to', deleteButtons.length, 'delete buttons');
      
      deleteButtons.forEach((btn, index) => {
        console.log(`🔄 Adding event listener to button ${index}:`, btn);
        btn.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();
          
          const id = btn.getAttribute('data-id');
          const type = btn.getAttribute('data-type');
          
          console.log('🗑️ Delete button clicked with:', { id, type, button: btn });
          
          if (!id || !type) {
            console.error('Missing id or type for deletion');
            return;
          }
          
          // Show confirmation modal
          console.log('🗑️ Calling showDeleteConfirmation...');
          this.showDeleteConfirmation(id, type, 'Rezerwacja', modal, modal.querySelector('style[data-modal-style="reservations"]') as HTMLElement, date);
        });
      });
    }
  }

  private showToast(message: string, type: 'success' | 'error') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    
    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1002;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        animation: toastSlideIn 0.3s ease-out;
        max-width: 400px;
        min-width: 300px;
      }
      
      @keyframes toastSlideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .toast-success {
        background: linear-gradient(135deg, #4caf50, #45a049);
        color: white;
      }
      
      .toast-error {
        background: linear-gradient(135deg, #f44336, #d32f2f);
        color: white;
      }
      
      .toast-content {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        gap: 12px;
      }
      
      .toast-icon {
        font-size: 20px;
      }
      
      .toast-message {
        font-size: 16px;
        font-weight: 500;
        flex: 1;
      }
    `;
    
    document.head.appendChild(toastStyle);
    document.body.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
      setTimeout(() => {
        toast.remove();
        toastStyle.remove();
      }, 300);
    }, 4000);
    
    // Add slide out animation
    const slideOutStyle = document.createElement('style');
    slideOutStyle.textContent = `
      @keyframes toastSlideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }
    `;
    document.head.appendChild(slideOutStyle);
  }
}

