import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ReservationsService } from './services/reservations.service';
import { AddEditReservationDialogComponent } from './components/add-edit-reservation-dialog/add-edit-reservation-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    AddEditReservationDialogComponent
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent implements OnInit {
  reservations$: Observable<any[]> = this.reservationsService.items$;
  loading$: Observable<boolean> = this.reservationsService.loading$;
  error$: Observable<HttpErrorResponse | null> = this.reservationsService.error$;
  displayedColumns: string[] = ['id', 'Username', 'ClassTitle','Localization','RoomName', 'Status', 'actions'];

  constructor(private reservationsService: ReservationsService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.reservationsService.getReservations().subscribe();
  }

  add(): void {
    this.dialog.open(AddEditReservationDialogComponent);
  }

  edit(reservation: any): void {
    this.dialog.open(AddEditReservationDialogComponent, {
      data: {
        reservation,
        isEdit: true
      }
    });
  }

  delete(reservationId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.reservationsService.deleteReservation(reservationId).subscribe();
      }
    });
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return '✅ Potwierdzona';
      case 'pending': return '⏳ Oczekująca';
      case 'cancelled': return '❌ Anulowana';
      case 'zarezerwowano': return '✅ Zarezerwowano';
      case 'rezerwacja': return '📝 Rezerwacja';
      case 'active': return '✅ Aktywna';
      default: return status;
    }
  }
}
