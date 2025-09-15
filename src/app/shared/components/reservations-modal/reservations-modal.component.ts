import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReservationsService } from '../../../pages/dashboard/pages/reservations/services/reservations.service';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'fitness_class' | 'room_reservation';
  roomName?: string;
  trainerName?: string;
  status: string;
}

@Component({
  selector: 'app-reservations-modal',
  template: `
    <h2 mat-dialog-title>
      <mat-icon>event</mat-icon>
      Rezerwacje na {{ formatDate(data.date) }}
    </h2>
    
    <mat-dialog-content>
      <mat-list *ngIf="data.events.length > 0; else noEvents">
        <mat-list-item *ngFor="let event of data.events; let i = index">
          <mat-icon mat-list-icon [class]="getEventIconClass(event.type)">
            {{ getEventIcon(event.type) }}
          </mat-icon>
          
          <div mat-line class="event-title">{{ event.title }}</div>
          <div mat-line class="event-details">
            <span class="time">{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
            <span *ngIf="event.roomName" class="room">• {{ event.roomName }}</span>
            <span *ngIf="event.trainerName" class="trainer">• {{ event.trainerName }}</span>
          </div>
          
          <button mat-icon-button 
                  color="warn" 
                  (click)="deleteReservation(event)"
                  [disabled]="isDeleting"
                  matTooltip="Usuń rezerwację">
            <mat-icon>delete</mat-icon>
          </button>
          
          <mat-divider *ngIf="i < data.events.length - 1"></mat-divider>
        </mat-list-item>
      </mat-list>
      
      <ng-template #noEvents>
        <div class="no-events">
          <mat-icon>event_busy</mat-icon>
          <p>Brak rezerwacji na ten dzień</p>
        </div>
      </ng-template>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Zamknij</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      z-index: 1000;
    }
    
    .event-title {
      font-weight: 500;
      font-size: 16px;
      color: #333;
    }
    
    .event-details {
      color: #666;
      font-size: 14px;
      margin-top: 4px;
    }
    
    .time {
      font-weight: 500;
      color: #1976d2;
    }
    
    .room, .trainer {
      margin-left: 8px;
      color: #666;
    }
    
    .no-events {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }
    
    .no-events mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }
    
    .fitness-class-icon {
      color: #3b82f6 !important;
    }
    
    .room-reservation-icon {
      color: #22c55e !important;
    }
    
    mat-list-item {
      border-bottom: 1px solid #eee;
      padding: 12px 0;
    }
    
    mat-list-item:last-child {
      border-bottom: none;
    }
    
    button[mat-icon-button] {
      margin-left: auto;
    }
    
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
      margin-bottom: 16px;
    }
    
    h2[mat-dialog-title] mat-icon {
      color: #1976d2;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule
  ]
})
export class ReservationsModalComponent {
  isDeleting = false;

  constructor(
    public dialogRef: MatDialogRef<ReservationsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { date: Date; events: CalendarEvent[] },
    private reservationsService: ReservationsService,
    private snackBar: MatSnackBar
  ) {}

  formatDate(date: Date): string {
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEventIcon(type: string): string {
    return type === 'fitness_class' ? 'fitness_center' : 'meeting_room';
  }

  getEventIconClass(type: string): string {
    return type === 'fitness_class' ? 'fitness-class-icon' : 'room-reservation-icon';
  }

  async deleteReservation(event: CalendarEvent) {
    if (this.isDeleting) return;
    
    const confirmed = confirm(`Czy na pewno chcesz usunąć rezerwację "${event.title}"?`);
    if (!confirmed) return;

    this.isDeleting = true;
    
    try {
      if (event.type === 'room_reservation') {
        await this.reservationsService.deleteRoomReservation(event.id).toPromise();
      } else {
        await this.reservationsService.deleteClassReservation(event.id).toPromise();
      }
      
      this.dialogRef.close('deleted');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      this.snackBar.open('Błąd podczas usuwania rezerwacji', 'Zamknij', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isDeleting = false;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
