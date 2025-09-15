import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RoomsService } from './services/rooms.service';
import { Observable, of } from 'rxjs';
import { AddEditUserDialogComponent } from '../users/components/add-edit-user-dialog/add-edit-user-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AddEditRoomDialogComponent } from './components/add-edit-room-dialog/add-edit-room-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { UserService } from '../../../../shared/services/user.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    AddEditUserDialogComponent,
    MatIconModule
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit{
  // rooms$: Observable<any[]> = of([
  //   {
  //     "RoomID": 1,
  //     "RoomName": "Salka 1",
  //     "Capacity": 20,
  //     "Location": "Berlin"
  // },
  // {
  //     "RoomID": 2,
  //     "RoomName": "Sala 2",
  //     "Capacity": 30,
  //     "Location": "Bremen"
  // }
  // ]);
  rooms$: Observable<any[]> = this.roomsService.items$;
  loading$: Observable<boolean> = this.roomsService.loading$;
  error$: Observable<HttpErrorResponse|null> = this.roomsService.error$;
  displayedColumns: string[] = ['id', 'RoomName', 'Capacity', 'Lokalizacja', 'actions'];
  constructor(
    private roomsService: RoomsService, 
    private dialog: MatDialog, 
    private router: Router,
    private userService: UserService
  ) {};
  
  ngOnInit(): void {
    this.roomsService.getRooms().subscribe((rooms)=>{
      console.log(rooms)
    })
  }

  add(): void {
      const dialogRef = this.dialog.open(AddEditRoomDialogComponent);
    }

  delete(roomId: number): void {
    // Znajdź salę do usunięcia z aktualnej listy
    this.rooms$.subscribe(rooms => {
      const room = rooms?.find((r: any) => r.RoomID === roomId);
      if (room) {
        this.showDeleteConfirmation(room);
      }
    }).unsubscribe();
  }

  private showDeleteConfirmation(room: any): void {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 0;
      max-width: 500px;
      width: 90vw;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    `;

    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">Usuń salę</h2>
        <p style="margin: 0; opacity: 0.9;">Ta operacja jest nieodwracalna</p>
      </div>
      
      <div style="padding: 24px;">
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 16px;">
            <span style="font-size: 20px; margin-right: 12px;">🏢</span>
            <span style="color: #64748b; font-weight: 500; min-width: 80px;">Nazwa:</span>
            <span style="color: #1a202c; font-weight: 600;">${room.RoomName}</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 16px;">
            <span style="font-size: 20px; margin-right: 12px;">📍</span>
            <span style="color: #64748b; font-weight: 500; min-width: 80px;">Lokalizacja:</span>
            <span style="color: #1a202c; font-weight: 600;">${room.Location}</span>
          </div>
          <div style="display: flex; align-items: center; font-size: 16px;">
            <span style="font-size: 20px; margin-right: 12px;">👥</span>
            <span style="color: #64748b; font-weight: 500; min-width: 80px;">Pojemność:</span>
            <span style="color: #1a202c; font-weight: 600;">${room.Capacity} osób</span>
          </div>
        </div>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; display: flex; align-items: flex-start; gap: 12px;">
          <span style="font-size: 24px; flex-shrink: 0;">⚠️</span>
          <p style="color: #dc2626; margin: 0; font-size: 14px; line-height: 1.5;">Czy na pewno chcesz usunąć tę salę? Wszystkie powiązane rezerwacje i zajęcia zostaną również usunięte.</p>
        </div>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 16px; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
        <button class="cancel-btn" style="
          background: white;
          color: #64748b;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">Anuluj</button>
        <button class="confirm-btn" style="
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          transition: all 0.3s ease;
        ">Usuń salę</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add event listeners
    const cancelBtn = modal.querySelector('.cancel-btn');
    const confirmBtn = modal.querySelector('.confirm-btn');

    const closeModal = () => {
      document.body.removeChild(overlay);
    };

    cancelBtn?.addEventListener('click', closeModal);
    confirmBtn?.addEventListener('click', () => {
      closeModal();
      this.performRoomDeletion(room.RoomID);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }

  private performRoomDeletion(roomId: number): void {
    console.log('Rozpoczynam usuwanie sali o ID:', roomId);
    this.roomsService.deleteRoom(roomId).subscribe({
      next: (response) => {
        console.log('Odpowiedź z backendu po usunięciu sali:', response);
        console.log('Sala została usunięta');
        // Lista sal zostanie automatycznie odświeżona przez serwis
        // Można dodać snackbar z potwierdzeniem
      },
      error: (error) => {
        console.error('Błąd podczas usuwania sali:', error);
        console.error('Szczegóły błędu:', error.status, error.message);
        // Można dodać snackbar z błędem
      }
    });
  }
  
  edit(room: any): void {
    const dialogRef = this.dialog.open(AddEditRoomDialogComponent, {
      data: {
        room: room,
        isEdit: true
      }
    })
  }

  viewCalendar(roomId: number): void {
    this.router.navigate(['/dashboard/rooms', roomId, 'calendar']);
  }

  canManageRooms(): boolean {
    const currentUser = this.userService.getCurrentUserValue();
    return currentUser?.Role === 'admin' || currentUser?.Role === 'receptionist';
  }
}